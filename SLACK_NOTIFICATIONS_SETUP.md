# Slack Notifications Setup

## Overview
ALERA now sends real-time notifications to Slack when new artists sign up. This helps you stay informed about platform growth and user engagement.

## Setup Instructions

### 1. Environment Variable Configuration

Add the following environment variable to your `.env.local` file:

```bash
# Slack Notifications
SLACK_WEBHOOK_URL=your-slack-webhook-url-here
```

### 2. Notification Features

#### New Artist Sign-Up Notifications
- **Trigger**: When a new user successfully registers
- **Message Format**: `🎉 New ALERA Sign Up: [Artist Name] ([Artist Email])`
- **Timing**: Sent immediately after user creation in database
- **Non-blocking**: Registration will succeed even if Slack notification fails

#### Example Messages
```
🎉 New ALERA Sign Up: John Doe (john@example.com)
🎉 New ALERA Sign Up: jane@example.com (jane@example.com)
```

### 3. Implementation Details

#### Files Modified
- `lib/notifications.ts` - New notification utility functions
- `app/api/auth/register/route.ts` - Updated to send notifications

#### Key Features
- **Error Handling**: Notifications are non-blocking and won't affect user registration
- **Fallback Logic**: If artist name is not provided, uses email prefix
- **Logging**: All notification attempts are logged for debugging
- **Configurable**: Easy to disable by removing environment variable

### 4. Testing

To test the notification system:

1. Ensure `SLACK_WEBHOOK_URL` is set in your environment
2. Register a new user through the registration form
3. Check your Slack channel for the notification message
4. Check server logs to verify notification was sent

### 5. Extensibility

The notification system is designed to be extensible. You can easily add:

- New notification types (subscription upgrades, new releases, etc.)
- Additional notification channels (Discord, email alerts, etc.)
- Custom message formatting
- Notification preferences/filters

#### Adding New Notifications

```typescript
import { notifyImportantEvent } from '@/lib/notifications'

// Example: Notify when user upgrades subscription
await notifyImportantEvent('Subscription Upgrade', `${artistName} upgraded to ${tier}`)
```

## Security Notes

- The webhook URL contains sensitive tokens - keep it secure
- Only store webhook URLs in environment variables, never in code
- Consider using different webhook URLs for different environments (dev/staging/prod)

## Troubleshooting

### Common Issues

1. **Notifications not appearing in Slack**
   - Verify `SLACK_WEBHOOK_URL` is correctly set
   - Check server logs for error messages
   - Ensure webhook URL is still valid in Slack

2. **Registration failing**
   - Notifications are non-blocking, so this shouldn't happen
   - Check server logs for specific error messages

3. **Missing artist names**
   - If artist name is not provided during registration, email prefix is used
   - This is expected behavior and not an error

### Log Messages

Successful notification:
```
Slack notification sent successfully
```

Configuration issue:
```
SLACK_WEBHOOK_URL not configured, skipping Slack notification
```

Network/API error:
```
Failed to send Slack notification: [error details]
```
