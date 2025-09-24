import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const tokenData = await verifyToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Fetch user data from database
    const userResult = await pool.query(
      'SELECT id, email, is_admin FROM users WHERE id = $1',
      [tokenData.userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]
    
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin,
      message: user.is_admin ? "Admin access granted" : "Regular user - no admin access"
    })
  } catch (error) {
    console.error('Error in test auth:', error)
    return NextResponse.json(
      { error: "Failed to check auth" },
      { status: 500 }
    )
  }
}
