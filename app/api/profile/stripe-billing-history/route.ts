import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's Stripe customer ID from subscription
    const subscriptionResult = await query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1',
      [decoded.userId]
    )

    if (subscriptionResult.rows.length === 0 || !subscriptionResult.rows[0].stripe_customer_id) {
      return NextResponse.json({ 
        billing_history: [],
        message: 'No Stripe customer found'
      })
    }

    const stripeCustomerId = subscriptionResult.rows[0].stripe_customer_id

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 50,
      expand: ['data.payment_intent']
    })

    // Transform Stripe invoices to match our billing history format
    const billingHistory = invoices.data.map((invoice) => {
      const amount = invoice.amount_paid || invoice.amount_due
      const status = invoice.status === 'paid' ? 'completed' : 
                   invoice.status === 'open' ? 'pending' : 
                   invoice.status === 'void' ? 'cancelled' : 'failed'

      return {
        id: invoice.id,
        transaction_date: new Date(invoice.created * 1000).toISOString(),
        amount: (amount / 100).toFixed(2), // Convert from cents to dollars
        transaction_type: invoice.billing_reason === 'subscription_create' ? 'subscription' : 
                         invoice.billing_reason === 'subscription_cycle' ? 'recurring' : 'one_time',
        status: status,
        description: invoice.description || `Invoice for ${invoice.lines.data[0]?.description || 'subscription'}`,
        reference_id: invoice.number || invoice.id,
        payment_method: invoice.payment_intent?.payment_method?.type || 'card',
        invoice_url: invoice.hosted_invoice_url,
        pdf_url: invoice.invoice_pdf,
        currency: invoice.currency.toUpperCase(),
        period_start: new Date(invoice.period_start * 1000).toISOString(),
        period_end: new Date(invoice.period_end * 1000).toISOString()
      }
    })

    return NextResponse.json({ 
      billing_history: billingHistory,
      customer_id: stripeCustomerId
    })
  } catch (error) {
    console.error("Stripe billing history fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch billing history from Stripe" },
      { status: 500 }
    )
  }
}
