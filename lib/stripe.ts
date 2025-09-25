import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Stripe configuration constants
export const STRIPE_CONFIG = {
  PLUS_PRICE_ID: process.env.STRIPE_PLUS_PRICE_ID || '',
  PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || '',
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  SUCCESS_URL: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/subscription-success` : 'http://localhost:3000/subscription-success',
  CANCEL_URL: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=cancelled` : 'http://localhost:3000/dashboard?subscription=cancelled',
}

// Validate Stripe configuration
export function validateStripeConfig() {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PLUS_PRICE_ID',
    'STRIPE_PRO_PRICE_ID',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    throw new Error(`Missing required Stripe environment variables: ${missing.join(', ')}`)
  }
}

// Create Stripe customer
export async function createStripeCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
    })
    
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw new Error('Failed to create customer')
  }
}

// Create checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  try {
    // Build success URL with tier and billing cycle parameters
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const tier = metadata?.tier || 'Plus'
    const billingCycle = metadata?.billing || 'Monthly'
    const successUrl = `${baseUrl}/subscription-success?tier=${tier}&cycle=${billingCycle}`
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: STRIPE_CONFIG.CANCEL_URL,
      metadata: metadata || {},
      subscription_data: {
        metadata: metadata || {},
      },
    })
    
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

// Create customer portal session
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl?: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || STRIPE_CONFIG.SUCCESS_URL,
    })
    
    return session
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw new Error('Failed to create customer portal session')
  }
}

// Get subscription by ID
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

// Cancel subscription
export async function cancelStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return null
  }
}

// Verify webhook signature
export function verifyWebhookSignature(body: string, signature: string): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.WEBHOOK_SECRET
    )
    
    return event
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    throw new Error('Invalid webhook signature')
  }
}

// Get tier from price ID
export function getTierFromPriceId(priceId: string): 'plus' | 'pro' | null {
  if (priceId === STRIPE_CONFIG.PLUS_PRICE_ID) {
    return 'plus'
  }
  
  if (priceId === STRIPE_CONFIG.PRO_PRICE_ID) {
    return 'pro'
  }
  
  return null
}

// Get price ID from tier
export function getPriceIdFromTier(tier: 'plus' | 'pro'): string {
  if (tier === 'plus') {
    return STRIPE_CONFIG.PLUS_PRICE_ID
  }
  
  if (tier === 'pro') {
    return STRIPE_CONFIG.PRO_PRICE_ID
  }
  
  throw new Error(`Invalid tier: ${tier}`)
}
