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
    const currentPeriodData = await getRiskHealthData(startDate, endDate);

    // Get previous period data for comparison
    const previousPeriodData = await getRiskHealthData(
      previousStartDate,
      previousEndDate
    );

    // Get engagement trend data with 7-day moving average
    const engagementTrendData = await getEngagementTrendData(days, endDate);

    return NextResponse.json({
      releaseRejectionRate: currentPeriodData.releaseRejectionRate,
      userEngagementRate: currentPeriodData.userEngagementRate,
      totalReleases: currentPeriodData.totalReleases,
      rejectedReleases: currentPeriodData.rejectedReleases,
      totalUsers: currentPeriodData.totalUsers,
      activeUsers: currentPeriodData.activeUsers,
      previousPeriod: {
        releaseRejectionRate: previousPeriodData.releaseRejectionRate,
        userEngagementRate: previousPeriodData.userEngagementRate,
      },
      engagementTrendData,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error("Error fetching risk health metrics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch risk health data" },
      { status: 500 }
    );
  }
}

async function getRiskHealthData(startDate: Date, endDate: Date) {
  // Get total decisions in period (releases whose status was finalized/updated during the range)
  const totalReleasesResult = await query(
    `
    SELECT COUNT(*) as count
    FROM releases
    WHERE updated_at >= $1 AND updated_at <= $2
      AND status IN ('approved', 'published', 'live', 'sent_to_store', 'rejected')
    `,
    [startDate, endDate]
  );
  const totalReleases = parseInt(totalReleasesResult.rows[0]?.count || "0");

  // Get rejected releases where rejection happened during the selected range
  const rejectedReleasesResult = await query(
    `
    SELECT COUNT(*) as count
    FROM releases
    WHERE updated_at >= $1 AND updated_at <= $2
      AND status = 'rejected'
    `,
    [startDate, endDate]
  );
  const rejectedReleases = parseInt(
    rejectedReleasesResult.rows[0]?.count || "0"
  );

  // If no releases in selected period, show 0% (avoid misleading display like "0 of 0 = 88.9%")
  // Optionally, a separate field can expose historical context if needed by the UI.
  let releaseRejectionRate = 0;
  let historicalRejectionRate: number | null = null;
  if (totalReleases === 0) {
    const overallReleasesResult = await query(
      `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM releases
      WHERE submitted_at IS NOT NULL
      `
    );
    const overallTotal = parseInt(overallReleasesResult.rows[0]?.total || "0");
    const overallRejected = parseInt(
      overallReleasesResult.rows[0]?.rejected || "0"
    );
    historicalRejectionRate =
      overallTotal > 0 ? (overallRejected / overallTotal) * 100 : 0;
    // Displayed metric for this period remains 0 when there are no releases
    releaseRejectionRate = 0;
  } else {
    releaseRejectionRate = (rejectedReleases / totalReleases) * 100;
  }

  // Get total users (all time)
  const totalUsersResult = await query(
    `
    SELECT COUNT(*) as count
    FROM users
    WHERE created_at <= $1
    `,
    [endDate]
  );
  const totalUsers = parseInt(totalUsersResult.rows[0]?.count || "0");

  // Get active users (users who have logged in successfully in the selected time period)
  const activeUsersResult = await query(
    `
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    WHERE u.created_at <= $1
    AND EXISTS (
      SELECT 1 FROM login_history lh 
      WHERE lh.user_id = u.id 
      AND lh.login_time >= $2
      AND lh.status = 'success'
    )
    `,
    [endDate, startDate]
  );
  const activeUsers = parseInt(activeUsersResult.rows[0]?.count || "0");

  // Calculate user engagement rate
  const userEngagementRate =
    totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

  return {
    releaseRejectionRate,
    userEngagementRate,
    totalReleases,
    rejectedReleases,
    totalUsers,
    activeUsers,
    historicalRejectionRate,
  };
}

async function getEngagementTrendData(periodDays: number, endDate: Date) {
  const trendData = [];
  const dataPoints = Math.min(30, periodDays); // Max 30 data points for chart
  const intervalDays = Math.max(1, Math.floor(periodDays / dataPoints));

  for (let i = dataPoints - 1; i >= 0; i--) {
    const periodEndDate = new Date(endDate);
    periodEndDate.setDate(periodEndDate.getDate() - i * intervalDays);

    const periodStartDate = new Date(periodEndDate);
    periodStartDate.setDate(periodStartDate.getDate() - intervalDays);

    // Get engagement rate for this period
    const periodData = await getRiskHealthData(periodStartDate, periodEndDate);

    // Format date label
    const dateLabel = periodEndDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    trendData.push({
      date: dateLabel,
      engagementRate: periodData.userEngagementRate,
      movingAverage: 0, // Will be calculated below
    });
  }

  // Calculate 7-day moving average
  for (let i = 0; i < trendData.length; i++) {
    const startIndex = Math.max(0, i - 6); // 7-day window
    const endIndex = i + 1;
    const window = trendData.slice(startIndex, endIndex);
    const average =
      window.reduce((sum, item) => sum + item.engagementRate, 0) /
      window.length;
    trendData[i].movingAverage = average;
  }

  return trendData;
}
