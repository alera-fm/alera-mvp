import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-middleware";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    // Fetch all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100, // Adjust based on your subscription count
      expand: ["data.items.data.price"],
    });

    let totalMRR = 0;
    const subscriptionDetails = [];

    for (const subscription of subscriptions.data) {
      // Calculate monthly revenue for this subscription
      let subscriptionMRR = 0;

      for (const item of subscription.items.data) {
        const price = item.price;
        const quantity = item.quantity || 1;

        if (price.unit_amount && price.recurring?.interval === "month") {
          // Monthly subscription
          subscriptionMRR += (price.unit_amount * quantity) / 100; // Convert from cents
        } else if (price.unit_amount && price.recurring?.interval === "year") {
          // Annual subscription - convert to monthly
          subscriptionMRR += (price.unit_amount * quantity) / 100 / 12;
        }
      }

      totalMRR += subscriptionMRR;

      subscriptionDetails.push({
        id: subscription.id,
        customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ),
        current_period_end: new Date(subscription.current_period_end * 1000),
        monthly_revenue: subscriptionMRR,
        created: new Date(subscription.created * 1000),
        items: subscription.items.data.map((item) => ({
          price_id: item.price.id,
          amount: item.price.unit_amount,
          interval: item.price.recurring?.interval,
          quantity: item.quantity,
        })),
      });
    }

    // Get additional metrics
    const totalActiveSubscriptions = subscriptions.data.length;
    const totalCustomers = await stripe.customers.list({ limit: 1 });

    return NextResponse.json({
      monthly_recurring_revenue: totalMRR,
      active_subscriptions: totalActiveSubscriptions,
      total_customers: totalCustomers.total_count,
      subscription_details: subscriptionDetails,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching Stripe MRR:", error);
    return NextResponse.json(
      { error: "Failed to fetch MRR from Stripe" },
      { status: 500 }
    );
  }
}
