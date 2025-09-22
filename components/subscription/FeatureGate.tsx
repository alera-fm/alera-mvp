'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useSubscription } from '@/context/SubscriptionContext'
import { Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FeatureGateProps {
  feature: string
  tier?: 'plus' | 'pro'
  children: ReactNode
  fallback?: ReactNode
  data?: any
  showUpgradePrompt?: boolean
}

export function FeatureGate({ 
  feature, 
  tier, 
  children, 
  fallback, 
  data, 
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const { canAccessFeature, showUpgradeDialog, subscription, loading } = useSubscription()
  const [hasAccess, setHasAccess] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (loading || !subscription) {
        setChecking(true)
        return
      }

      try {
        const access = await canAccessFeature(feature, data)
        setHasAccess(access)
      } catch (error) {
        console.error('Error checking feature access:', error)
        setHasAccess(false)
      } finally {
        setChecking(false)
      }
    }

    checkAccess()
  }, [canAccessFeature, feature, data, subscription, loading])

  // Show loading state
  if (loading || checking) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  // If access is granted, render children
  if (hasAccess) {
    return <>{children}</>
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // If no upgrade prompt requested, render nothing
  if (!showUpgradePrompt) {
    return null
  }

  // Default upgrade prompt
  const getFeatureName = (feature: string) => {
    const featureNames: Record<string, string> = {
      release_creation: 'Release Creation',
      ai_agent: 'AI Agent',
      fan_campaigns: 'Email Campaigns',
      fan_import: 'Fan Import',
      tip_jar: 'Tip Jar',
      paid_subscriptions: 'Paid Subscriptions',
      analytics_advanced: 'Advanced Analytics'
    }
    return featureNames[feature] || feature
  }

  const getUpgradeMessage = () => {
    if (subscription?.tier === 'trial') {
      if (feature === 'release_creation') {
        return 'Trial users cannot create releases. Upgrade to Plus or Pro to start distributing your music.'
      }
      if (feature === 'ai_agent') {
        return 'You\'ve reached your daily AI token limit. Upgrade to Pro for unlimited AI assistance.'
      }
    }
    
    if (subscription?.tier === 'plus') {
      if (feature === 'fan_campaigns' || feature === 'fan_import') {
        return 'Email campaigns and fan import are Pro features. Upgrade to access advanced fan management tools.'
      }
      if (feature === 'tip_jar' || feature === 'paid_subscriptions') {
        return 'Direct monetization features are available in Pro tier. Upgrade to start earning directly from fans.'
      }
      if (feature === 'ai_agent') {
        return 'You\'ve reached your monthly AI token limit. Upgrade to Pro for unlimited AI assistance.'
      }
    }

    return `${getFeatureName(feature)} requires ${tier || 'a higher'} tier. Upgrade to unlock this feature.`
  }

  const getRequiredTier = (): 'plus' | 'pro' => {
    if (tier) return tier
    
    // Determine required tier based on feature and current tier
    if (subscription?.tier === 'trial') {
      return 'plus' // Trial users can upgrade to Plus for most features
    }
    
    return 'pro' // Plus users need Pro for restricted features
  }

  const handleUpgradeClick = () => {
    const requiredTier = getRequiredTier()
    const message = getUpgradeMessage()
    showUpgradeDialog(message, requiredTier)
  }

  return (
    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
          <Lock className="h-6 w-6 text-gray-400" />
        </div>
        
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
          {getFeatureName(feature)} Locked
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
          {getUpgradeMessage()}
        </p>
        
        <Button 
          onClick={handleUpgradeClick}
          className="bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white"
        >
          <Zap className="h-4 w-4 mr-2" />
          Upgrade to {getRequiredTier().charAt(0).toUpperCase() + getRequiredTier().slice(1)}
        </Button>
      </CardContent>
    </Card>
  )
}

// Specialized component for tab triggers that should be disabled
export function FeatureGateTab({ 
  feature, 
  tier, 
  children, 
  className = '' 
}: { 
  feature: string
  tier?: 'plus' | 'pro'
  children: ReactNode
  className?: string
}) {
  const { canAccessFeature, showUpgradeDialog, subscription, loading } = useSubscription()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (loading || !subscription) return

      try {
        const access = await canAccessFeature(feature)
        setHasAccess(access)
      } catch (error) {
        console.error('Error checking tab access:', error)
        setHasAccess(false)
      }
    }

    checkAccess()
  }, [canAccessFeature, feature, subscription, loading])

  const handleClick = (e: React.MouseEvent) => {
    if (!hasAccess) {
      e.preventDefault()
      e.stopPropagation()
      
      const featureName = feature === 'fan_campaigns' ? 'Email Campaigns' : 'Fan Import'
      const message = `${featureName} is a Pro feature. Upgrade to access advanced fan management tools.`
      showUpgradeDialog(message, 'pro')
    }
  }

  return (
    <div 
      className={` !w-full inline-flex items-center justify-center ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
    >
      {children}
      {!hasAccess && (
        <Lock className="h-3 w-3  inline-block text-gray-400 -ml-6" />
      )}
    </div>
  )
}
