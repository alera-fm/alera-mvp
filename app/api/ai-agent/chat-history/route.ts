import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

// GET: Retrieve chat history for a user
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    // Get chat messages for the user (last 50 messages)
    const chatQuery = `
      SELECT id, message_text, is_user_message, intent_classified, data_context, created_at, is_unread, message_kind
      FROM ai_chat_messages 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `
    const chatResult = await query(chatQuery, [userId])
    const messages = chatResult.rows.reverse() // Reverse to get chronological order

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 })
  }
}

// POST: Save a new chat message
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const { messageText, isUserMessage, intentClassified, dataContext } = await request.json()

    if (!messageText) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
    }

    // Insert the message
    const insertQuery = `
      INSERT INTO ai_chat_messages (user_id, message_text, is_user_message, intent_classified, data_context)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `
    const result = await query(insertQuery, [
      userId, 
      messageText, 
      isUserMessage, 
      intentClassified || null, 
      dataContext ? JSON.stringify(dataContext) : null
    ])

    return NextResponse.json({ 
      success: true, 
      messageId: result.rows[0].id,
      createdAt: result.rows[0].created_at
    })
  } catch (error) {
    console.error('Error saving chat message:', error)
    return NextResponse.json({ error: 'Failed to save chat message' }, { status: 500 })
  }
}

// DELETE: Clear chat history for a user
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    // Delete all chat messages for the user
    const deleteQuery = 'DELETE FROM ai_chat_messages WHERE user_id = $1'
    await query(deleteQuery, [userId])

    return NextResponse.json({ success: true, message: 'Chat history cleared' })
  } catch (error) {
    console.error('Error clearing chat history:', error)
    return NextResponse.json({ error: 'Failed to clear chat history' }, { status: 500 })
  }
} 