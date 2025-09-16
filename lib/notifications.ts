/**
 * Notification utilities for external services
 */

interface SlackMessage {
  text: string
  username?: string
  icon_emoji?: string
}

/**
 * Send a notification to Slack via webhook
 */
export async function sendSlackNotification(message: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notification')
    return false
  }

  try {
    const payload: SlackMessage = {
      text: message,
      username: 'ALERA Bot',
      icon_emoji: ':musical_note:'
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      console.log('Slack notification sent successfully')
      return true
    } else {
      console.error('Failed to send Slack notification:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error)
    return false
  }
}

/**
 * Send notification for new artist sign-up
 */
export async function notifyNewArtistSignUp(artistName: string, email: string): Promise<void> {
  const message = `🎉 New ALERA Sign Up: ${artistName || 'Unknown Artist'} (${email})`
  
  // Send to Slack (non-blocking)
  sendSlackNotification(message).catch(error => {
    console.error('Failed to send new artist notification:', error)
  })
}

/**
 * Send notification for important events
 */
export async function notifyImportantEvent(event: string, details: string): Promise<void> {
  const message = `⚡ ALERA Event: ${event}\n${details}`
  
  // Send to Slack (non-blocking)
  sendSlackNotification(message).catch(error => {
    console.error('Failed to send event notification:', error)
  })
}
