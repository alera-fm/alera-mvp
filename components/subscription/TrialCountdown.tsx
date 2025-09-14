'use client'

import { useSubscription } from '@/context/SubscriptionContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Zap } from 'lucide-react'

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
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          subtext: 'text-red-700 dark:text-red-300',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'warning':
        return {
          container: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-200',
          subtext: 'text-orange-700 dark:text-orange-300',
          button: 'bg-orange-600 hover:bg-orange-700 text-white'
        }
      default:
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          subtext: 'text-yellow-700 dark:text-yellow-300',
          button: 'bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white'
        }
    }
  }

  const styles = getUrgencyStyles()

  const getMessage = () => {
    if (daysRemaining === 0) {
      return 'Your trial expires today!'
    }
    if (daysRemaining === 1) {
      return '1 day remaining in your free trial'
    }
    if (daysRemaining <= 3) {
      return `Only ${daysRemaining} days left in your trial`
    }
    if (daysRemaining <= 7) {
      return `${daysRemaining} days remaining in your trial`
    }
    return `${daysRemaining} days remaining in your free trial`
  }

  const getSubMessage = () => {
    if (daysRemaining <= 3) {
      return 'Upgrade now to continue accessing all features without interruption.'
    }
    if (daysRemaining <= 7) {
      return 'Consider upgrading to ensure uninterrupted access to your music career tools.'
    }
    return 'Upgrade anytime to unlock unlimited access and support your music career.'
  }

  const handleUpgradeClick = () => {
    const reason = urgencyLevel === 'critical' 
      ? 'Your trial is expiring soon. Upgrade now to maintain access to all features.'
      : 'Continue your music journey with unlimited access to all ALERA features.'
    
    showUpgradeDialog(reason, 'plus')
  }

  return (
    <Card className={`${styles.container} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${urgencyLevel === 'critical' ? 'bg-red-100 dark:bg-red-900' : urgencyLevel === 'warning' ? 'bg-orange-100 dark:bg-orange-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
              <Clock className={`h-5 w-5 ${urgencyLevel === 'critical' ? 'text-red-600' : urgencyLevel === 'warning' ? 'text-orange-600' : 'text-yellow-600'}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${styles.text}`}>
                {getMessage()}
              </h3>
              <p className={`text-sm ${styles.subtext}`}>
                {getSubMessage()}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleUpgradeClick}
            className={styles.button}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
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
