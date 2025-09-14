import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/subscription-middleware'
import { getSubscription, createSubscription } from '@/lib/subscription-utils'
import { createStripeCustomer, createCheckoutSession, getPriceIdFromTier, validateStripeConfig } from '@/lib/stripe'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig()
    
    // Verify authentication
    const userId = await requireAuth(request)
    
    const { tier } = await request.json()
    
    if (!tier || (tier !== 'plus' && tier !== 'pro')) {
      return NextResponse.json({ error: 'Invalid tier specified. Must be "plus" or "pro"' }, { status: 400 })
    }
    
    // Get user information
    const userResult = await query('SELECT email, artist_name FROM users WHERE id = $1', [userId])
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = userResult.rows[0]
    
    // Get or create subscription record
    let subscription = await getSubscription(userId)
    if (!subscription) {
      subscription = await createSubscription(userId)
      if (!subscription) {
        return NextResponse.json({ error: 'Failed to create subscription record' }, { status: 500 })
      }
    }
    
    // Check if user already has an active paid subscription
    if (subscription.tier !== 'trial' && subscription.status === 'active') {
      return NextResponse.json({ 
        error: 'User already has an active subscription',
        currentTier: subscription.tier,
        message: 'Please use the customer portal to manage your existing subscription'
      }, { status: 400 })
    }
    
    let customerId = subscription.stripe_customer_id
    
    // Create Stripe customer if doesn't exist
    if (!customerId) {
      try {
        const customer = await createStripeCustomer(
          user.email,
          user.artist_name || undefined
        )
        customerId = customer.id
        
        // Update subscription with customer ID
        await query(
          'UPDATE subscriptions SET stripe_customer_id = $1 WHERE user_id = $2',
          [customerId, userId]
        )
      } catch (error) {
        console.error('Error creating Stripe customer:', error)
        return NextResponse.json({ error: 'Failed to create customer account' }, { status: 500 })
      }
    }
    
    // Get price ID for the tier
    let priceId: string
    try {
      priceId = getPriceIdFromTier(tier)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }
    
    // Create checkout session
    try {
      const session = await createCheckoutSession(
        customerId,
        priceId,
        {
          userId: userId.toString(),
          tier,
          upgradeFrom: subscription.tier,
          email: user.email
        }
      )
      
      return NextResponse.json({
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
        tier,
        priceId,
        message: 'Checkout session created successfully'
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
