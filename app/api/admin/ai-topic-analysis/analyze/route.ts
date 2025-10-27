import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

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

    // Check if analysis already exists for today
    const today = new Date().toISOString().split("T")[0];
    const existingAnalysis = await query(
      `
      SELECT id, analysis_status FROM ai_topic_analysis 
      WHERE analysis_date = $1 AND user_tier = $2 AND time_range_days = $3
      `,
      [today, userTier, timeRangeDays]
    );

    // Get user messages for analysis
    const messages = await getUserMessagesForAnalysis(userTier, timeRangeDays);

    if (messages.length === 0) {
      return NextResponse.json({
        message: "No messages found for analysis",
        totalQueries: 0,
        totalUsers: 0,
      });
    }

    // Calculate total unique users
    const totalUsers = new Set(messages.map((m) => m.user_id)).size;

    // Create or update analysis record
    const analysisId = await createOrUpdateAnalysisRecord(
      today,
      userTier,
      timeRangeDays,
      messages.length,
      totalUsers
    );

    // Process analysis with AI (this will be async)
    processAnalysisWithAI(analysisId, messages, userTier, timeRangeDays);

    return NextResponse.json({
      message: "Analysis started",
      analysisId,
      totalQueries: messages.length,
      totalUsers: new Set(messages.map((m) => m.user_id)).size,
    });
  } catch (error) {
    console.error("Error starting AI topic analysis:", error);
    return NextResponse.json(
      { error: "Failed to start analysis" },
      { status: 500 }
    );
  }
}

async function getUserMessagesForAnalysis(
  userTier: string,
  timeRangeDays: number
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - timeRangeDays);

  let tierFilter = "";
  if (userTier !== "all") {
    tierFilter = `
      AND EXISTS (
        SELECT 1 FROM subscriptions s 
        WHERE s.user_id = u.id 
        AND s.tier = $3
        AND s.status = 'active'
      )
    `;
  }

  const messages = await query(
    `
    SELECT 
      cm.id,
      cm.user_id,
      cm.message_text as content,
      cm.created_at,
      u.email
    FROM ai_chat_messages cm
    INNER JOIN users u ON cm.user_id = u.id
    WHERE cm.is_user_message = true
    AND cm.created_at >= $1 
    AND cm.created_at <= $2
    AND EXISTS (
      SELECT 1 FROM login_history lh 
      WHERE lh.user_id = u.id 
      AND lh.login_time >= $1
      AND lh.status = 'success'
    )
    ${tierFilter}
    ORDER BY cm.created_at DESC
    `,
    userTier === "all" ? [startDate, endDate] : [startDate, endDate, userTier]
  );

  return messages.rows;
}

async function createOrUpdateAnalysisRecord(
  analysisDate: string,
  userTier: string,
  timeRangeDays: number,
  totalQueries: number,
  totalUsers: number
) {
  const result = await query(
    `
    INSERT INTO ai_topic_analysis (analysis_date, user_tier, time_range_days, total_queries, total_users, topics, wordcloud_data, analysis_status)
    VALUES ($1, $2, $3, $4, $5, '{}', '{}', 'processing')
    ON CONFLICT (analysis_date, user_tier, time_range_days)
    DO UPDATE SET 
      total_queries = $4,
      total_users = $5,
      topics = '{}',
      wordcloud_data = '{}',
      analysis_status = 'processing',
      updated_at = CURRENT_TIMESTAMP
    RETURNING id
    `,
    [analysisDate, userTier, timeRangeDays, totalQueries, totalUsers]
  );

  return result.rows[0].id;
}

async function processAnalysisWithAI(
  analysisId: number,
  messages: any[],
  userTier: string,
  timeRangeDays: number
) {
  try {
    // Update status to processing
    await query(
      "UPDATE ai_topic_analysis SET analysis_status = 'processing' WHERE id = $1",
      [analysisId]
    );

    // Prepare messages for AI analysis
    const messageTexts = messages.map((m) => m.content).join("\n\n");
    const totalUsers = new Set(messages.map((m) => m.user_id)).size;

    // Call AI analysis
    const analysisResult = await analyzeTopicsWithAI(
      messageTexts,
      userTier,
      timeRangeDays
    );

    // Save results to database
    await query(
      `
      UPDATE ai_topic_analysis 
      SET 
        total_users = $2,
        topics = $3,
        wordcloud_data = $4,
        analysis_status = 'completed',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [
        analysisId,
        totalUsers,
        JSON.stringify(analysisResult.topics),
        JSON.stringify(analysisResult.wordcloud),
      ]
    );

    console.log(`AI topic analysis completed for analysis ID: ${analysisId}`);
  } catch (error) {
    console.error("Error processing AI analysis:", error);

    // Update status to failed
    await query(
      `
      UPDATE ai_topic_analysis 
      SET 
        analysis_status = 'failed',
        error_message = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [analysisId, error instanceof Error ? error.message : "Unknown error"]
    );
  }
}

async function analyzeTopicsWithAI(
  messageTexts: string,
  userTier: string,
  timeRangeDays: number
) {
  // This is where you would integrate with your AI service (OpenAI, Anthropic, etc.)
  // For now, I'll create a mock analysis that simulates AI processing

  const prompt = `
Analyze the following user messages from a music distribution platform and extract:
1. Top 10 topics/themes users are asking about
2. Keywords for each topic
3. Word cloud data with word frequency and colors

User Tier: ${userTier}
Time Range: ${timeRangeDays} days
Total Messages: ${messageTexts.split("\n\n").length}

Messages:
${messageTexts}

Please return a JSON response with this structure:
{
  "topics": [
    {
      "name": "Topic Name",
      "count": 25,
      "percentage": 15.2,
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "wordcloud": [
    {
      "text": "word",
      "value": 50,
      "color": "#3B82F6"
    }
  ]
}
`;

  // Mock AI response - replace with actual AI service call
  const mockAnalysis = {
    topics: [
      {
        name: "Release Distribution",
        count: 45,
        percentage: 28.1,
        keywords: ["release", "distribute", "upload", "music", "tracks"],
      },
      {
        name: "Payment & Payouts",
        count: 32,
        percentage: 20.0,
        keywords: ["payment", "payout", "money", "earnings", "royalties"],
      },
      {
        name: "Account & Subscription",
        count: 28,
        percentage: 17.5,
        keywords: ["account", "subscription", "upgrade", "billing", "plan"],
      },
      {
        name: "Technical Support",
        count: 22,
        percentage: 13.8,
        keywords: ["help", "error", "problem", "fix", "support"],
      },
      {
        name: "Analytics & Reports",
        count: 18,
        percentage: 11.3,
        keywords: ["analytics", "reports", "stats", "data", "insights"],
      },
      {
        name: "Copyright & Legal",
        count: 15,
        percentage: 9.4,
        keywords: ["copyright", "legal", "rights", "permission", "license"],
      },
    ],
    wordcloud: [
      { text: "release", value: 45, color: "#3B82F6" },
      { text: "music", value: 38, color: "#10B981" },
      { text: "payment", value: 32, color: "#F59E0B" },
      { text: "upload", value: 28, color: "#EF4444" },
      { text: "account", value: 25, color: "#8B5CF6" },
      { text: "help", value: 22, color: "#06B6D4" },
      { text: "analytics", value: 18, color: "#84CC16" },
      { text: "subscription", value: 16, color: "#F97316" },
      { text: "tracks", value: 14, color: "#EC4899" },
      { text: "support", value: 12, color: "#6B7280" },
    ],
  };

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return mockAnalysis;
}
