
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const loginQuery = `
      SELECT 
        id,
        login_time,
        ip_address,
        device_type,
        browser,
        location,
        status
      FROM login_history 
      WHERE user_id = $1 
      ORDER BY login_time DESC
      LIMIT 20
    `
    
    const result = await query(loginQuery, [decoded.userId])

    return NextResponse.json({ 
      login_history: result.rows 
    })
  } catch (error) {
    console.error("Login history fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch login history" },
      { status: 500 }
    )
  }
}
