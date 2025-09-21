import { query } from './db'

export interface Subscription {
  id: number
  user_id: number
  tier: 'trial' | 'plus' | 'pro'
  status: 'active' | 'expired' | 'cancelled' | 'pending_payment' | 'payment_failed'
  trial_expires_at?: Date
  subscription_expires_at?: Date
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: Date
  updated_at: Date
}

export interface SubscriptionCheck {
  allowed: boolean
  reason?: string
  upgradeRequired?: 'plus' | 'pro'
  remainingUsage?: number
}

export type FeatureType = 
  | 'release_creation'
  | 'ai_agent'
  | 'fan_campaigns'
  | 'fan_import'
  | 'tip_jar'
  | 'paid_subscriptions'
  | 'analytics_advanced'

// Get user's subscription
export async function getSubscription(userId: number): Promise<Subscription | null> {
  try {
    const result = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Check if trial is expired
export function isTrialExpired(subscription: Subscription): boolean {
  if (subscription.tier !== 'trial') return false
  if (!subscription.trial_expires_at) return false
  
  return new Date() > new Date(subscription.trial_expires_at)
}

// Check if subscription is expired
export function isSubscriptionExpired(subscription: Subscription): boolean {
  if (subscription.tier === 'trial') {
    return isTrialExpired(subscription)
  }
  
  if (!subscription.subscription_expires_at) return false
  return new Date() > new Date(subscription.subscription_expires_at)
}

// Get days remaining in trial
export function getDaysRemaining(subscription: Subscription): number {
  if (subscription.tier !== 'trial' || !subscription.trial_expires_at) {
    return 0
  }
  
  const now = new Date()
  const expiresAt = new Date(subscription.trial_expires_at)
  const diffTime = expiresAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

// Get daily AI token usage
export async function getDailyTokenUsage(userId: number, date: Date = new Date()): Promise<number> {
  try {
    const dateStr = date.toISOString().split('T')[0]
    const result = await query(
      'SELECT tokens_used FROM ai_usage WHERE user_id = $1 AND usage_date = $2',
      [userId, dateStr]
    )
    
    return result.rows[0]?.tokens_used || 0
  } catch (error) {
    console.error('Error fetching daily token usage:', error)
    return 0
  }
}

// Get monthly AI token usage (for Plus tier - resets 30 days from subscription)
export async function getMonthlyTokenUsage(userId: number, subscriptionStartDate: Date): Promise<number> {
  try {
    const now = new Date()
    const startDate = new Date(subscriptionStartDate)
    
    // Calculate current billing period start (30 days from subscription start)
    const dayOfMonth = startDate.getDate()
    let currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
    
    // If we haven't reached the billing day this month, use last month
    if (currentPeriodStart > now) {
      currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1)
    }
    
    // Ensure we don't go before the actual subscription start date
    if (currentPeriodStart < startDate) {
      currentPeriodStart = startDate
    }
    
    const result = await query(`
      SELECT COALESCE(SUM(tokens_used), 0) as total_tokens
      FROM ai_usage 
      WHERE user_id = $1 AND usage_date >= $2
    `, [userId, currentPeriodStart.toISOString().split('T')[0]])
    
    return parseInt(result.rows[0]?.total_tokens || '0')
  } catch (error) {
    console.error('Error fetching monthly token usage:', error)
    return 0
  }
}

// Track AI token usage
export async function trackAIUsage(userId: number, tokens: number, date: Date = new Date()): Promise<void> {
  try {
    await query('SELECT add_ai_tokens($1, $2, $3)', [userId, tokens, date.toISOString().split('T')[0]])
  } catch (error) {
    console.error('Error tracking AI usage:', error)
  }
}

// Count pending releases for user (draft + under_review)
export async function getPendingReleasesCount(userId: number): Promise<number> {
  try {
    const result = await query(
      "SELECT COUNT(*) FROM releases WHERE artist_id = $1 AND (status = 'under_review' OR status = 'draft')",
      [userId]
    )
    
    return parseInt(result.rows[0]?.count || '0')
  } catch (error) {
    console.error('Error counting pending releases:', error)
    return 0
  }
}

// Count total releases for user (ALL statuses - for trial limit check)
export async function getTotalReleasesCount(userId: number): Promise<number> {
  try {
    const result = await query(
      "SELECT COUNT(*) FROM releases WHERE artist_id = $1",
      [userId]
    )
    
    return parseInt(result.rows[0]?.count || '0')
  } catch (error) {
    console.error('Error counting total releases:', error)
    return 0
  }
}

// Check release creation limits
export async function checkReleaseLimit(userId: number, releaseType?: string): Promise<SubscriptionCheck> {
  const subscription = await getSubscription(userId)
  
  if (!subscription) {
    return { allowed: false, reason: 'No subscription found' }
  }
  
  // Check if subscription is expired
  if (isSubscriptionExpired(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription expired',
      upgradeRequired: 'plus'
    }
  }
  
  // CRITICAL FIX: Users with pending or failed payments should be treated as trial users
  if (subscription.status === 'pending_payment' || subscription.status === 'payment_failed') {
    // Treat as trial user for access control
    console.log(`User ${userId} has ${subscription.status} status - treating as trial user`)
  }
  
  // Only trial users (and users with payment issues) have release limits
  if (subscription.tier !== 'trial' && subscription.status === 'active') {
    return { allowed: true }
  }
  
  // Trial users can only create Singles
  if (releaseType && releaseType !== 'Single') {
    return {
      allowed: false,
      reason: 'Trial users can only create Single releases. Upgrade to create EPs or Albums.',
      upgradeRequired: 'plus'
    }
  }
  
  const totalReleases = await getTotalReleasesCount(userId)
  
  if (totalReleases >= 1) {
    return {
      allowed: false,
      reason: 'Trial users can only have 1 release total (regardless of status)',
      upgradeRequired: 'plus'
    }
  }
  
  return { allowed: true }
}

// Check AI token limits
export async function checkAITokens(userId: number, requestedTokens: number): Promise<SubscriptionCheck> {
  const subscription = await getSubscription(userId)
  
  if (!subscription) {
    return { allowed: false, reason: 'No subscription found' }
  }
  
  // CRITICAL FIX: Users with pending or failed payments should be treated as trial users
  if (subscription.status === 'pending_payment' || subscription.status === 'payment_failed') {
    // Treat as trial user for AI access control
    console.log(`User ${userId} has ${subscription.status} status - treating as trial user for AI access`)
  }
  
  // Check if subscription is expired
  if (isSubscriptionExpired(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription expired',
      upgradeRequired: 'plus'
    }
  }
  
  // Pro tier has unlimited tokens (but only if active)
  if (subscription.tier === 'pro' && subscription.status === 'active') {
    return { allowed: true }
  }
  
  // Trial users and users with payment issues get trial limits
  if (subscription.tier === 'trial' || subscription.status === 'pending_payment' || subscription.status === 'payment_failed') {
    // Daily limit: 1,500 tokens
    const todayUsage = await getDailyTokenUsage(userId)
    const remainingTokens = 1500 - todayUsage
    
    if (requestedTokens > remainingTokens) {
      return {
        allowed: false,
        reason: 'Daily AI token limit exceeded',
        upgradeRequired: 'pro',
        remainingUsage: remainingTokens
      }
    }
  }
  
  if (subscription.tier === 'plus' && subscription.status === 'active') {
    // Monthly limit: 100,000 tokens (resets 30 days from subscription)
    const monthlyUsage = await getMonthlyTokenUsage(userId, subscription.created_at)
    const remainingTokens = 100000 - monthlyUsage
    
    if (requestedTokens > remainingTokens) {
      return {
        allowed: false,
        reason: 'Monthly AI token limit exceeded',
        upgradeRequired: 'pro',
        remainingUsage: remainingTokens
      }
    }
  }
  
  return { allowed: true }
}

// Check Fan Zone access
export async function checkFanZoneAccess(userId: number, tab: string): Promise<SubscriptionCheck> {
  const subscription = await getSubscription(userId)
  
  if (!subscription) {
    return { allowed: false, reason: 'No subscription found' }
  }
  
  // Check if subscription is expired
  if (isSubscriptionExpired(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription expired',
      upgradeRequired: 'plus'
    }
  }
  
  // Pro and trial users have full access (but not if payment is pending/failed)
  if ((subscription.tier === 'pro' || subscription.tier === 'trial') && subscription.status === 'active') {
    return { allowed: true }
  }
  
  // Plus users can only access dashboard and fans tabs (but only if active)
  if (subscription.tier === 'plus' && subscription.status === 'active') {
    const allowedTabs = ['dashboard', 'fans']
    if (!allowedTabs.includes(tab.toLowerCase())) {
      return {
        allowed: false,
        reason: 'Plus tier can only access Dashboard and Fans tabs',
        upgradeRequired: 'pro'
      }
    }
  }
  
  return { allowed: true }
}

// Check monetization features (Tip Jar, Paid Subscriptions)
export async function checkMonetizationAccess(userId: number, feature: 'tip_jar' | 'paid_subscriptions'): Promise<SubscriptionCheck> {
  const subscription = await getSubscription(userId)
  
  if (!subscription) {
    return { allowed: false, reason: 'No subscription found' }
  }
  
  // Check if subscription is expired
  if (isSubscriptionExpired(subscription)) {
    return {
      allowed: false,
      reason: 'Subscription expired',
      upgradeRequired: 'plus'
    }
  }
  
  // Only Pro and trial users can access monetization features (but not if payment is pending/failed)
  if ((subscription.tier === 'pro' || subscription.tier === 'trial') && subscription.status === 'active') {
    return { allowed: true }
  }
  
  const featureName = feature === 'tip_jar' ? 'Tip Jar' : 'Paid Subscriptions'
  
  return {
    allowed: false,
    reason: `${featureName} is only available in Pro tier`,
    upgradeRequired: 'pro'
  }
}

// Main subscription access checker
export async function checkSubscriptionAccess(
  userId: number,
  feature: FeatureType,
  additionalData?: any
): Promise<SubscriptionCheck> {
  switch (feature) {
    case 'release_creation':
      return checkReleaseLimit(userId)
    
    case 'ai_agent':
      const tokens = additionalData?.tokens || 100 // Default estimate
      return checkAITokens(userId, tokens)
    
    case 'fan_campaigns':
    case 'fan_import':
      const tab = feature === 'fan_campaigns' ? 'campaigns' : 'import'
      return checkFanZoneAccess(userId, tab)
    
    case 'tip_jar':
      return checkMonetizationAccess(userId, 'tip_jar')
    
    case 'paid_subscriptions':
      return checkMonetizationAccess(userId, 'paid_subscriptions')
    
    case 'analytics_advanced':
      // For now, all tiers have access to analytics
      return { allowed: true }
    
    default:
      return { allowed: true }
  }
}

// Estimate token count for text (improved approximation)
export function estimateTokenCount(text: string): number {
  // More accurate estimation based on OpenAI's guidelines:
  // - 1 token ≈ 4 characters for English text
  // - Add overhead for special characters and formatting
  // - Minimum 1 token for any text
  if (!text || text.length === 0) return 0
  
  const baseTokens = Math.ceil(text.length / 4)
  const overhead = Math.ceil(baseTokens * 0.1) // 10% overhead
  
  return Math.max(1, baseTokens + overhead)
}

// Count actual tokens (more accurate - would need tiktoken library for exact count)
export function countTokens(text: string): number {
  // For now, use the improved estimation
  // In production, you'd use tiktoken library for exact OpenAI token counting
  return estimateTokenCount(text)
}

// Create subscription for new user
export async function createSubscription(userId: number): Promise<Subscription | null> {
  try {
    const trialExpiresAt = new Date()
    trialExpiresAt.setMonth(trialExpiresAt.getMonth() + 2)
    
    const result = await query(`
      INSERT INTO subscriptions (user_id, tier, status, trial_expires_at)
      VALUES ($1, 'trial', 'active', $2)
      RETURNING *
    `, [userId, trialExpiresAt])
    
    return result.rows[0]
  } catch (error) {
    console.error('Error creating subscription:', error)
    return null
  }
}

// Update subscription tier
export async function updateSubscriptionTier(
  userId: number, 
  tier: 'plus' | 'pro',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
  subscriptionExpiresAt?: Date
): Promise<boolean> {
  try {
    // Safely convert Date to ISO string for PostgreSQL
    let expiresAtISO: string | null = null
    try {
      if (subscriptionExpiresAt && !isNaN(subscriptionExpiresAt.getTime())) {
        expiresAtISO = subscriptionExpiresAt.toISOString()
      }
    } catch (error) {
      console.warn('Error converting expiration date to ISO string:', error)
    }
    
    await query(`
      UPDATE subscriptions 
      SET tier = $1, 
          status = 'active',
          stripe_customer_id = $2,
          stripe_subscription_id = $3,
          subscription_expires_at = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
    `, [tier, stripeCustomerId, stripeSubscriptionId, expiresAtISO, userId])
    
    return true
  } catch (error) {
    console.error('Error updating subscription tier:', error)
    return false
  }
}
