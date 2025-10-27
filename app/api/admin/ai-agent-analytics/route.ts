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
    const currentPeriodData = await getAIAgentData(startDate, endDate);

    // Get previous period data for comparison
    const previousPeriodData = await getAIAgentData(
      previousStartDate,
      previousEndDate
    );

    // Get trend data for adoption rate chart
    const trendData = await getAdoptionTrendData(days, endDate);

    return NextResponse.json({
      adoptionRate: currentPeriodData.adoptionRate,
      totalActiveUsers: currentPeriodData.totalActiveUsers,
      aiUsers: currentPeriodData.aiUsers,
      averageQueriesPerUser: currentPeriodData.averageQueriesPerUser,
      totalQueries: currentPeriodData.totalQueries,
      previousPeriod: {
        adoptionRate: previousPeriodData.adoptionRate,
        totalActiveUsers: previousPeriodData.totalActiveUsers,
        aiUsers: previousPeriodData.aiUsers,
        averageQueriesPerUser: previousPeriodData.averageQueriesPerUser,
        totalQueries: previousPeriodData.totalQueries,
      },
      trendData,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error("Error fetching AI agent analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI agent data" },
      { status: 500 }
    );
  }
}

async function getAIAgentData(startDate: Date, endDate: Date) {
  // Get total active users in the selected time period
  const totalActiveUsersResult = await query(
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
  const totalActiveUsers = parseInt(
    totalActiveUsersResult.rows[0]?.count || "0"
  );

  // Get users who have used AI agent in the selected time period
  // These users must also be active (have logged in successfully in the time period)
  const aiUsersResult = await query(
    `
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    INNER JOIN ai_chat_messages cm ON u.id = cm.user_id
    WHERE u.created_at <= $1
    AND cm.created_at >= $2
    AND cm.created_at <= $1
    AND cm.is_user_message = true
    AND EXISTS (
      SELECT 1 FROM login_history lh 
      WHERE lh.user_id = u.id 
      AND lh.login_time >= $2
      AND lh.status = 'success'
    )
    `,
    [endDate, startDate]
  );
  const aiUsers = parseInt(aiUsersResult.rows[0]?.count || "0");

  // Calculate AI agent adoption rate
  const adoptionRate =
    totalActiveUsers > 0 ? (aiUsers / totalActiveUsers) * 100 : 0;

  // Get total AI queries (user messages) in the selected time period
  // Only count queries from active users
  const totalQueriesResult = await query(
    `
    SELECT COUNT(*) as count
    FROM ai_chat_messages cm
    INNER JOIN users u ON cm.user_id = u.id
    WHERE u.created_at <= $1
    AND cm.created_at >= $2
    AND cm.created_at <= $1
    AND cm.is_user_message = true
    AND EXISTS (
      SELECT 1 FROM login_history lh 
      WHERE lh.user_id = u.id 
      AND lh.login_time >= $2
      AND lh.status = 'success'
    )
    `,
    [endDate, startDate]
  );
  const totalQueries = parseInt(totalQueriesResult.rows[0]?.count || "0");

  // Calculate average queries per user
  const averageQueriesPerUser = aiUsers > 0 ? totalQueries / aiUsers : 0;

  return {
    adoptionRate,
    totalActiveUsers,
    aiUsers,
    averageQueriesPerUser,
    totalQueries,
  };
}

async function getAdoptionTrendData(periodDays: number, endDate: Date) {
  const trendData = [];
  const dataPoints = Math.min(30, periodDays); // Max 30 data points for chart
  const intervalDays = Math.max(1, Math.floor(periodDays / dataPoints));

  for (let i = dataPoints - 1; i >= 0; i--) {
    const periodEndDate = new Date(endDate);
    periodEndDate.setDate(periodEndDate.getDate() - i * intervalDays);

    const periodStartDate = new Date(periodEndDate);
    periodStartDate.setDate(periodStartDate.getDate() - intervalDays);

    // Get adoption rate for this period
    const periodData = await getAIAgentData(periodStartDate, periodEndDate);

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
      adoptionRate: periodData.adoptionRate,
      averageQueriesPerUser: periodData.averageQueriesPerUser,
    });
  }

  return trendData;
}
