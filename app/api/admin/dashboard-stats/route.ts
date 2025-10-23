import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-middleware";
import type { DashboardStats } from "@/types/admin";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("range") || "30"; // Default 30 days for charts

    // Execute all queries in parallel for better performance
    const [
      actionableItemsResult,
      keyMetricsResult,
      newUsersOverTimeResult,
      newReleasesOverTimeResult,
      conversionRateResult,
    ] = await Promise.all([
      // Actionable Items
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM releases WHERE status = 'under_review') as pending_releases,
          (SELECT COUNT(*) FROM users WHERE identity_verification_status = 'pending') as pending_identity_verifications,
          (SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'pending') as pending_payout_requests,
          (SELECT COUNT(*) FROM payout_methods WHERE status = 'pending') as pending_payout_methods,
          (SELECT COUNT(*) FROM releases WHERE status = 'takedown_requested') as takedown_requests
      `),

      // Key Metrics (excluding MRR - will fetch from Stripe separately)
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_last_7_days,
          (SELECT COUNT(*) FROM releases WHERE status = 'live' AND updated_at >= NOW() - INTERVAL '7 days') as new_releases_last_7_days,
          (SELECT COUNT(*) FROM subscriptions 
           WHERE tier IN ('plus', 'pro') 
           AND created_at >= date_trunc('month', NOW())) as new_paying_subscribers_this_month
      `),

      // New Users Over Time
      pool.query(
        `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${parseInt(timeRange)} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
      ),

      // New Releases Over Time (releases that went live)
      pool.query(
        `
        SELECT 
          DATE(updated_at) as date,
          COUNT(*) as count
        FROM releases
        WHERE status = 'live'
        AND updated_at >= NOW() - INTERVAL '${parseInt(timeRange)} days'
        GROUP BY DATE(updated_at)
        ORDER BY date ASC
      `
      ),

      // Trial to Paid Conversion Rate (placeholder - will show 0% for now)
      pool.query(
        `
        SELECT 
          TO_CHAR(DATE(day), 'Mon DD') as month,
          0 as rate
        FROM generate_series(
          NOW() - INTERVAL '${parseInt(timeRange)} days',
          NOW(),
          '1 day'::interval
        ) AS day
        ORDER BY day ASC
      `
      ),
    ]);

    const actionableItems = {
      pendingReleases: parseInt(actionableItemsResult.rows[0].pending_releases),
      pendingIdentityVerifications: parseInt(
        actionableItemsResult.rows[0].pending_identity_verifications
      ),
      pendingPayoutRequests: parseInt(
        actionableItemsResult.rows[0].pending_payout_requests
      ),
      pendingPayoutMethods: parseInt(
        actionableItemsResult.rows[0].pending_payout_methods
      ),
      takedownRequests: parseInt(
        actionableItemsResult.rows[0].takedown_requests
      ),
    };

    // Fetch actual MRR from Stripe
    let actualMRR = 0;
    try {
      const subscriptions = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        expand: ["data.items.data.price"],
      });

      for (const subscription of subscriptions.data) {
        for (const item of subscription.items.data) {
          const price = item.price;
          const quantity = item.quantity || 1;

          if (price.unit_amount && price.recurring?.interval === "month") {
            actualMRR += (price.unit_amount * quantity) / 100; // Convert from cents
          } else if (
            price.unit_amount &&
            price.recurring?.interval === "year"
          ) {
            actualMRR += (price.unit_amount * quantity) / 100 / 12; // Convert annual to monthly
          }
        }
      }
    } catch (stripeError) {
      console.error("Error fetching Stripe MRR:", stripeError);
      // Fallback to 0 if Stripe fails
      actualMRR = 0;
    }

    const keyMetrics = {
      newUsersLast7Days: parseInt(
        keyMetricsResult.rows[0].new_users_last_7_days
      ),
      newReleasesLast7Days: parseInt(
        keyMetricsResult.rows[0].new_releases_last_7_days
      ),
      newPayingSubscribersThisMonth: parseInt(
        keyMetricsResult.rows[0].new_paying_subscribers_this_month
      ),
      monthlyRecurringRevenue: actualMRR,
    };

    const performanceMetrics = {
      newUsersOverTime: newUsersOverTimeResult.rows.map((row) => ({
        date: row.date.toISOString().split("T")[0],
        count: parseInt(row.count),
      })),
      newReleasesOverTime: newReleasesOverTimeResult.rows.map((row) => ({
        date: row.date.toISOString().split("T")[0],
        count: parseInt(row.count),
      })),
      trialToPaidConversion: conversionRateResult.rows.map((row) => ({
        month: row.month,
        rate: parseFloat(row.rate),
      })),
    };

    const response: DashboardStats = {
      actionableItems,
      keyMetrics,
      performanceMetrics,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
