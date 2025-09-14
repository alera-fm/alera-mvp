'use client'

import { useState } from 'react'
import { useSubscription } from '@/context/SubscriptionContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Loader2 } from 'lucide-react'

export function UpgradeDialog() {
  const { 
    upgradeDialogOpen, 
    closeUpgradeDialog, 
    upgradeDialogReason, 
    upgradeDialogTier, 
    subscription,
    upgradeToTier
  } = useSubscription()
  
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'plus' | 'pro'>(upgradeDialogTier)

  const handleUpgrade = async (tier: 'plus' | 'pro') => {
    setLoading(true)
    try {
      const checkoutUrl = await upgradeToTier(tier)
      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl
      } else {
        console.error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error during upgrade:', error)
    } finally {
      setLoading(false)
    }
  }

  const tierFeatures = {
    plus: [
      'Unlimited Single releases',
      'Unlimited EP releases', 
      'Unlimited Album releases',
      '100,000 AI tokens per month',
      'Basic fan management',
      'Basic analytics'
    ],
    pro: [
      'Everything in Plus',
      'Unlimited AI assistance',
      'Advanced email campaigns',
      'Fan import tools',
      'Tip Jar monetization',
      'Paid fan subscriptions',
      'Advanced analytics',
      'Priority support'
    ]
  }

  const getCurrentTierName = () => {
    if (subscription?.tier === 'trial') return 'Trial'
    if (subscription?.tier === 'plus') return 'Plus'
    if (subscription?.tier === 'pro') return 'Pro'
    return 'Unknown'
  }

  return (
    <Dialog open={upgradeDialogOpen} onOpenChange={closeUpgradeDialog}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-lg">
            {upgradeDialogReason}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current tier info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Current Plan: {getCurrentTierName()}</h3>
                {subscription?.tier === 'trial' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subscription.daysRemaining} days remaining in trial
                  </p>
                )}
              </div>
              <Badge variant="outline">
                {subscription?.tier === 'trial' ? 'Free Trial' : 
                 subscription?.tier === 'plus' ? '$4.99/month' : '$14.99/month'}
              </Badge>
            </div>
          </div>

          {/* Tier comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plus Tier */}
            <Card className={`relative ${selectedTier === 'plus' ? 'ring-2 ring-purple-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Plus
                  </CardTitle>
                  <Badge className="bg-purple-500 text-white">$4.99/month</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Perfect for growing artists
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tierFeatures.plus.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleUpgrade('plus')}
                  disabled={loading || subscription?.tier === 'plus'}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {subscription?.tier === 'plus' ? 'Current Plan' : 'Upgrade to Plus'}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className={`relative ${selectedTier === 'pro' ? 'ring-2 ring-yellow-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Pro
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white">
                    $14.99/month
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For serious artists and labels
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tierFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleUpgrade('pro')}
                  disabled={loading || subscription?.tier === 'pro'}
                  className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Crown className="h-4 w-4 mr-2" />
                  )}
                  {subscription?.tier === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional info */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>All plans include secure payment processing and can be cancelled anytime.</p>
            <p className="mt-1">Billing is monthly and you can upgrade or downgrade at any time.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
