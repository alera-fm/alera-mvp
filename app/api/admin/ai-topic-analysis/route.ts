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
    const userTier = searchParams.get("tier") || "all";
    const timeRange = searchParams.get("range") || "30";
    const timeRangeDays = parseInt(timeRange);

    // Get the most recent analysis for the specified tier and time range
    const analysisResult = await query(
      `
      SELECT 
        id,
        analysis_date,
        user_tier,
        time_range_days,
        total_queries,
        total_users,
        topics,
        wordcloud_data,
        analysis_status,
        error_message,
        created_at,
        updated_at
      FROM ai_topic_analysis 
      WHERE user_tier = $1 AND time_range_days = $2
      ORDER BY analysis_date DESC
      LIMIT 1
      `,
      [userTier, timeRangeDays]
    );

    if (analysisResult.rows.length === 0) {
      return NextResponse.json({
        message: "No analysis found for the specified criteria",
        analysis: null,
        needsAnalysis: true,
      });
    }

    const analysis = analysisResult.rows[0];

    // If analysis is still processing, return status
    if (analysis.analysis_status === "processing") {
      return NextResponse.json({
        message: "Analysis in progress",
        analysis: {
          id: analysis.id,
          status: analysis.analysis_status,
          totalQueries: analysis.total_queries,
          totalUsers: analysis.total_users,
          createdAt: analysis.created_at,
        },
        needsAnalysis: false,
      });
    }

    // If analysis failed, return error
    if (analysis.analysis_status === "failed") {
      return NextResponse.json({
        message: "Analysis failed",
        analysis: {
          id: analysis.id,
          status: analysis.analysis_status,
          errorMessage: analysis.error_message,
          createdAt: analysis.created_at,
        },
        needsAnalysis: true,
      });
    }

    // Return completed analysis
    return NextResponse.json({
      analysis: {
        id: analysis.id,
        analysisDate: analysis.analysis_date,
        userTier: analysis.user_tier,
        timeRangeDays: analysis.time_range_days,
        totalQueries: analysis.total_queries,
        totalUsers: analysis.total_users,
        topics: analysis.topics,
        wordcloudData: analysis.wordcloud_data,
        status: analysis.analysis_status,
        createdAt: analysis.created_at,
        updatedAt: analysis.updated_at,
      },
      needsAnalysis: false,
    });
  } catch (error) {
    console.error("Error fetching AI topic analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic analysis" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { userTier, timeRangeDays } = await request.json();

    if (!userTier || !timeRangeDays) {
      return NextResponse.json(
        { error: "userTier and timeRangeDays are required" },
        { status: 400 }
      );
    }

    // Trigger analysis by calling the analyze endpoint
    const analyzeResponse = await fetch(
      `${request.nextUrl.origin}/api/admin/ai-topic-analysis/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userTier, timeRangeDays }),
      }
    );

    const analyzeResult = await analyzeResponse.json();

    if (!analyzeResponse.ok) {
      return NextResponse.json(analyzeResult, {
        status: analyzeResponse.status,
      });
    }

    return NextResponse.json(analyzeResult);
  } catch (error) {
    console.error("Error triggering AI topic analysis:", error);
    return NextResponse.json(
      { error: "Failed to trigger analysis" },
      { status: 500 }
    );
  }
}
