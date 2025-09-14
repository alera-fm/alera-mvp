import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/subscription-middleware'
import { getSubscription } from '@/lib/subscription-utils'
import { cancelStripeSubscription, validateStripeConfig } from '@/lib/stripe'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig()
    
    // Verify authentication
    const userId = await requireAuth(request)
    
    // Get user's subscription
    const subscription = await getSubscription(userId)
    
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }
    
    // Check if user has a paid subscription to cancel
    if (subscription.tier === 'trial') {
      return NextResponse.json({ 
        error: 'Trial subscriptions cannot be cancelled. They will automatically expire.',
        message: 'Your trial will expire automatically. No action needed.'
      }, { status: 400 })
    }
    
    if (!subscription.stripe_subscription_id) {
      return NextResponse.json({ 
        error: 'No active Stripe subscription found',
        message: 'This subscription cannot be cancelled through this method.'
      }, { status: 400 })
    }
    
    if (subscription.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Subscription is already cancelled',
        message: 'This subscription has already been cancelled.'
      }, { status: 400 })
    }
    
    // Parse request body for cancellation options
    const body = await request.json().catch(() => ({}))
    const { 
      immediately = false, 
      reason = 'user_requested',
      feedback = null 
    } = body
    
    try {
      // Cancel the subscription in Stripe
      const cancelledSubscription = await cancelStripeSubscription(subscription.stripe_subscription_id)
      
      if (!cancelledSubscription) {
        return NextResponse.json({ 
          error: 'Failed to cancel subscription with payment provider' 
        }, { status: 500 })
      }
      
      // Update subscription status in database
      const updateQuery = immediately 
        ? `UPDATE subscriptions 
           SET status = 'cancelled', 
               subscription_expires_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = $1`
        : `UPDATE subscriptions 
           SET status = 'cancelled',
               updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = $1`
      
      await query(updateQuery, [userId])
      
      // Log cancellation for analytics (optional)
      await query(`
        INSERT INTO subscription_events (user_id, event_type, event_data, created_at)
        VALUES ($1, 'cancelled', $2, CURRENT_TIMESTAMP)
      `, [
        userId, 
        JSON.stringify({ 
          reason, 
          feedback, 
          immediately,
          cancelled_tier: subscription.tier,
          stripe_subscription_id: subscription.stripe_subscription_id
        })
      ]).catch(err => {
        // Log error but don't fail the cancellation
        console.warn('Failed to log cancellation event:', err)
      })
      
      // Determine when access ends
      const accessEndsAt = immediately 
        ? new Date()
        : new Date(cancelledSubscription.current_period_end * 1000)
      
      return NextResponse.json({
        success: true,
        message: immediately 
          ? 'Subscription cancelled immediately. Access has ended.'
          : 'Subscription cancelled. Access will continue until the end of your billing period.',
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          status: 'cancelled',
          accessEndsAt,
          immediately
        },
        nextSteps: [
          'Your subscription has been cancelled successfully',
          immediately 
            ? 'You now have limited access. Consider upgrading to continue using premium features.'
            : `You can continue using premium features until ${accessEndsAt.toLocaleDateString()}`,
          'You can resubscribe at any time from your dashboard'
        ]
      })
    } catch (error) {
      console.error('Error cancelling Stripe subscription:', error)
      return NextResponse.json({ 
        error: 'Failed to cancel subscription',
        message: 'There was an error processing your cancellation. Please try again or contact support.'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
