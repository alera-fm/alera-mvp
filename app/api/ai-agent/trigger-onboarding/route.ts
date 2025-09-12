import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('[Trigger Onboarding] Starting trigger for request')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[Trigger Onboarding] No valid authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('[Trigger Onboarding] Token found, verifying...')
    
    const decoded = verifyToken(token)
    if (!decoded) {
      console.log('[Trigger Onboarding] Token verification failed')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('[Trigger Onboarding] Token verified for user:', decoded.userId)

    // Check if onboarding already exists or is completed
    const onboardingCheck = await query(
      'SELECT is_completed FROM ai_onboarding_status WHERE user_id = $1',
      [decoded.userId]
    )

    console.log('[Trigger Onboarding] Onboarding check result:', onboardingCheck.rows)

    // Check if there are any existing chat messages for this user
    const existingMessages = await query(
      'SELECT COUNT(*) as message_count FROM ai_chat_messages WHERE user_id = $1',
      [decoded.userId]
    )
    
    const messageCount = parseInt(existingMessages.rows[0].message_count)
    console.log('[Trigger Onboarding] Existing message count:', messageCount)

    // Also check specifically for onboarding messages to prevent duplicates
    const existingOnboardingMessages = await query(
      'SELECT COUNT(*) as onboarding_count FROM ai_chat_messages WHERE user_id = $1 AND intent_classified = $2',
      [decoded.userId, 'onboarding']
    )
    
    const onboardingCount = parseInt(existingOnboardingMessages.rows[0].onboarding_count)
    console.log('[Trigger Onboarding] Existing onboarding message count:', onboardingCount)

    // Only trigger for users with no chat history AND no existing onboarding messages
    if (messageCount === 0 && onboardingCount === 0) {
      console.log('[Trigger Onboarding] No messages found, setting up onboarding for user:', decoded.userId)
      console.log('[Trigger Onboarding] Timestamp:', new Date().toISOString())
      
      // Create or ensure onboarding status exists
      await query(
        `INSERT INTO ai_onboarding_status (user_id, is_completed, completed_questions)
         VALUES ($1, false, ARRAY[]::text[])
         ON CONFLICT (user_id) DO UPDATE SET
           is_completed = false,
           completed_questions = ARRAY[]::text[],
           updated_at = CURRENT_TIMESTAMP`,
        [decoded.userId]
      )

      console.log('[Trigger Onboarding] Onboarding status ensured, inserting welcome and onboarding messages')

      // Insert welcome notification message
      const welcomeMessage = `Welcome to ALERA! To get started, I'd love to understand a bit about you so I can give you the best advice.`

      const welcomeResult = await query(
        `INSERT INTO ai_chat_messages (user_id, message_text, is_user_message, intent_classified, is_unread, message_kind)
         VALUES ($1, $2, false, $3, true, 'notification')
         RETURNING id`,
        [decoded.userId, welcomeMessage, 'notification']
      )

      console.log('[Trigger Onboarding] Welcome notification inserted with ID:', welcomeResult.rows[0]?.id)

      // Insert first onboarding question
      const firstQuestion = `First, what are your main goals right now? (For example: growing your audience, earning more, or getting on playlists?)`

      const questionResult = await query(
        `INSERT INTO ai_chat_messages (user_id, message_text, is_user_message, intent_classified, is_unread, message_kind)
         VALUES ($1, $2, false, $3, true, 'chat')
         RETURNING id`,
        [decoded.userId, firstQuestion, 'onboarding']
      )

      console.log('[Trigger Onboarding] First onboarding question inserted with ID:', questionResult.rows[0]?.id)

      return NextResponse.json({ 
        message: 'Onboarding triggered successfully',
        triggered: true,
        welcomeMessageId: welcomeResult.rows[0]?.id,
        questionMessageId: questionResult.rows[0]?.id
      })
    }

    console.log('[Trigger Onboarding] User already has chat messages, no trigger needed for user:', decoded.userId)
    
    return NextResponse.json({ 
      message: 'User already has chat history',
      triggered: false 
    })

  } catch (error) {
    console.error('[Trigger Onboarding] Error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger onboarding' },
      { status: 500 }
    )
  }
}
