import type { NextRequest } from "next/server"
import { verifyToken } from "./auth"
import { checkSubscriptionAccess, type FeatureType, type SubscriptionCheck } from "./subscription-utils"

export interface AuthenticatedRequest extends NextRequest {
  userId: number
}

// Middleware to verify authentication and check subscription access
export async function requireSubscriptionAccess(
  request: NextRequest,
  feature: FeatureType,
  additionalData?: any
): Promise<{ userId: number; subscriptionCheck: SubscriptionCheck }> {
  // First, verify authentication
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization token provided")
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    throw new Error("Invalid token")
  }

  // Check subscription access for the feature
  const subscriptionCheck = await checkSubscriptionAccess(decoded.userId, feature, additionalData)

  return {
    userId: decoded.userId,
    subscriptionCheck
  }
}

// Middleware specifically for API routes that need subscription checking
export async function withSubscriptionCheck(
  request: NextRequest,
  feature: FeatureType,
  additionalData?: any
) {
  try {
    const { userId, subscriptionCheck } = await requireSubscriptionAccess(request, feature, additionalData)
    
    return {
      success: true,
      userId,
      subscriptionCheck
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }
  }
}

// Helper to create subscription error responses
export function createSubscriptionErrorResponse(subscriptionCheck: SubscriptionCheck) {
  return {
    error: subscriptionCheck.reason || 'Access denied',
    upgradeRequired: subscriptionCheck.upgradeRequired,
    remainingUsage: subscriptionCheck.remainingUsage
  }
}

// Middleware for release creation endpoints
export async function requireReleaseAccess(request: NextRequest) {
  const result = await withSubscriptionCheck(request, 'release_creation')
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  if (!result.subscriptionCheck.allowed) {
    throw new Error(result.subscriptionCheck.reason || 'Release creation not allowed')
  }
  
  return result.userId
}

// Middleware for AI agent endpoints
export async function requireAIAccess(request: NextRequest, estimatedTokens: number = 100) {
  const result = await withSubscriptionCheck(request, 'ai_agent', { tokens: estimatedTokens })
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  return {
    userId: result.userId,
    subscriptionCheck: result.subscriptionCheck
  }
}

// Middleware for Fan Zone features
export async function requireFanZoneAccess(request: NextRequest, tab: string) {
  const feature: FeatureType = tab === 'campaigns' ? 'fan_campaigns' : 'fan_import'
  const result = await withSubscriptionCheck(request, feature)
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  if (!result.subscriptionCheck.allowed) {
    throw new Error(result.subscriptionCheck.reason || 'Fan Zone access denied')
  }
  
  return result.userId
}

// Middleware for monetization features
export async function requireMonetizationAccess(request: NextRequest, feature: 'tip_jar' | 'paid_subscriptions') {
  const result = await withSubscriptionCheck(request, feature)
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  if (!result.subscriptionCheck.allowed) {
    throw new Error(result.subscriptionCheck.reason || 'Monetization access denied')
  }
  
  return result.userId
}

// Generic authentication middleware (without subscription checks)
export async function requireAuth(request: NextRequest): Promise<number> {
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization token provided")
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)

  if (!decoded) {
    throw new Error("Invalid token")
  }

  return decoded.userId
}
