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
    AND u.created_at <= $2
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

    // Prepare for analysis
    const totalUsers = new Set(messages.map((m) => m.user_id)).size;

    // Prefer real AI analysis when API key is configured; fallback to deterministic analysis
    let analysisResult;
    if (process.env.OPENAI_API_KEY) {
      analysisResult = await analyzeWithOpenAI(
        messages,
        userTier,
        timeRangeDays
      );
    } else {
      analysisResult = simpleTopicAnalysis(messages);
    }

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

async function analyzeWithOpenAI(
  messages: any[],
  userTier: string,
  timeRangeDays: number
) {
  const total = messages.length;
  const system = `You are analyzing end-user chat messages to extract topics and a wordcloud.
Return STRICT JSON that conforms to this TypeScript type:
{
  topics: { name: string; count: number; percentage: number; keywords: string[]; }[];
  wordcloud: { text: string; value: number; color: string; }[];
}
Rules:
- topics.length <= 10
- Sum of topic counts MUST equal ${total}
- percentage = (count / ${total}) * 100, rounded to 1 decimal
- keywords length between 3 and 6
- wordcloud 10-30 items, values are positive integers
- Do NOT include any additional fields.
`;

  const user = `Metadata:\nUser Tier: ${userTier}\nTime Range (days): ${timeRangeDays}\nTotal Messages: ${total}\n\nMessages (JSON array):\n${JSON.stringify(
    messages.map((m) => ({ id: m.id, user_id: m.user_id, text: m.content }))
  )}`;

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!completion.ok) {
    const errText = await completion.text();
    throw new Error(`OpenAI request failed: ${errText}`);
  }

  const data = await completion.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error("OpenAI returned non-JSON content");
  }

  // Validate and normalize
  const topics = Array.isArray(parsed.topics) ? parsed.topics : [];
  const wordcloud = Array.isArray(parsed.wordcloud) ? parsed.wordcloud : [];

  // Ensure counts sum to total and percentages are correct
  const sumCounts = topics.reduce((s: number, t: any) => s + (t.count || 0), 0);
  if (sumCounts !== total && total > 0) {
    // Scale proportionally, then fix rounding drift
    let remaining = total;
    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      const raw = t.count || 0;
      const scaled = Math.max(
        0,
        Math.round((raw / Math.max(1, sumCounts)) * total)
      );
      t.count = scaled;
      remaining -= scaled;
    }
    // Distribute remaining to top topics
    let idx = 0;
    while (remaining > 0 && topics.length > 0) {
      topics[idx % topics.length].count += 1;
      remaining -= 1;
      idx += 1;
    }
  }
  for (const t of topics) {
    const pct = total > 0 ? (t.count / total) * 100 : 0;
    t.percentage = Math.round(pct * 10) / 10;
    if (!Array.isArray(t.keywords)) t.keywords = [];
  }

  const palette = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6B7280",
  ];
  const wc = wordcloud.slice(0, 30).map((w: any, i: number) => ({
    text: String(w.text || ""),
    value: Math.max(1, parseInt(String(w.value || 1), 10)),
    color: w.color || palette[i % palette.length],
  }));

  return { topics: topics.slice(0, 10), wordcloud: wc };
}

function simpleTopicAnalysis(messages: any[]) {
  const total = messages.length;
  const topics = [
    {
      name: "Release Distribution",
      keywords: [
        "release",
        "distribute",
        "distribution",
        "upload",
        "track",
        "song",
        "music",
        "stores",
      ],
    },
    {
      name: "Payment & Payouts",
      keywords: [
        "payment",
        "payout",
        "pay",
        "money",
        "earnings",
        "royalties",
        "withdraw",
        "stripe",
      ],
    },
    {
      name: "Account & Subscription",
      keywords: [
        "account",
        "subscription",
        "upgrade",
        "billing",
        "plan",
        "tier",
        "trial",
        "pro",
        "plus",
      ],
    },
    {
      name: "Technical Support",
      keywords: ["error", "issue", "bug", "problem", "fix", "support", "help"],
    },
    {
      name: "Analytics & Reports",
      keywords: [
        "analytics",
        "report",
        "stats",
        "data",
        "insights",
        "dashboard",
      ],
    },
    {
      name: "Copyright & Legal",
      keywords: [
        "copyright",
        "legal",
        "rights",
        "license",
        "permission",
        "dmca",
      ],
    },
  ];

  const counts = new Array(topics.length).fill(0);
  const wordFreq: Record<string, number> = {};

  for (const m of messages) {
    const text = String(m.content || "").toLowerCase();
    // word frequency
    for (const token of text.split(/[^a-z0-9]+/).filter(Boolean)) {
      wordFreq[token] = (wordFreq[token] || 0) + 1;
    }
    // assign each message to at most one topic (first match) to ensure sum == total
    let assigned = false;
    for (let i = 0; i < topics.length && !assigned; i++) {
      if (topics[i].keywords.some((k) => text.includes(k))) {
        counts[i]++;
        assigned = true;
      }
    }
  }

  const results = topics
    .map((t, i) => ({
      name: t.name,
      count: counts[i],
      percentage: total > 0 ? (counts[i] / total) * 100 : 0,
      keywords: t.keywords.slice(0, 5),
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(10); // cap to top 10 if needed

  // build wordcloud from top words
  const palette = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6B7280",
  ];
  const wordcloud = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(20)
    .map(([text, value], idx) => ({
      text,
      value,
      color: palette[idx % palette.length],
    }));

  return { topics: results, wordcloud };
}
