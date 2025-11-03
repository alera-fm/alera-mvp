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
          (SELECT COUNT(*) FROM releases WHERE status = 'pending') as pending_releases,
          (SELECT COUNT(*) FROM releases WHERE status = 'under_review') as under_review_releases,
          (SELECT COUNT(*) FROM users WHERE identity_verification_status = 'pending') as pending_identity_verifications,
          (SELECT COUNT(*) FROM withdrawal_requests WHERE status = 'pending') as pending_payout_requests,
          (SELECT COUNT(*) FROM payout_methods WHERE status = 'pending') as pending_payout_methods,
          (SELECT COUNT(*) FROM releases WHERE status = 'takedown_requested') as takedown_requests
      `),

      // Key Metrics - Total Releases and User Counts with 7-day change
      pool.query(`
        SELECT 
          -- Total Releases (all time)
          (SELECT COUNT(*) FROM releases) as total_releases,
          -- New Releases in last 7 days (for change calculation)
          (SELECT COUNT(*) FROM releases WHERE created_at >= NOW() - INTERVAL '7 days') as new_releases_last_7_days,
          
          -- Total Free/Trial Users (all time) - users with trial tier or no subscription
          (SELECT COUNT(*) FROM users u
           LEFT JOIN subscriptions s ON u.id = s.user_id
           WHERE s.tier = 'trial' OR s.id IS NULL) as total_free_users,
          -- New Free/Trial Users in last 7 days (users created in last 7 days who are still free/trial)
          (SELECT COUNT(*) FROM users u
           LEFT JOIN subscriptions s ON u.id = s.user_id
           WHERE u.created_at >= NOW() - INTERVAL '7 days'
           AND (s.tier = 'trial' OR s.id IS NULL)) as new_free_users_last_7_days,
          
          -- Total Plus Users (all time, active)
          (SELECT COUNT(*) FROM subscriptions 
           WHERE tier = 'plus' AND status = 'active') as total_plus_users,
          -- New Plus Users in last 7 days (subscriptions that became Plus or were created as Plus in last 7 days)
          -- Count subscriptions that are currently Plus and active, and were created or updated in last 7 days
          (SELECT COUNT(*) FROM subscriptions 
           WHERE tier = 'plus' 
           AND status = 'active'
           AND (
             created_at >= NOW() - INTERVAL '7 days'
             OR updated_at >= NOW() - INTERVAL '7 days'
           )) as new_plus_users_last_7_days,
          
          -- Total Pro Users (all time, active)
          (SELECT COUNT(*) FROM subscriptions 
           WHERE tier = 'pro' AND status = 'active') as total_pro_users,
          -- New Pro Users in last 7 days (subscriptions that became Pro or were created as Pro in last 7 days)
          (SELECT COUNT(*) FROM subscriptions 
           WHERE tier = 'pro' 
           AND status = 'active'
           AND (
             created_at >= NOW() - INTERVAL '7 days'
             OR updated_at >= NOW() - INTERVAL '7 days'
           )) as new_pro_users_last_7_days
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
      underReviewReleases: parseInt(
        actionableItemsResult.rows[0].under_review_releases
      ),
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

    // Fetch actual Stripe account balance
    let stripeBalance = 0;
    let stripeCurrency = "usd";
    try {
      const balance = await stripe.balance.retrieve();

      // Get the first currency (usually the main one)
      const mainCurrency = balance.available[0] || balance.pending[0];
      if (mainCurrency) {
        stripeCurrency = mainCurrency.currency;
        const availableAmount =
          balance.available.find((b) => b.currency === mainCurrency.currency)
            ?.amount || 0;
        const pendingAmount =
          balance.pending.find((b) => b.currency === mainCurrency.currency)
            ?.amount || 0;

        // Total balance = available + pending
        stripeBalance = (availableAmount + pendingAmount) / 100; // Convert from cents
      }
    } catch (stripeError) {
      console.error("Error fetching Stripe balance:", stripeError);
      stripeBalance = 0;
    }

    const row = keyMetricsResult.rows[0];
    const totalReleases = parseInt(row.total_releases || "0");
    const newReleasesLast7Days = parseInt(row.new_releases_last_7_days || "0");
    const totalFreeUsers = parseInt(row.total_free_users || "0");
    const newFreeUsersLast7Days = parseInt(
      row.new_free_users_last_7_days || "0"
    );
    const totalPlusUsers = parseInt(row.total_plus_users || "0");
    const newPlusUsersLast7Days = parseInt(
      row.new_plus_users_last_7_days || "0"
    );
    const totalProUsers = parseInt(row.total_pro_users || "0");
    const newProUsersLast7Days = parseInt(row.new_pro_users_last_7_days || "0");

    const keyMetrics = {
      totalReleases,
      totalReleasesChange: newReleasesLast7Days,
      totalFreeUsers,
      totalFreeUsersChange: newFreeUsersLast7Days,
      totalPlusUsers,
      totalPlusUsersChange: newPlusUsersLast7Days,
      totalProUsers,
      totalProUsersChange: newProUsersLast7Days,
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
