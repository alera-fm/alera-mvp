import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    const userId = decoded.userId
    const res = await query('SELECT COUNT(*)::int AS c FROM ai_chat_messages WHERE user_id = $1 AND is_user_message = false AND is_unread = true', [userId])
    return NextResponse.json({ unread: res.rows[0]?.c || 0 })
  } catch (e) {
    console.error('Unread count error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


