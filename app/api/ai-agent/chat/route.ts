import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Check if OpenAI is properly configured
const isOpenAIConfigured = () => {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'
}

// Intent classification patterns
const INTENT_PATTERNS = {
  wallet: [
    /how much.*(?:make|earn|revenue|money|income)/i,
    /(?:total|monthly|weekly|daily).*(?:earnings|revenue|income|money)/i,
    /(?:last|recent).*(?:payout|withdrawal)/i,
    /wallet.*balance/i,
    /earnings.*summary/i
  ],
  analytics: [
    /(?:which|what).*(?:song|track).*(?:perform|best|top)/i,
    /(?:top|best).*(?:performing|streaming)/i,
    /(?:stream|play).*(?:count|number)/i,
    /(?:where|location).*(?:fans|listeners|audience)/i,
    /(?:country|territory).*(?:performance|streams)/i,
    /(?:device|platform).*(?:usage|breakdown)/i
  ],
  releases: [
    /(?:release|track|song).*(?:status|progress)/i,
    /(?:latest|recent).*(?:release|track|song)/i,
    /(?:upcoming|pending).*(?:release|track)/i,
    /(?:distribution|upload).*(?:status)/i,
    /what.*(?:release|track|song)/i,
    /(?:my|your).*(?:release|track|song)/i,
    /realease/i, // Handle typo
    /release/i
  ],
  onboarding: [
    /(?:career|music).*(?:description|background)/i,
    /(?:goals|objectives|aims)/i,
    /(?:release|strategy|plan)/i,
    /(?:genre|style|type).*(?:music)/i,
    /(?:audience|fans|listeners)/i,
    /(?:experience|level|beginner|professional)/i,
    /(?:frequency|monthly|releases)/i,
    /(?:platform|streaming|distribution)/i,
    /(?:collaboration|feature|work)/i,
    /(?:marketing|promotion|social)/i
  ]
}

// Function to classify intent
function classifyIntent(message: string): string {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return intent
      }
    }
  }
  return 'general'
}

// Format plain text into readable HTML (paragraphs/lists) if the model didn't output HTML
function formatAssistantHtml(text: string): string {
  if (!text) return ''
  const hasHtml = /<\/?(p|ul|ol|li|br|a|strong|em)\b/i.test(text)
  if (hasHtml) return text

  const lines = text.trim().split(/\r?\n/)
  const blocks: string[] = []
  let i = 0
  while (i < lines.length) {
    // skip extra blank lines
    if (/^\s*$/.test(lines[i])) { i++; continue }

    // unordered list
    if (/^\s*[-\*]\s+/.test(lines[i])) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-\*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-\*]\s+/, '').trim())
        i++
      }
      blocks.push(`<ul>${items.map(it => `<li>${escapeHtml(it)}</li>`).join('')}</ul>`) 
      continue
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(lines[i])) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, '').trim())
        i++
      }
      blocks.push(`<ol>${items.map(it => `<li>${escapeHtml(it)}</li>`).join('')}</ol>`) 
      continue
    }

    // paragraph: consume until blank line
    const para: string[] = []
    while (i < lines.length && !/^\s*$/.test(lines[i])) {
      para.push(lines[i].trim())
      i++
    }
    blocks.push(`<p>${escapeHtml(para.join(' '))}</p>`)
  }
  return blocks.join('\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Function to fetch chat history
async function fetchChatHistory(userId: number, limit: number = 10) {
  try {
    const historyQuery = `
      SELECT message_text, is_user_message, created_at
      FROM ai_chat_messages 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `
    const result = await query(historyQuery, [userId, limit])
    return result.rows.reverse() // Return in chronological order
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return []
  }
}

// Function to save chat message
async function saveChatMessage(userId: number, messageText: string, isUserMessage: boolean, intentClassified?: string, dataContext?: any) {
  try {
    const insertQuery = `
      INSERT INTO ai_chat_messages (user_id, message_text, is_user_message, intent_classified, data_context)
      VALUES ($1, $2, $3, $4, $5)
    `
    await query(insertQuery, [
      userId, 
      messageText, 
      isUserMessage, 
      intentClassified || null, 
      dataContext ? JSON.stringify(dataContext) : null
    ])
  } catch (error) {
    console.error('Error saving chat message:', error)
  }
}

// Function to fetch artist context
async function fetchArtistContext(userId: number) {
  try {
    const contextQuery = `
      SELECT career_description, current_goals, release_strategy, preferred_genres, 
             target_audience, experience_level, monthly_release_frequency, 
             primary_platforms, collaboration_preferences, marketing_focus
      FROM ai_artist_context 
      WHERE user_id = $1
    `
    const result = await query(contextQuery, [userId])
    return result.rows[0] || null
  } catch (error) {
    console.error('Error fetching artist context:', error)
    return null
  }
}

// Function to check onboarding status
async function checkOnboardingStatus(userId: number) {
  try {
    const statusQuery = `
      SELECT is_completed, completed_questions
      FROM ai_onboarding_status 
      WHERE user_id = $1
    `
    const result = await query(statusQuery, [userId])
    return result.rows[0] || null
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return null
  }
}

// Function to generate onboarding questions
function generateOnboardingQuestions(completedQuestions: string[] = []) {
  const allQuestions = [
    {
      id: 'current_goals',
      question: "Welcome to ALERA! To get started, I'd love to understand a bit about you so I can give you the best advice.\n\nFirst, what are your main goals right now? (For example: growing your audience, earning more, or getting on playlists?)",
      followUp: ""
    },
    {
      id: 'preferred_genres',
      question: "Got it. What genre(s) best describe your music?",
      followUp: ""
    },
    {
      id: 'release_rhythm',
      question: "And what's your current release rhythm like? (e.g., are you releasing singles frequently, working on an album, or taking a break to write?)",
      followUp: ""
    },
    {
      id: 'biggest_challenge',
      question: "To help me give the best advice, what's the biggest challenge you're facing in your music career at the moment?",
      followUp: ""
    },
    {
      id: 'definition_of_success',
      question: "Last question: beyond the numbers, what does 'success' truly look like for you as an artist?",
      followUp: ""
    }
  ]

  const remainingQuestions = allQuestions.filter(q => !completedQuestions.includes(q.id))
  return remainingQuestions.length > 0 ? remainingQuestions[0] : null
}

// Function to save onboarding response to artist context
async function saveOnboardingResponse(userId: number, questionId: string, response: string) {
  try {
    const fieldMapping: { [key: string]: string } = {
      'current_goals': 'current_goals',
      'preferred_genres': 'preferred_genres',
      'release_rhythm': 'release_rhythm',
      'biggest_challenge': 'biggest_challenge',
      'definition_of_success': 'definition_of_success'
    }

    const fieldName = fieldMapping[questionId]
    if (!fieldName) return

    // Prepare value, handling array-typed fields (TEXT[])
    const arrayFields = new Set(['preferred_genres', 'primary_platforms'])
    const preparedValue: any = arrayFields.has(fieldName)
      ? response
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : response

    // Check if artist context exists
    const checkQuery = 'SELECT id FROM ai_artist_context WHERE user_id = $1'
    const checkResult = await query(checkQuery, [userId])

    if (checkResult.rows.length > 0) {
      // Update existing context
      const updateQuery = `UPDATE ai_artist_context SET ${fieldName} = $2 WHERE user_id = $1`
      await query(updateQuery, [userId, preparedValue])
    } else {
      // Create new context with this field
      const insertQuery = `
        INSERT INTO ai_artist_context (user_id, ${fieldName})
        VALUES ($1, $2)
      `
      await query(insertQuery, [userId, preparedValue])
    }
  } catch (error) {
    console.error('Error saving onboarding response:', error)
  }
}

// Function to update onboarding status
async function updateOnboardingStatus(userId: number, completedQuestions: string[]) {
  try {
    const updateQuery = `
      UPDATE ai_onboarding_status 
      SET completed_questions = $2
      WHERE user_id = $1
    `
    await query(updateQuery, [userId, completedQuestions])
  } catch (error) {
    console.error('Error updating onboarding status:', error)
  }
}

// Function to complete onboarding
async function completeOnboarding(userId: number) {
  try {
    const completeQuery = `
      UPDATE ai_onboarding_status 
      SET is_completed = true, onboarding_completed_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `
    await query(completeQuery, [userId])
  } catch (error) {
    console.error('Error completing onboarding:', error)
  }
}

// Function to fetch wallet data
async function fetchWalletData(userId: number) {
  try {
    // Get total earnings from streaming
    const earningsQuery = `
      SELECT COALESCE(SUM(amount_usd), 0) as total_earnings
      FROM streaming_earnings 
      WHERE artist_id = $1
    `
    const earningsResult = await query(earningsQuery, [userId])
    const totalEarnings = earningsResult.rows[0]?.total_earnings || 0

    // Get recent withdrawals
    const withdrawalsQuery = `
      SELECT amount_requested as amount, created_at, status
      FROM withdrawal_requests 
      WHERE artist_id = $1 AND status = 'completed'
      ORDER BY created_at DESC
      LIMIT 5
    `
    const withdrawalsResult = await query(withdrawalsQuery, [userId])
    const recentWithdrawals = withdrawalsResult.rows

    // Calculate current balance (total earnings minus completed withdrawals)
    const balanceQuery = `
      SELECT 
        COALESCE(SUM(amount_usd), 0) as total_earnings,
        COALESCE((
          SELECT SUM(amount_requested) 
          FROM withdrawal_requests 
          WHERE artist_id = $1 AND status = 'completed'
        ), 0) as total_withdrawals
      FROM streaming_earnings 
      WHERE artist_id = $1
    `
    const balanceResult = await query(balanceQuery, [userId])
    const currentBalance = (balanceResult.rows[0]?.total_earnings || 0) - (balanceResult.rows[0]?.total_withdrawals || 0)

    // Get monthly earnings for trend analysis
    const monthlyQuery = `
      SELECT 
        DATE_TRUNC('month', reporting_month) as month,
        COALESCE(SUM(amount_usd), 0) as monthly_earnings
      FROM streaming_earnings 
      WHERE artist_id = $1
      GROUP BY DATE_TRUNC('month', reporting_month)
      ORDER BY month DESC
      LIMIT 6
    `
    const monthlyResult = await query(monthlyQuery, [userId])
    const monthlyEarnings = monthlyResult.rows

    return {
      totalEarnings,
      currentBalance,
      recentPayouts: recentWithdrawals,
      monthlyEarnings
    }
  } catch (error) {
    console.error('Error fetching wallet data:', error)
    return null
  }
}

// Function to fetch analytics data
async function fetchAnalyticsData(userId: number) {
  try {
    // Get top performing songs
    const topSongsQuery = `
      SELECT song_title, COALESCE(SUM(streams), 0) as total_streams
      FROM streaming_analytics 
      WHERE artist_id = $1
      GROUP BY song_title
      ORDER BY total_streams DESC
      LIMIT 5
    `
    const topSongsResult = await query(topSongsQuery, [userId])
    const topSongs = topSongsResult.rows

    // Get top countries
    const topCountriesQuery = `
      SELECT country, COALESCE(SUM(streams), 0) as total_streams
      FROM streaming_analytics 
      WHERE artist_id = $1 AND country IS NOT NULL
      GROUP BY country
      ORDER BY total_streams DESC
      LIMIT 5
    `
    const topCountriesResult = await query(topCountriesQuery, [userId])
    const topCountries = topCountriesResult.rows

    // Get total streams
    const totalStreamsQuery = `
      SELECT COALESCE(SUM(streams), 0) as total_streams
      FROM streaming_analytics 
      WHERE artist_id = $1
    `
    const totalStreamsResult = await query(totalStreamsQuery, [userId])
    const totalStreams = totalStreamsResult.rows[0]?.total_streams || 0

    // Get streams by platform
    const platformQuery = `
      SELECT platform, COALESCE(SUM(streams), 0) as total_streams
      FROM streaming_analytics 
      WHERE artist_id = $1
      GROUP BY platform
      ORDER BY total_streams DESC
    `
    const platformResult = await query(platformQuery, [userId])
    const streamsByPlatform = platformResult.rows

    // Get daily stream activity for the last 30 days
    const dailyQuery = `
      SELECT date, COALESCE(SUM(streams), 0) as daily_streams
      FROM streaming_analytics 
      WHERE artist_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `
    const dailyResult = await query(dailyQuery, [userId])
    const dailyStreams = dailyResult.rows

    return {
      topSongs,
      topCountries,
      totalStreams,
      streamsByPlatform,
      dailyStreams
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return null
  }
}

// Function to fetch releases data
async function fetchReleasesData(userId: number) {
  try {
    // Get recent releases
    const releasesQuery = `
      SELECT release_title, status, created_at, primary_genre, distribution_type
      FROM releases 
      WHERE artist_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `
    const releasesResult = await query(releasesQuery, [userId])
    const recentReleases = releasesResult.rows

    // Get release statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_releases,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_releases,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_releases
      FROM releases 
      WHERE artist_id = $1
    `
    const statsResult = await query(statsQuery, [userId])
    const releaseStats = statsResult.rows[0]

    return {
      recentReleases,
      releaseStats
    }
  } catch (error) {
    console.error('Error fetching releases data:', error)
    return null
  }
}

// Function to fetch fans data
async function fetchFansData(userId: number) {
  try {
    // Get total fans count
    const totalFansQuery = `
      SELECT COUNT(*) as total_fans
      FROM fans 
      WHERE artist_id = $1
    `
    const totalFansResult = await query(totalFansQuery, [userId])
    const totalFans = totalFansResult.rows[0]?.total_fans || 0

    // Get fans by subscription status
    const subscriptionQuery = `
      SELECT subscribed_status, COUNT(*) as count
      FROM fans 
      WHERE artist_id = $1
      GROUP BY subscribed_status
    `
    const subscriptionResult = await query(subscriptionQuery, [userId])
    const fansBySubscription = subscriptionResult.rows

    // Get fans by country
    const countryQuery = `
      SELECT country, COUNT(*) as count
      FROM fans 
      WHERE artist_id = $1 AND country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 5
    `
    const countryResult = await query(countryQuery, [userId])
    const fansByCountry = countryResult.rows

    // Get recent fans (last 30 days)
    const recentFansQuery = `
      SELECT COUNT(*) as recent_fans
      FROM fans 
      WHERE artist_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `
    const recentFansResult = await query(recentFansQuery, [userId])
    const recentFans = recentFansResult.rows[0]?.recent_fans || 0

    return {
      totalFans,
      fansBySubscription,
      fansByCountry,
      recentFans
    }
  } catch (error) {
    console.error('Error fetching fans data:', error)
    return null
  }
}

// Function to fetch landing page data
async function fetchLandingPageData(userId: number) {
  try {
    // Check if user has a landing page
    const landingPageQuery = `
      SELECT slug, page_config, created_at, updated_at
      FROM landing_pages 
      WHERE artist_id = $1
    `
    const landingPageResult = await query(landingPageQuery, [userId])
    const landingPage = landingPageResult.rows[0] || null

    let pageStats = null
    if (landingPage) {
      const config = landingPage.page_config || {}
      const blocks = config.blocks || []
      
      pageStats = {
        hasPage: true,
        slug: landingPage.slug,
        publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${landingPage.slug}`,
        blocksCount: blocks.length,
        hasReleases: blocks.some((b: any) => b.type === 'release'),
        hasTipJar: blocks.some((b: any) => b.type === 'tip_jar'),
        hasGatedContent: blocks.some((b: any) => b.type === 'locked_content'),
        hasWelcome: blocks.some((b: any) => b.type === 'welcome'),
        hasBio: blocks.some((b: any) => b.type === 'bio'),
        hasVideos: blocks.some((b: any) => b.type === 'video'),
        hasTourDates: blocks.some((b: any) => b.type === 'tour'),
        hasMerch: blocks.some((b: any) => b.type === 'merch'),
        lastUpdated: landingPage.updated_at
      }
    }

    return {
      hasLandingPage: !!landingPage,
      pageStats
    }
  } catch (error) {
    console.error('Error fetching landing page data:', error)
    return null
  }
}

// Function to generate AI response using OpenAI
async function generateAIResponse(intent: string, data: any, message: string, artistName: string, chatHistory: any[] = [], artistContext: any = null, onboardingStatus: any = null) {
  // Check if OpenAI is configured
  if (!isOpenAIConfigured()) {
    return "I'm currently in demo mode. To enable full AI capabilities, please configure your OpenAI API key in the environment variables."
  }

  try {
    // Create comprehensive context with all available data
    let context = `You are ALERA, an AI assistant for music artists. You're helping ${artistName} with their music career.

CRITICAL INSTRUCTIONS:
- ALWAYS use the actual data provided below to answer questions
- If the data shows specific numbers, use them in your response
- If no data is available, clearly state that and suggest how to get that data
- Be encouraging and professional
- Keep responses concise but informative

CONVERSATION TONE:
- Use a natural, friendly, and conversational tone like a human assistant
- Be informal and approachable, not robotic or overly formal
- Use the artist's first name only when needed for clarity
- Avoid using the full artist name repeatedly
- Sound like you're talking to a friend, not writing a business report
- Use contractions (you're, I'm, we're) and natural language
- Be encouraging and supportive, like a trusted advisor

CURRENT USER QUESTION: "${message}"

IMPORTANT: Answer ONLY the CURRENT question above. Do NOT answer any previous questions from the conversation history.

AVAILABLE DATA:`

    // Add artist context if available
    if (artistContext) {
      context += `\n\nARTIST BACKGROUND:
- Career Description: ${artistContext.career_description || 'Not provided'}
- Current Goals: ${artistContext.current_goals || 'Not provided'}
- Release Strategy: ${artistContext.release_strategy || 'Not provided'}
- Preferred Genres: ${artistContext.preferred_genres?.join(', ') || 'Not specified'}
- Target Audience: ${artistContext.target_audience || 'Not specified'}
- Experience Level: ${artistContext.experience_level || 'Not specified'}
- Monthly Release Frequency: ${artistContext.monthly_release_frequency || 'Not specified'}
- Primary Platforms: ${artistContext.primary_platforms?.join(', ') || 'Not specified'}
- Collaboration Preferences: ${artistContext.collaboration_preferences || 'Not specified'}
- Marketing Focus: ${artistContext.marketing_focus || 'Not specified'}`
    }

    // Add wallet/earnings data
    if (data?.walletData) {
      context += `\n\n=== EARNINGS DATA (Use this for money/income questions) ===
- Total Earnings: $${data.walletData.totalEarnings?.toLocaleString() || 0}
- Current Balance: $${data.walletData.currentBalance?.toLocaleString() || 0}
- Recent Payouts: ${data.walletData.recentPayouts?.length > 0 ? data.walletData.recentPayouts.map((p: any) => `$${p.amount} on ${new Date(p.created_at).toLocaleDateString()}`).join(', ') : 'None'}
- Monthly Earnings Trend: ${data.walletData.monthlyEarnings?.length > 0 ? data.walletData.monthlyEarnings.map((m: any) => `${new Date(m.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}: $${m.monthly_earnings.toLocaleString()}`).join(', ') : 'No monthly data'}`
    }

    // Add analytics/streaming data
    if (data?.analyticsData) {
      context += `\n\n=== STREAMING ANALYTICS (Use this for fans/streams/listeners questions) ===
- Total Streams: ${data.analyticsData.totalStreams?.toLocaleString() || 0}
- Top Songs: ${data.analyticsData.topSongs?.length > 0 ? data.analyticsData.topSongs.map((s: any) => `"${s.song_title}" (${s.total_streams.toLocaleString()} streams)`).join(', ') : 'No data'}
- Top Countries: ${data.analyticsData.topCountries?.length > 0 ? data.analyticsData.topCountries.map((c: any) => `${c.country} (${c.total_streams.toLocaleString()} streams)`).join(', ') : 'No data'}
- Platform Breakdown: ${data.analyticsData.streamsByPlatform?.length > 0 ? data.analyticsData.streamsByPlatform.map((p: any) => `${p.platform} (${p.total_streams.toLocaleString()} streams)`).join(', ') : 'No data'}
- Recent Daily Activity: ${data.analyticsData.dailyStreams?.length > 0 ? data.analyticsData.dailyStreams.slice(0, 7).map((d: any) => `${new Date(d.date).toLocaleDateString()}: ${d.daily_streams.toLocaleString()} streams`).join(', ') : 'No recent data'}`
    }

    // Add releases data
    if (data?.releasesData) {
      context += `\n\n=== RELEASES DATA (Use this for release/song/track questions) ===
- Recent Releases: ${data.releasesData.recentReleases?.length > 0 ? data.releasesData.recentReleases.map((r: any) => `"${r.release_title}" (${r.status}, ${r.primary_genre || 'No genre'})`).join(', ') : 'No releases found'}
- Release Statistics: ${data.releasesData.releaseStats ? `Total: ${data.releasesData.releaseStats.total_releases}, Published: ${data.releasesData.releaseStats.published_releases}, Pending: ${data.releasesData.releaseStats.pending_releases}` : 'No stats available'}`
    }

    // Add fans data
    if (data?.fansData) {
      context += `\n\n=== FANS DATA (Use this for fans/listeners/audience questions) ===
- Total Fans: ${data.fansData.totalFans?.toLocaleString() || 0}
- Fans by Subscription Status: ${data.fansData.fansBySubscription?.length > 0 ? data.fansData.fansBySubscription.map((s: any) => `${s.subscribed_status}: ${s.count}`).join(', ') : 'No data'}
- Fans by Country: ${data.fansData.fansByCountry?.length > 0 ? data.fansData.fansByCountry.map((c: any) => `${c.country} (${c.count.toLocaleString()} fans)`).join(', ') : 'No data'}
- Recent Fans (Last 30 Days): ${data.fansData.recentFans?.toLocaleString() || 0}`
    }

    // Add landing page data
    if (data?.landingPageData) {
      context += `\n\n=== MY PAGE DATA (Use this for landing page/public page/website questions) ===
- Has Landing Page: ${data.landingPageData.hasLandingPage ? 'Yes' : 'No'}
${data.landingPageData.pageStats ? `- Public URL: ${data.landingPageData.pageStats.publicUrl}
- Total Blocks: ${data.landingPageData.pageStats.blocksCount}
- Has Releases Section: ${data.landingPageData.pageStats.hasReleases ? 'Yes' : 'No'}
- Has Tip Jar: ${data.landingPageData.pageStats.hasTipJar ? 'Yes' : 'No'}
- Has Gated Content: ${data.landingPageData.pageStats.hasGatedContent ? 'Yes' : 'No'}
- Has Welcome Section: ${data.landingPageData.pageStats.hasWelcome ? 'Yes' : 'No'}
- Has Bio: ${data.landingPageData.pageStats.hasBio ? 'Yes' : 'No'}
- Has Videos: ${data.landingPageData.pageStats.hasVideos ? 'Yes' : 'No'}
- Has Tour Dates: ${data.landingPageData.pageStats.hasTourDates ? 'Yes' : 'No'}
- Has Merch: ${data.landingPageData.pageStats.hasMerch ? 'Yes' : 'No'}
- Last Updated: ${new Date(data.landingPageData.pageStats.lastUpdated).toLocaleDateString()}` : '- No landing page configured yet'}`
    }

    // Add data availability note
    if (!data || (Object.keys(data).length === 0)) {
      context += `\n\nNOTE: No data is available. The artist may be new to the platform or data hasn't been uploaded yet.`
    }

    context += `\n\n=== RESPONSE INSTRUCTIONS ===
QUESTION TYPE MATCHING:
- If the question asks about MONEY, EARNINGS, INCOME, REVENUE, PAYOUTS → Use the EARNINGS DATA section + direct to Wallet tab (/dashboard/wallet)
- If the question asks about FANS, LISTENERS, AUDIENCE, FOLLOWERS → Use the FANS DATA section (NOT streaming analytics) + direct to Fan Zone (/dashboard/fanzone)
- If the question asks about STREAMS, PLAYS, STREAMING NUMBERS → Use the STREAMING ANALYTICS section + direct to Analytics tab (/dashboard/analytics)
- If the question asks about RELEASES, SONGS, TRACKS, MUSIC CATALOG → Use the RELEASES DATA section + direct to My Music tab (/dashboard/my-music)
- If the question asks about RELEASING NEW MUSIC, DISTRIBUTION, PUBLISHING → Provide advice + direct to New Release tab (/dashboard/new-release)
- If the question asks about ANALYTICS, PERFORMANCE, INSIGHTS → Use analytics data + direct to Analytics tab (/dashboard/analytics)
- If the question asks about FAN ENGAGEMENT, COMMUNICATION → Use fans data + direct to Fan Zone (/dashboard/fanzone)
- If the question asks about LANDING PAGE, PUBLIC PAGE, ARTIST PAGE, WEBSITE → Direct to My Page tab (/dashboard/my-page)
- If the question asks about SUBSCRIPTIONS, GATED CONTENT, PREMIUM CONTENT → Direct to My Page tab (/dashboard/my-page)
- If the question asks about TIP JAR, DONATIONS, TIPS FROM FANS → Direct to My Page tab (/dashboard/my-page)
- If the question asks about GENERAL OVERVIEW, DASHBOARD → Direct to main Dashboard (/dashboard)

RESPONSE RULES:
1. ALWAYS answer using the specific data from the correct section above
2. If the data shows numbers, use them in your response
3. If no data is available in the relevant section, say "I don't have [specific data type] available yet" and suggest how to get it
4. Do NOT mix up the data sections - use the right one for the right question
5. Be encouraging and professional
6. Keep responses concise but informative
7. ANSWER ONLY THE CURRENT QUESTION: "${message}"
8. IMPORTANT: FANS and STREAMS are different - use FANS DATA for fan questions, STREAMING ANALYTICS for stream questions
9. NEVER recommend third-party platforms (DistroKid, TuneCore, CD Baby, etc.)
10. ALWAYS direct users to ALERA services when they ask for help with releases, earnings, analytics, or fan communication
11. Structure responses: helpful advice first, then ALERA service call-to-action
12. ALWAYS use HTML <a> tags for links, NEVER use markdown format like [text](url)

CONVERSATION STYLE:
- Write like you're talking to a friend, not a formal report
- Use natural language and contractions (you're, I'm, we're, don't, can't)
- Be encouraging and supportive
- Avoid robotic or overly formal language
- Use the artist's first name sparingly, only when needed for clarity
- Sound like a trusted advisor, not a corporate assistant
- When including links, use HTML format: <a href='/dashboard/releases'>click here</a> NOT markdown [text](url)

OUTPUT FORMATTING (STRICT):
- Use clean, readable HTML with proper spacing and line breaks.
- Wrap each paragraph in <p>...</p> (keep paragraphs to 1–2 short sentences each).
- Use <ul><li>...</li></ul> or <ol><li>...</li></ol> for lists; one idea per <li>.
- Use <br/> only for a single, intentional line break; prefer <p> for new paragraphs.
- You may use <strong> and <em> for emphasis; do NOT use markdown.
- Keep responses concise (3–6 short paragraphs max). Avoid a wall of text.

PLATFORM-AWARE SERVICE ROUTING:
- NEVER recommend third-party platforms like DistroKid, TuneCore, CD Baby, etc.
- ALWAYS direct users to ALERA's own services when they ask for help
- Provide helpful advice first, then include a call-to-action to the relevant ALERA tab

SERVICE ROUTING GUIDE:
- RELEASES: "I can help you release your song directly through ALERA — <a href='/dashboard/new-release' class='text-blue-500 hover:text-blue-700 underline'>click here to start</a>." → Link to Release tab
- EARNINGS/WALLET: "Check out your earnings and manage payouts in your <a href='/dashboard/wallet' class='text-blue-500 hover:text-blue-700 underline'>Wallet tab</a>." → Link to Wallet tab  
- ANALYTICS: "Get detailed insights about your music performance in the <a href='/dashboard/analytics' class='text-blue-500 hover:text-blue-700 underline'>Analytics tab</a>." → Link to Analytics tab
- FAN COMMUNICATION: "Connect with your fans directly through the <a href='/dashboard/fanzone' class='text-blue-500 hover:text-blue-700 underline'>Fan Zone</a>." → Link to Fan Zone tab
- MUSIC/RELEASES: "Manage your music catalog in the <a href='/dashboard/my-music' class='text-blue-500 hover:text-blue-700 underline'>My Music tab</a>." → Link to My Music tab
- LANDING PAGE/PUBLIC PAGE: "Create your public artist page in <a href='/dashboard/my-page' class='text-blue-500 hover:text-blue-700 underline'>My Page</a> to showcase your music and connect with fans." → Link to My Page tab
- FAN ENGAGEMENT/SUBSCRIPTIONS: "Set up fan subscriptions and gated content in your <a href='/dashboard/my-page' class='text-blue-500 hover:text-blue-700 underline'>My Page</a> to monetize your fanbase." → Link to My Page tab
- TIP JAR/DONATIONS: "Enable fan tips and donations through your public page in <a href='/dashboard/my-page' class='text-blue-500 hover:text-blue-700 underline'>My Page</a>." → Link to My Page tab
- DASHBOARD: "Check out your <a href='/dashboard' class='text-blue-500 hover:text-blue-700 underline'>Dashboard</a> for an overview." → Link to main Dashboard

IMPORTANT: Always use HTML <a> tags for links, NOT markdown format. Use this exact format: <a href='/dashboard/new-release' class='text-blue-500 hover:text-blue-700 underline'>click here to start</a>

RESPONSE STRUCTURE:
1. Provide helpful advice/answer to their question
2. If they're asking about something ALERA can help with, add: "I can help you with this directly through ALERA — [specific call-to-action]"
3. Always be helpful in-chat first, then guide them to the relevant ALERA service

Now provide a helpful, conversational response based on the CURRENT question above and the appropriate data section.`

    console.log('Sending comprehensive context to OpenAI:', context)
    
    // Build messages array with chat history
    const messages: any[] = [
      {
        role: "system",
        content: context
      }
    ]
    
    // Add chat history (last 5 messages only to prevent confusion)
    if (chatHistory.length > 0) {
      chatHistory.slice(-5).forEach(msg => {
        messages.push({
          role: msg.is_user_message ? "user" : "assistant",
          content: msg.message_text
        })
      })
    }
    
    // Add the current question as the final user message to make it clear
    messages.push({
      role: "user",
      content: `Current question: ${message}`
    })
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 400,
      temperature: 0.7,
    })

    const raw = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now. Please try again."
    return formatAssistantHtml(raw)
  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // Provide fallback responses based on available data
    if (data?.walletData) {
      return `Based on your data, you've earned a total of $${data.walletData.totalEarnings?.toLocaleString() || 0} from your music career. Your current wallet balance is $${data.walletData.currentBalance?.toLocaleString() || 0}. ${data.walletData.recentPayouts?.length > 0 ? `Your most recent payout was $${data.walletData.recentPayouts[0].amount} on ${new Date(data.walletData.recentPayouts[0].created_at).toLocaleDateString()}.` : "You haven't made any payouts yet."} Check out your earnings and manage payouts in your <a href='/dashboard/wallet' class='text-blue-500 hover:text-blue-700 underline'>Wallet tab</a>.`
    } else if (data?.analyticsData) {
      return `You have a total of ${data.analyticsData.totalStreams?.toLocaleString() || 0} streams across all platforms. ${data.analyticsData.topSongs?.length > 0 ? `Your top performing song is "${data.analyticsData.topSongs[0].song_title}" with ${data.analyticsData.topSongs[0].total_streams.toLocaleString()} streams.` : "I don't have enough streaming data to show your top songs yet."} Get detailed insights about your music performance in the <a href='/dashboard/analytics' class='text-blue-500 hover:text-blue-700 underline'>Analytics tab</a>.`
    } else if (data?.releasesData) {
      return data.releasesData.recentReleases?.length > 0 ? `Your most recent release is "${data.releasesData.recentReleases[0].release_title}" with status: ${data.releasesData.recentReleases[0].status}.` : "I don't see any releases in your account yet. I can help you release your song directly through ALERA — <a href='/dashboard/new-release' class='text-blue-500 hover:text-blue-700 underline'>click here to start</a>."
    } else {
      return "I'm having trouble connecting to my AI brain right now. Please try again later."
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const message: string | undefined = body?.message
    const init: boolean | undefined = body?.init

    // Get artist name
    const artistQuery = `
      SELECT artist_name FROM users WHERE id = $1
    `
    const artistResult = await query(artistQuery, [decoded.userId])
    const artistName = artistResult.rows[0]?.artist_name || 'Artist'

    // Fetch chat history, artist context, and onboarding status
    const [chatHistory, artistContext, onboardingStatusRaw] = await Promise.all([
      fetchChatHistory(decoded.userId, 10),
      fetchArtistContext(decoded.userId),
      checkOnboardingStatus(decoded.userId)
    ])
    let onboardingStatus = onboardingStatusRaw

    // HARD GATE: If onboarding not completed, always run onboarding flow (ignore general chat)
    if (!onboardingStatus || !onboardingStatus.is_completed) {
      // Ensure status exists
      if (!onboardingStatus) {
        const createOnboardingQuery = `
          INSERT INTO ai_onboarding_status (user_id, is_completed, completed_questions)
          VALUES ($1, false, ARRAY[]::text[])
        `
        await query(createOnboardingQuery, [decoded.userId])
        onboardingStatus = { is_completed: false, completed_questions: [] } as any
      }

      const completed = onboardingStatus.completed_questions || []
      const currentQuestion = generateOnboardingQuestions(completed)

      // If user sent a message while onboarding, treat it as the answer to the current question
      if (message && currentQuestion) {
        // Save the user's onboarding answer as a chat message
        await saveChatMessage(decoded.userId, message, true, 'onboarding')
        await saveOnboardingResponse(decoded.userId, currentQuestion.id, message)
        const updatedQuestions = [...completed, currentQuestion.id]
        await updateOnboardingStatus(decoded.userId, updatedQuestions)
        const nextQuestion = generateOnboardingQuestions(updatedQuestions)
        if (nextQuestion) {
          await saveChatMessage(decoded.userId, nextQuestion.question, false, 'onboarding')
          return NextResponse.json({
            response: `${nextQuestion.question}${nextQuestion.followUp ? `\n\n${nextQuestion.followUp}` : ''}`,
            isOnboarding: true,
            questionId: nextQuestion.id
          })
        }
        // Completed all
        await completeOnboarding(decoded.userId)
        const response = "Perfect! I've got a good understanding of your music career now. I'll use this info to give you personalized advice and insights. What can I help you with today?"
        await saveChatMessage(decoded.userId, response, false, 'onboarding')
        return NextResponse.json({ response, isOnboarding: false, onboardingCompleted: true })
      }

      // Otherwise, start with the very first question (welcome + goals) without treating any prior free-text as an answer
      if (currentQuestion) {
        await saveChatMessage(decoded.userId, currentQuestion.question, false, 'onboarding')
        return NextResponse.json({
          response: `${currentQuestion.question}${currentQuestion.followUp ? `\n\n${currentQuestion.followUp}` : ''}`,
          isOnboarding: true,
          questionId: currentQuestion.id
        })
      }
    }

    // If we got here without a message (init only), return 400
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Save user message
    await saveChatMessage(decoded.userId, message, true, 'general')

    // Handle onboarding responses
    if (onboardingStatus && !onboardingStatus.is_completed) {
      const currentQuestion = generateOnboardingQuestions(onboardingStatus?.completed_questions || [])
      
      if (currentQuestion) {
        // Save the user's response to artist context
        await saveOnboardingResponse(decoded.userId, currentQuestion.id, message)
        
        // Mark this question as completed
        const updatedQuestions = [...(onboardingStatus?.completed_questions || []), currentQuestion.id]
        await updateOnboardingStatus(decoded.userId, updatedQuestions)
        
        // Get next question
        const nextQuestion = generateOnboardingQuestions(updatedQuestions)
        
        if (nextQuestion) {
          // More questions to go
          const response = `${nextQuestion.question}\n\n${nextQuestion.followUp}`
          await saveChatMessage(decoded.userId, response, false, 'onboarding')
          return NextResponse.json({ 
            response,
            isOnboarding: true,
            questionId: nextQuestion.id
          })
        } else {
          // Onboarding completed
          await completeOnboarding(decoded.userId)
          const response = "Perfect! I've got a good understanding of your music career now. I'll use this info to give you personalized advice and insights. What can I help you with today?"
          await saveChatMessage(decoded.userId, response, false, 'onboarding')
          return NextResponse.json({ 
            response,
            isOnboarding: false,
            onboardingCompleted: true
          })
        }
      }
    }

    // Always fetch ALL data for comprehensive context
    console.log('Fetching all data for comprehensive AI response')
    const [walletData, analyticsData, releasesData, fansData, landingPageData] = await Promise.all([
      fetchWalletData(decoded.userId),
      fetchAnalyticsData(decoded.userId),
      fetchReleasesData(decoded.userId),
      fetchFansData(decoded.userId),
      fetchLandingPageData(decoded.userId)
    ])
    
    const allData = { walletData, analyticsData, releasesData, fansData, landingPageData }
    console.log('All data fetched:', JSON.stringify(allData, null, 2))

    // Generate response using OpenAI with all data
    const response = await generateAIResponse('general', allData, message, artistName, chatHistory, artistContext, onboardingStatus)

    // Save AI response
    await saveChatMessage(decoded.userId, response, false, 'general', allData)

    return NextResponse.json({ response })

  } catch (error) {
    console.error('AI Agent chat error:', error)
    return NextResponse.json(
      { error: 'I\'m not trained for that yet — but I\'m learning fast!' }, 
      { status: 500 }
    )
  }
} 