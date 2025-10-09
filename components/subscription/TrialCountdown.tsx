'use client'

import { useSubscription } from '@/context/SubscriptionContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Zap, ArrowRight, Timer } from 'lucide-react'

export function TrialCountdown() {
  const { subscription, daysRemaining, showUpgradeDialog } = useSubscription()

  // Only show for trial users
  if (subscription?.tier !== 'trial') return null

  // Always show for trial users, even if trial is expired
  // Don't remove banner after trial expires or after submitting release

  // Use consistent styling (not time-based)
  const styles = {
    container: 'bg-gradient-to-r from-purple-50 to-yellow-50 dark:from-purple-900/30 dark:to-yellow-800/20 border-2 border-purple-300 dark:border-purple-700 shadow-lg',
    text: 'text-purple-900 dark:text-purple-100 font-bold',
    subtext: 'text-purple-800 dark:text-purple-200',
    button: 'bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
  }

  const getMessage = () => {
    return "You're currently on a free trial"
  }

  const getSubMessage = () => {
    return 'Upgrade to Pro to unlock unlimited releases, advanced features, and keep your music live forever.'
  }

  const handleUpgradeClick = () => {
    showUpgradeDialog('Continue your music journey with unlimited access to all ALERA features.', 'plus')
  }

  return (
    <Card className={`${styles.container} border`}>
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="rounded-full p-2 flex-shrink-0 bg-purple-100 dark:bg-purple-900">
              <Timer className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-sm md:text-base font-semibold leading-tight ${styles.text}`}>
                {getMessage()}
              </h3>
              <p className={`text-xs md:text-sm mt-1 leading-tight ${styles.subtext} hidden sm:block`}>
                {getSubMessage()}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleUpgradeClick}
            className={`${styles.button} flex-shrink-0 w-full sm:w-auto`}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Upgrade Now</span>
            <span className="xs:hidden">Upgrade</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        {/* Mobile-only subtitle */}
        <p className={`text-xs mt-2 leading-tight ${styles.subtext} sm:hidden`}>
          {getSubMessage()}
        </p>
      </CardContent>
    </Card>
  )
}

// Compact version for sidebar or header
export function TrialCountdownCompact() {
  const { subscription, daysRemaining, showUpgradeDialog } = useSubscription()

  if (subscription?.tier !== 'trial' || subscription?.isExpired) return null

  const handleClick = () => {
    showUpgradeDialog('Your trial is expiring soon. Upgrade to continue using all features.', 'plus')
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-yellow-800 dark:text-yellow-200 font-medium">
          Trial: {daysRemaining} days left
        </span>
        <Button 
          onClick={handleClick}
          size="sm" 
          variant="ghost"
          className="h-6 px-2 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900"
        >
          Upgrade
        </Button>
      </div>
    </div>
  )
}
