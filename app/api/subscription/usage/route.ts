import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/subscription-middleware'
import { getSubscription, getDailyTokenUsage, getMonthlyTokenUsage, getPendingReleasesCount } from '@/lib/subscription-utils'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await requireAuth(request)
    
    // Get user's subscription
    const subscription = await getSubscription(userId)
    
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current' // current, last7days, last30days
    
    // Get current usage
    const [dailyTokenUsage, monthlyTokenUsage, pendingReleases] = await Promise.all([
      getDailyTokenUsage(userId),
      subscription.tier === 'plus' ? getMonthlyTokenUsage(userId, subscription.created_at) : 0,
      getPendingReleasesCount(userId)
    ])
    
    // Get historical AI usage data
    let aiUsageHistory = []
    let dateRange = ''
    
    if (period === 'last7days') {
      dateRange = "AND usage_date >= CURRENT_DATE - INTERVAL '7 days'"
    } else if (period === 'last30days') {
      dateRange = "AND usage_date >= CURRENT_DATE - INTERVAL '30 days'"
    } else {
      // Current period based on subscription tier
      if (subscription.tier === 'trial') {
        dateRange = "AND usage_date = CURRENT_DATE"
      } else if (subscription.tier === 'plus') {
        // Current billing cycle
        const startDate = new Date(subscription.created_at)
        const dayOfMonth = startDate.getDate()
        const now = new Date()
        const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
        
        if (currentPeriodStart > now) {
          currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1)
        }
        
        dateRange = `AND usage_date >= '${currentPeriodStart.toISOString().split('T')[0]}'`
      }
    }
    
    // Get AI usage history
    const usageHistoryResult = await query(`
      SELECT usage_date, tokens_used
      FROM ai_usage 
      WHERE user_id = $1 ${dateRange}
      ORDER BY usage_date DESC
      LIMIT 30
    `, [userId])
    
    aiUsageHistory = usageHistoryResult.rows.map(row => ({
      date: row.usage_date,
      tokens: row.tokens_used
    }))
    
    // Get release history
    const releaseHistoryResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as releases_created,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as pending_releases,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_releases,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_releases
      FROM releases 
      WHERE artist_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [userId])
    
    const releaseHistory = releaseHistoryResult.rows.map(row => ({
      date: row.date,
      created: parseInt(row.releases_created),
      pending: parseInt(row.pending_releases),
      approved: parseInt(row.approved_releases),
      published: parseInt(row.published_releases)
    }))
    
    // Calculate usage statistics
    const totalTokensUsed = aiUsageHistory.reduce((sum, day) => sum + day.tokens, 0)
    const averageDailyTokens = aiUsageHistory.length > 0 ? Math.round(totalTokensUsed / aiUsageHistory.length) : 0
    
    // Get usage limits based on tier
    let limits = {
      aiTokens: {
        daily: subscription.tier === 'trial' ? 1500 : -1, // -1 means unlimited
        monthly: subscription.tier === 'plus' ? 100000 : -1
      },
      releases: {
        pending: subscription.tier === 'trial' ? 1 : -1
      }
    }
    
    // Calculate remaining allowances
    const remaining = {
      aiTokens: {
        daily: subscription.tier === 'trial' ? Math.max(0, 1500 - dailyTokenUsage) : -1,
        monthly: subscription.tier === 'plus' ? Math.max(0, 100000 - monthlyTokenUsage) : -1
      },
      releases: {
        pending: subscription.tier === 'trial' ? Math.max(0, 1 - pendingReleases) : -1
      }
    }
    
    return NextResponse.json({
      subscription: {
        tier: subscription.tier,
        status: subscription.status
      },
      current: {
        aiTokens: {
          daily: dailyTokenUsage,
          monthly: monthlyTokenUsage,
          total: totalTokensUsed
        },
        releases: {
          pending: pendingReleases,
          total: releaseHistory.reduce((sum, day) => sum + day.created, 0)
        }
      },
      limits,
      remaining,
      statistics: {
        averageDailyTokens,
        totalDaysActive: aiUsageHistory.length,
        peakDayTokens: Math.max(...aiUsageHistory.map(day => day.tokens), 0)
      },
      history: {
        aiUsage: aiUsageHistory,
        releases: releaseHistory
      },
      period
    })
  } catch (error) {
    console.error('Subscription usage error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get usage data' },
      { status: 500 }
    )
  }
}
