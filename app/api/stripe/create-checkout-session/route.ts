import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/subscription-middleware'
import { getSubscription, createSubscription } from '@/lib/subscription-utils'
import { createStripeCustomer, createCheckoutSession, getPriceIdFromTier, validateStripeConfig } from '@/lib/stripe'
import { getPricingForCountry } from '@/lib/regional-pricing'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig()
    
    // Verify authentication
    const userId = await requireAuth(request)
    
    const { tier, country = 'US', billing = 'monthly' } = await request.json()
    
    if (!tier || (tier !== 'plus' && tier !== 'pro')) {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 })
    }
    
    if (billing !== 'monthly' && billing !== 'yearly') {
      return NextResponse.json({ error: 'Invalid billing cycle specified' }, { status: 400 })
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
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
      }
    }
    
    // Check if user already has an active paid subscription
    if (subscription.tier !== 'trial' && subscription.status === 'active') {
      return NextResponse.json({ 
        error: 'User already has an active subscription',
        currentTier: subscription.tier 
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
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
      }
    }
    
    // Get price ID for the tier based on country and billing cycle
    let priceId: string
    try {
      const pricing = getPricingForCountry(country)
      priceId = billing === 'monthly' 
        ? pricing[tier].monthly.priceId 
        : pricing[tier].yearly.priceId
      
      if (!priceId) {
        console.log(`No regional price ID found for ${country} ${tier} ${billing}, falling back to default`)
        // Fallback to default pricing if regional pricing not available
        priceId = getPriceIdFromTier(tier)
      }
      
      console.log(`Using price ID: ${priceId} for ${country} ${tier} ${billing}`)
    } catch (error) {
      console.error('Error getting price ID:', error)
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 })
    }
    
    // Create checkout session
    try {
      const session = await createCheckoutSession(
        customerId,
        priceId,
        {
          userId: userId.toString(),
          tier,
          billing: billing,
          upgradeFrom: subscription.tier
        }
      )
      
      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        tier,
        priceId
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
