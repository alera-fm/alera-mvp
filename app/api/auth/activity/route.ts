import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const tokenData = await verifyToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log('Updating activity for user ID:', tokenData.userId)

    // Update the user's last_active_at timestamp
    const result = await pool.query(
      'UPDATE users SET last_active_at = NOW() WHERE id = $1',
      [tokenData.userId]
    )

    console.log('Activity update result:', result.rowCount, 'rows affected')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user activity:', error)
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    )
  }
}
