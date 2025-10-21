import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-middleware";
import type { DashboardStats } from "@/types/admin";

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

      // Key Metrics
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_last_7_days,
          (SELECT COUNT(*) FROM releases WHERE submitted_at >= NOW() - INTERVAL '7 days') as new_releases_last_7_days,
          (SELECT COUNT(*) FROM subscriptions 
           WHERE tier IN ('plus', 'pro') 
           AND created_at >= date_trunc('month', NOW())) as new_paying_subscribers_this_month,
          (SELECT COALESCE(SUM(
            CASE 
              WHEN tier = 'plus' THEN 9.99
              WHEN tier = 'pro' THEN 19.99
              ELSE 0
            END
          ), 0) FROM subscriptions 
          WHERE tier IN ('plus', 'pro') 
          AND status = 'active') as monthly_recurring_revenue
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

      // New Releases Over Time
      pool.query(
        `
        SELECT 
          DATE(submitted_at) as date,
          COUNT(*) as count
        FROM releases
        WHERE submitted_at >= NOW() - INTERVAL '${parseInt(timeRange)} days'
        GROUP BY DATE(submitted_at)
        ORDER BY date ASC
      `
      ),

      // Trial to Paid Conversion Rate (last 12 months)
      pool.query(`
        WITH monthly_cohorts AS (
          SELECT 
            date_trunc('month', created_at) as cohort_month,
            COUNT(*) as trial_users
          FROM subscriptions
          WHERE tier = 'trial'
          AND created_at >= NOW() - INTERVAL '12 months'
          GROUP BY date_trunc('month', created_at)
        ),
        conversions AS (
          SELECT 
            date_trunc('month', s1.created_at) as cohort_month,
            COUNT(DISTINCT s2.user_id) as converted_users
          FROM subscriptions s1
          LEFT JOIN subscriptions s2 ON s1.user_id = s2.user_id 
            AND s2.tier IN ('plus', 'pro')
            AND s2.created_at > s1.created_at
          WHERE s1.tier = 'trial'
          AND s1.created_at >= NOW() - INTERVAL '12 months'
          GROUP BY date_trunc('month', s1.created_at)
        )
        SELECT 
          TO_CHAR(mc.cohort_month, 'Mon YYYY') as month,
          CASE 
            WHEN mc.trial_users > 0 
            THEN ROUND((COALESCE(c.converted_users, 0)::numeric / mc.trial_users::numeric * 100), 2)
            ELSE 0 
          END as rate
        FROM monthly_cohorts mc
        LEFT JOIN conversions c ON mc.cohort_month = c.cohort_month
        ORDER BY mc.cohort_month ASC
      `),
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
      monthlyRecurringRevenue: parseFloat(
        keyMetricsResult.rows[0].monthly_recurring_revenue
      ),
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
