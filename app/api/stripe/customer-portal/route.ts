import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/subscription-middleware'
import { getSubscription } from '@/lib/subscription-utils'
import { createCustomerPortalSession, validateStripeConfig } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe configuration
    validateStripeConfig()
    
    // Verify authentication
    const userId = await requireAuth(request)
    
    // Get user's subscription
    const subscription = await getSubscription(userId)
    
    if (!subscription || !subscription.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No active subscription found' 
      }, { status: 400 })
    }
    
    const { returnUrl } = await request.json()
    
    // Create customer portal session
    try {
      const session = await createCustomerPortalSession(
        subscription.stripe_customer_id,
        returnUrl
      )
      
      return NextResponse.json({
        url: session.url
      })
    } catch (error) {
      console.error('Error creating customer portal session:', error)
      return NextResponse.json({ 
        error: 'Failed to create customer portal session' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create customer portal' },
      { status: 500 }
    )
  }
}
