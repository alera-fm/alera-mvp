import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const adminCheck = await query("SELECT is_admin FROM users WHERE id = $1", [
      tokenData.userId,
    ]);

    if (!adminCheck.rows[0]?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30";
    const days = parseInt(range);

    // Calculate date ranges
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Previous period for comparison
    const previousEndDate = new Date(startDate);
    const previousStartDate = new Date();
    previousStartDate.setDate(previousEndDate.getDate() - days);

    // Get current period data
    const currentPeriodData = await getRevenueData(startDate, endDate);

    // Get previous period data for comparison
    const previousPeriodData = await getRevenueData(
      previousStartDate,
      previousEndDate
    );

    // Get trend data (last 12 periods for chart)
    const trendData = await getTrendData(days, endDate);

    return NextResponse.json({
      trialToPaidConversionRate: currentPeriodData.trialToPaidConversionRate,
      monthlyRecurringRevenue: currentPeriodData.monthlyRecurringRevenue,
      averageRevenuePerUser: currentPeriodData.averageRevenuePerUser,
      previousPeriod: {
        trialToPaidConversionRate: previousPeriodData.trialToPaidConversionRate,
        monthlyRecurringRevenue: previousPeriodData.monthlyRecurringRevenue,
        averageRevenuePerUser: previousPeriodData.averageRevenuePerUser,
      },
      trendData,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue metrics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}

async function getRevenueData(startDate: Date, endDate: Date) {
  // Get total trial users in period (users who signed up in period and are trial users)
  const totalTrialUsersResult = await query(
    `
    SELECT COUNT(*) as count
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.user_id
    WHERE u.created_at >= $1 AND u.created_at <= $2
    AND (
      s.tier = 'trial' 
      OR s.status IN ('pending_payment', 'payment_failed')
      OR s.id IS NULL
    )
    `,
    [startDate, endDate]
  );
  const totalTrialUsers = parseInt(totalTrialUsersResult.rows[0]?.count || "0");

  // Get paid users who converted during period (users who upgraded from trial)
  const paidUsersResult = await query(
    `
    SELECT COUNT(*) as count
    FROM users u
    INNER JOIN subscriptions s ON u.id = s.user_id
    WHERE s.created_at >= $1 AND s.created_at <= $2
    AND s.tier IN ('plus', 'pro')
    AND s.status = 'active'
    `,
    [startDate, endDate]
  );
  const paidUsers = parseInt(paidUsersResult.rows[0]?.count || "0");

  // Calculate trial-to-paid conversion rate
  const trialToPaidConversionRate =
    totalTrialUsers > 0 ? (paidUsers / totalTrialUsers) * 100 : 0;

  // Get MRR (Monthly Recurring Revenue) - current active subscriptions
  const mrrResult = await query(
    `
    SELECT 
      SUM(
        CASE 
          WHEN s.tier = 'plus' THEN 4.99
          WHEN s.tier = 'pro' THEN 14.99
          ELSE 0
        END
      ) as mrr
    FROM subscriptions s
    WHERE s.tier IN ('plus', 'pro')
    AND s.status = 'active'
    `,
    []
  );
  const monthlyRecurringRevenue = parseFloat(mrrResult.rows[0]?.mrr || "0");

  // Get total active paid users for ARPU calculation
  const totalActivePaidUsersResult = await query(
    `
    SELECT COUNT(*) as count
    FROM subscriptions s
    WHERE s.tier IN ('plus', 'pro')
    AND s.status = 'active'
    `,
    []
  );
  const totalActivePaidUsers = parseInt(
    totalActivePaidUsersResult.rows[0]?.count || "0"
  );

  // Calculate ARPU (Average Revenue Per User)
  const averageRevenuePerUser =
    totalActivePaidUsers > 0
      ? monthlyRecurringRevenue / totalActivePaidUsers
      : 0;

  return {
    trialToPaidConversionRate,
    monthlyRecurringRevenue,
    averageRevenuePerUser,
  };
}

async function getTrendData(periodDays: number, endDate: Date) {
  const trendData = [];
  const periods = 12; // Last 12 periods for trend chart

  for (let i = periods - 1; i >= 0; i--) {
    const periodEndDate = new Date(endDate);
    periodEndDate.setDate(periodEndDate.getDate() - i * periodDays);

    const periodStartDate = new Date(periodEndDate);
    periodStartDate.setDate(periodStartDate.getDate() - periodDays);

    const periodData = await getRevenueData(periodStartDate, periodEndDate);

    // Format period label based on period length
    let periodLabel;
    if (periodDays <= 7) {
      periodLabel = periodEndDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (periodDays <= 30) {
      periodLabel = periodEndDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (periodDays <= 90) {
      periodLabel = periodEndDate.toLocaleDateString("en-US", {
        month: "short",
      });
    } else {
      periodLabel = periodEndDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    }

    trendData.push({
      period: periodLabel,
      conversionRate: periodData.trialToPaidConversionRate,
      mrr: periodData.monthlyRecurringRevenue,
      arpu: periodData.averageRevenuePerUser,
    });
  }

  return trendData;
}
