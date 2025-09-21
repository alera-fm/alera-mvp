'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Subscription {
  id: number
  tier: 'trial' | 'plus' | 'pro'
  status: 'active' | 'expired' | 'cancelled' | 'pending_payment' | 'payment_failed'
  isExpired: boolean
  daysRemaining: number
  trialExpiresAt?: string
  subscriptionExpiresAt?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface Usage {
  aiTokens: {
    used: number
    limit: number
    resetDate: Date
    resetType: 'daily' | 'monthly' | 'unlimited'
  }
  releases: {
    pending: number
    limit: number
  }
}

export interface FeatureAccess {
  release_creation: boolean
  ai_agent: boolean
  fan_campaigns: boolean
  fan_import: boolean
  tip_jar: boolean
  paid_subscriptions: boolean
  analytics_advanced: boolean
}

interface SubscriptionContextType {
  subscription: Subscription | null
  usage: Usage | null
  featureAccess: FeatureAccess | null
  loading: boolean
  isTrialExpired: boolean
  daysRemaining: number
  canAccessFeature: (feature: string, data?: any) => Promise<boolean>
  showUpgradeDialog: (reason: string, requiredTier: 'plus' | 'pro') => void
  refreshSubscription: () => Promise<void>
  upgradeToTier: (tier: 'plus' | 'pro') => Promise<string | null>
  // Upgrade dialog state
  upgradeDialogOpen: boolean
  upgradeDialogReason: string
  upgradeDialogTier: 'plus' | 'pro'
  closeUpgradeDialog: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Upgrade dialog state
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [upgradeDialogReason, setUpgradeDialogReason] = useState('')
  const [upgradeDialogTier, setUpgradeDialogTier] = useState<'plus' | 'pro'>('plus')

  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('/api/subscription/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      
      if (response.ok) {
        setSubscription(data.subscription)
        setUsage(data.usage)
        setFeatureAccess(data.featureAccess)
      } else {
        // Log the error but don't show it to the user
        console.error('Failed to fetch subscription data:', data.error)
        
        // Reset subscription state
        setSubscription(null)
        setUsage(null)
        setFeatureAccess(null)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, isAuthenticated])

  useEffect(() => {
    fetchSubscriptionData()
  }, [fetchSubscriptionData])

  const canAccessFeature = useCallback(async (feature: string, data?: any): Promise<boolean> => {
    if (!featureAccess) return false
    
    // Check client-side feature access first
    const hasAccess = featureAccess[feature as keyof FeatureAccess]
    if (!hasAccess) return false

    // For AI agent, check real-time token limits
    if (feature === 'ai_agent' && data?.estimatedTokens) {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) return false

        const response = await fetch('/api/subscription/usage', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const usageData = await response.json()
          const aiTokens = usageData.current.aiTokens
          const limits = usageData.limits.aiTokens
          
          if (subscription?.tier === 'trial') {
            return (aiTokens.daily + data.estimatedTokens) <= limits.daily
          } else if (subscription?.tier === 'plus') {
            return (aiTokens.monthly + data.estimatedTokens) <= limits.monthly
          }
        }
      } catch (error) {
        console.error('Error checking AI token limits:', error)
        return false
      }
    }

    return true
  }, [featureAccess, subscription])

  const showUpgradeDialog = useCallback((reason: string, requiredTier: 'plus' | 'pro') => {
    setUpgradeDialogReason(reason)
    setUpgradeDialogTier(requiredTier)
    setUpgradeDialogOpen(true)
  }, [])

  const closeUpgradeDialog = useCallback(() => {
    setUpgradeDialogOpen(false)
    setUpgradeDialogReason('')
    setUpgradeDialogTier('plus')
  }, [])

  const upgradeToTier = useCallback(async (tier: 'plus' | 'pro'): Promise<string | null> => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return null

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier })
      })

      const data = await response.json()

      if (response.ok) {
        return data.checkoutUrl
      } else {
        // Handle specific error cases
        if (data.error === 'User already has an active subscription') {
          toast({
            title: "Subscription Active",
            description: "Please use the billing portal to manage your existing subscription.",
            variant: "default",
          })
          return null
        }

        // Handle other errors
        toast({
          title: "Error",
          description: data.error || "Failed to create subscription",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast({
        title: "Error",
        description: "Failed to process upgrade request. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }, [toast])

  const refreshSubscription = useCallback(async () => {
    await fetchSubscriptionData()
  }, [fetchSubscriptionData])

  const isTrialExpired = subscription?.isExpired || false
  const daysRemaining = subscription?.daysRemaining || 0

  const value = {
    subscription,
    usage,
    featureAccess,
    loading,
    isTrialExpired,
    daysRemaining,
    canAccessFeature,
    showUpgradeDialog,
    refreshSubscription,
    upgradeToTier,
    upgradeDialogOpen,
    upgradeDialogReason,
    upgradeDialogTier,
    closeUpgradeDialog
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
