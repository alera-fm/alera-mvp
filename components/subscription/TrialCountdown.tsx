'use client'

import { useSubscription } from '@/context/SubscriptionContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Zap, ArrowRight, Timer } from 'lucide-react'

export function TrialCountdown() {
  const { subscription, daysRemaining, showUpgradeDialog } = useSubscription()

  // Only show for trial users
  if (subscription?.tier !== 'trial') return null

  // Don't show if trial is expired (user should see upgrade prompt elsewhere)
  if (subscription?.isExpired) return null

  const getUrgencyLevel = () => {
    if (daysRemaining <= 3) return 'critical'
    if (daysRemaining <= 7) return 'warning'
    return 'normal'
  }

  const urgencyLevel = getUrgencyLevel()

  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          container: 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700 shadow-lg',
          text: 'text-red-900 dark:text-red-100 font-bold',
          subtext: 'text-red-800 dark:text-red-200',
          button: 'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
        }
      case 'warning':
        return {
          container: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-800/20 border-2 border-orange-300 dark:border-orange-700 shadow-lg',
          text: 'text-orange-900 dark:text-orange-100 font-bold',
          subtext: 'text-orange-800 dark:text-orange-200',
          button: 'bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
        }
      default:
        return {
          container: 'bg-gradient-to-r from-purple-50 to-yellow-50 dark:from-purple-900/30 dark:to-yellow-800/20 border-2 border-purple-300 dark:border-purple-700 shadow-lg',
          text: 'text-purple-900 dark:text-purple-100 font-bold',
          subtext: 'text-purple-800 dark:text-purple-200',
          button: 'bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
        }
    }
  }

  const styles = getUrgencyStyles()

  const getMessage = () => {
    if (daysRemaining === 0) {
      return 'Keep your momentum going. Your trial expires today!'
    }
    if (daysRemaining === 1) {
      return 'Keep your momentum going. Your trial ends tomorrow!'
    }
    if (daysRemaining <= 3) {
      return `Keep your momentum going. Your trial ends in ${daysRemaining} days.`
    }
    if (daysRemaining <= 7) {
      return `Keep your momentum going. Your trial ends in ${daysRemaining} days.`
    }
    return `Keep your momentum going. Your trial ends in ${daysRemaining} days.`
  }

  const getSubMessage = () => {
    if (daysRemaining <= 3) {
      return 'Upgrade to Pro to ensure your music stays live and your career tools remain uninterrupted.'
    }
    if (daysRemaining <= 7) {
      return 'Upgrade to Pro to ensure your music stays live and your career tools remain uninterrupted.'
    }
    return 'Upgrade to Pro to ensure your music stays live and your career tools remain uninterrupted.'
  }

  const handleUpgradeClick = () => {
    const reason = urgencyLevel === 'critical' 
      ? 'Your trial is expiring soon. Upgrade now to maintain access to all features.'
      : 'Continue your music journey with unlimited access to all ALERA features.'
    
    showUpgradeDialog(reason, 'plus')
  }

  return (
    <Card className={`${styles.container} border`}>
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`rounded-full p-2 flex-shrink-0 ${urgencyLevel === 'critical' ? 'bg-red-100 dark:bg-red-900' : urgencyLevel === 'warning' ? 'bg-orange-100 dark:bg-orange-900' : 'bg-purple-100 dark:bg-purple-900'}`}>
              <Timer className={`h-4 w-4 md:h-5 md:w-5 ${urgencyLevel === 'critical' ? 'text-red-600' : urgencyLevel === 'warning' ? 'text-orange-600' : 'text-purple-600'} ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}`} />
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
