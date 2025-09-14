import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/subscription-middleware'
import { getSubscription, createSubscription, getDaysRemaining, isSubscriptionExpired, getDailyTokenUsage, getMonthlyTokenUsage, getPendingReleasesCount } from '@/lib/subscription-utils'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await requireAuth(request)
    
    // Get user's subscription
    const subscription = await getSubscription(userId)
    
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }
    
    // Calculate subscription details
    const isExpired = isSubscriptionExpired(subscription)
    const daysRemaining = getDaysRemaining(subscription)
    
    // Get current usage statistics
    const [dailyTokenUsage, monthlyTokenUsage, pendingReleases] = await Promise.all([
      getDailyTokenUsage(userId),
      subscription.tier === 'plus' ? getMonthlyTokenUsage(userId, subscription.created_at) : 0,
      getPendingReleasesCount(userId)
    ])
    
    // Calculate limits based on tier
    let aiTokenLimits = {
      used: 0,
      limit: 0,
      resetDate: new Date(),
      resetType: 'unlimited' as 'daily' | 'monthly' | 'unlimited'
    }
    
    if (subscription.tier === 'trial') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      aiTokenLimits = {
        used: dailyTokenUsage,
        limit: 1500,
        resetDate: tomorrow,
        resetType: 'daily'
      }
    } else if (subscription.tier === 'plus') {
      // Calculate next billing cycle date (30 days from subscription start)
      const startDate = new Date(subscription.created_at)
      const dayOfMonth = startDate.getDate()
      const now = new Date()
      const nextReset = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
      
      // If we haven't reached the billing day this month, use this month
      // Otherwise, use next month
      if (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 1)
      }
      
      aiTokenLimits = {
        used: monthlyTokenUsage,
        limit: 100000,
        resetDate: nextReset,
        resetType: 'monthly'
      }
    } else if (subscription.tier === 'pro') {
      aiTokenLimits = {
        used: 0,
        limit: 0,
        resetDate: new Date(),
        resetType: 'unlimited'
      }
    }
    
    // Release limits
    const releaseLimits = {
      pending: pendingReleases,
      limit: subscription.tier === 'trial' ? 1 : -1 // -1 means unlimited
    }
    
    // Feature access based on tier
    const featureAccess = {
      release_creation: subscription.tier !== 'trial' || pendingReleases < 1,
      ai_agent: subscription.tier === 'pro' || 
                (subscription.tier === 'trial' && dailyTokenUsage < 1500) ||
                (subscription.tier === 'plus' && monthlyTokenUsage < 100000),
      fan_campaigns: subscription.tier === 'pro' || subscription.tier === 'trial',
      fan_import: subscription.tier === 'pro' || subscription.tier === 'trial',
      tip_jar: subscription.tier === 'pro' || subscription.tier === 'trial',
      paid_subscriptions: subscription.tier === 'pro' || subscription.tier === 'trial',
      analytics_advanced: true // All tiers have access
    }
    
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        isExpired,
        daysRemaining,
        trialExpiresAt: subscription.trial_expires_at?.toISOString(),
        subscriptionExpiresAt: subscription.subscription_expires_at?.toISOString(),
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id
      },
      usage: {
        aiTokens: aiTokenLimits,
        releases: releaseLimits
      },
      featureAccess,
      upgradeAvailable: {
        canUpgradeToPlus: subscription.tier === 'trial',
        canUpgradeToPro: subscription.tier === 'trial' || subscription.tier === 'plus'
      }
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
