import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, getTierFromPriceId } from '@/lib/stripe'
import { updateSubscriptionTier } from '@/lib/subscription-utils'
import { query } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }
    
    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    console.log('Received Stripe webhook:', event.type)
    
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
        
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Handling subscription created:', subscription.id)
    
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0].price.id
    
    // Get tier from price ID
    const tier = getTierFromPriceId(priceId)
    if (!tier) {
      console.error('Unknown price ID:', priceId)
      return
    }
    
    // Find user by customer ID
    const userResult = await query(
      'SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1',
      [customerId]
    )
    
    if (userResult.rows.length === 0) {
      console.error('No user found for customer:', customerId)
      return
    }
    
    const userId = userResult.rows[0].user_id
    
    // Safely convert Unix timestamp to Date
    let subscriptionExpiresAt: Date | undefined
    try {
      if (subscription.current_period_end) {
        subscriptionExpiresAt = new Date(subscription.current_period_end * 1000)
        // Validate the date is valid
        if (isNaN(subscriptionExpiresAt.getTime())) {
          console.warn('Invalid subscription expiration date, setting to undefined')
          subscriptionExpiresAt = undefined
        }
      }
    } catch (error) {
      console.warn('Error converting subscription expiration date:', error)
      subscriptionExpiresAt = undefined
    }
    
    // Update subscription
    await updateSubscriptionTier(
      userId,
      tier,
      customerId,
      subscription.id,
      subscriptionExpiresAt
    )

    // Log subscription event
    await query(`
      INSERT INTO subscription_events (user_id, event_type, event_data)
      VALUES ($1, 'created', $2)
    `, [
      userId,
      JSON.stringify({
        tier,
        customerId,
        subscriptionId: subscription.id,
        expiresAt: subscriptionExpiresAt
      })
    ]);

    // Add to billing history
    await query(`
      INSERT INTO billing_history (
        user_id,
        amount,
        transaction_type,
        status,
        description,
        reference_id,
        payment_method
      )
      VALUES ($1, $2, 'subscription', 'active', $3, $4, $5)
    `, [
      userId,
      subscription.items.data[0]?.price?.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0,
      `New subscription created: ${tier} plan`,
      subscription.id,
      'card' // Default to card as it's through Stripe Checkout
    ])
    
    console.log(`Subscription created for user ${userId}: ${tier}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Handling subscription updated:', subscription.id)
    
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0].price.id
    
    // Get tier from price ID
    const tier = getTierFromPriceId(priceId)
    if (!tier) {
      console.error('Unknown price ID:', priceId)
      return
    }
    
    // Find user by customer ID
    const userResult = await query(
      'SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1',
      [customerId]
    )
    
    if (userResult.rows.length === 0) {
      console.error('No user found for customer:', customerId)
      return
    }
    
    const userId = userResult.rows[0].user_id
    
    // Get current period end from Stripe subscription
    let subscriptionExpiresAt: string | null = null
    try {
      // Log the raw value for debugging
      console.log('Raw current_period_end:', subscription.current_period_end)
      
      if (subscription.current_period_end) {
        // Stripe sends timestamps in seconds, convert to milliseconds
        const timestamp = subscription.current_period_end * 1000;
          
        const expiresAtDate = new Date(timestamp)
        
        // Log the converted date for debugging
        console.log('Converted date:', expiresAtDate)
        
        // Validate the date is valid
        if (!isNaN(expiresAtDate.getTime())) {
          subscriptionExpiresAt = expiresAtDate.toISOString()
          console.log('Final ISO string:', subscriptionExpiresAt)
        } else {
          console.warn('Invalid date conversion result')
        }
      } else {
        console.warn('No current_period_end provided by Stripe')
      }
    } catch (error) {
      console.error('Error processing subscription expiration date:', error)
    }
    
    // Update subscription
    await query(`
      UPDATE subscriptions 
      SET tier = $1, 
          status = $2,
          stripe_subscription_id = $3,
          subscription_expires_at = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
    `, [
      tier,
      subscription.status === 'active' ? 'active' : 'cancelled',
      subscription.id,
      subscriptionExpiresAt,
      userId
    ])

    // Log subscription event
    await query(`
      INSERT INTO subscription_events (user_id, event_type, event_data)
      VALUES ($1, 'updated', $2)
    `, [
      userId,
      JSON.stringify({
        tier,
        status: subscription.status,
        subscriptionId: subscription.id,
        expiresAt: subscriptionExpiresAt,
        previousTier: (await query('SELECT tier FROM subscriptions WHERE user_id = $1', [userId])).rows[0]?.tier
      })
    ])
    
    console.log(`Subscription updated for user ${userId}: ${tier} (${subscription.status})`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Handling subscription deleted:', subscription.id)
    
    // Find user by subscription ID
    const userResult = await query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    )
    
    if (userResult.rows.length === 0) {
      console.error('No user found for subscription:', subscription.id)
      return
    }
    
    const userId = userResult.rows[0].user_id
    
    // Get current tier before update
    const currentTier = (await query('SELECT tier FROM subscriptions WHERE user_id = $1', [userId])).rows[0]?.tier

    // Revert to trial status (expired) and clear Stripe IDs
    await query(`
      UPDATE subscriptions 
      SET tier = 'trial',
          status = 'expired',
          stripe_subscription_id = NULL,
          stripe_customer_id = NULL,
          subscription_expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `, [userId])

    // Log subscription event
    await query(`
      INSERT INTO subscription_events (user_id, event_type, event_data)
      VALUES ($1, 'cancelled', $2)
    `, [
      userId,
      JSON.stringify({
        previousTier: currentTier,
        subscriptionId: subscription.id
      })
    ]);

    // Add to billing history
    await query(`
      INSERT INTO billing_history (
        user_id,
        amount,
        transaction_type,
        status,
        description,
        reference_id,
        payment_method
      )
      VALUES ($1, 0, 'subscription', 'completed', $2, $3, $4)
    `, [
      userId,
      `Subscription cancelled: ${currentTier} plan`,
      subscription.id,
      'card'
    ])
    
    console.log(`Subscription cancelled for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Handling payment succeeded:', invoice.id)
    
    if (invoice.subscription) {
      // Find user by subscription ID
      const userResult = await query(
        'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
        [invoice.subscription]
      )
      
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].user_id
        
        // Update subscription status to active
        await query(`
          UPDATE subscriptions 
          SET status = 'active',
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [userId])

        // Log subscription event
        await query(`
          INSERT INTO subscription_events (user_id, event_type, event_data)
          VALUES ($1, 'payment_succeeded', $2)
        `, [
          userId,
          JSON.stringify({
            invoiceId: invoice.id,
            amount: invoice.amount_paid,
            subscriptionId: invoice.subscription
          })
        ]);

        // Add to billing history
        await query(`
          INSERT INTO billing_history (
            user_id,
            amount,
            transaction_type,
            status,
            description,
            reference_id,
            payment_method
          )
          VALUES ($1, $2, 'subscription', 'completed', $3, $4, $5)
        `, [
          userId,
          invoice.amount_paid / 100, // Convert cents to dollars
          `Subscription payment for ${invoice.lines.data[0]?.price?.nickname || 'plan'}`,
          invoice.id,
          invoice.payment_intent ? 'card' : invoice.payment_method_types[0] || 'unknown'
        ]);
        
        console.log(`Payment succeeded for user ${userId}`)
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Handling payment failed:', invoice.id)
    
    if (invoice.subscription) {
      // Find user by subscription ID
      const userResult = await query(
        'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
        [invoice.subscription]
      )
      
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].user_id
        
        // Update subscription status (but don't immediately cancel)
        await query(`
          UPDATE subscriptions 
          SET status = 'active', -- Keep active for now, Stripe will handle retries
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `, [userId])

        // Log subscription event
        await query(`
          INSERT INTO subscription_events (user_id, event_type, event_data)
          VALUES ($1, 'payment_failed', $2)
        `, [
          userId,
          JSON.stringify({
            invoiceId: invoice.id,
            amount: invoice.amount_due,
            subscriptionId: invoice.subscription,
            failureReason: invoice.last_payment_error?.message || 'Unknown error'
          })
        ]);

        // Add to billing history
        await query(`
          INSERT INTO billing_history (
            user_id,
            amount,
            transaction_type,
            status,
            description,
            reference_id,
            payment_method
          )
          VALUES ($1, $2, 'subscription', 'failed', $3, $4, $5)
        `, [
          userId,
          invoice.amount_due / 100, // Convert cents to dollars
          `Failed subscription payment for ${invoice.lines.data[0]?.price?.nickname || 'plan'}: ${invoice.last_payment_error?.message || 'Unknown error'}`,
          invoice.id,
          invoice.payment_intent ? 'card' : invoice.payment_method_types[0] || 'unknown'
        ]);
        
        console.log(`Payment failed for user ${userId}`)
        
        // Note: In production, you might want to:
        // 1. Send email notification to user
        // 2. Set a grace period before downgrading
        // 3. Log the payment failure for analytics
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Handling checkout completed:', session.id)
    
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    
    if (customerId && subscriptionId) {
      // Find user by customer ID
      const userResult = await query(
        'SELECT user_id FROM subscriptions WHERE stripe_customer_id = $1',
        [customerId]
      )
      
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].user_id
        
        // Update subscription with subscription ID and customer ID
        await query(`
          UPDATE subscriptions 
          SET stripe_subscription_id = $1,
              stripe_customer_id = $2,
              status = 'active',
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $3
        `, [subscriptionId, customerId, userId])
        
        console.log(`Checkout completed for user ${userId}`)
      }
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}
