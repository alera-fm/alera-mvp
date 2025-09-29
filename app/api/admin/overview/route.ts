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

    // Fetch user data from database to check admin status
    const userResult = await pool.query(
      'SELECT id, is_admin FROM users WHERE id = $1',
      [tokenData.userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]
    if (!user.is_admin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Query for online users (users who have been active in the last 2 minutes)
    const onlineUsersQuery = `
      SELECT COUNT(*) as count 
      FROM users 
      WHERE last_active_at > NOW() - INTERVAL '2 minutes'
    `

    // Query for new users today
    const newUsersQuery = `
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= $1 AND created_at < $2
    `

    // Query for new subscriptions today
    const newSubscriptionsQuery = `
      SELECT COUNT(*) as count 
      FROM subscriptions 
      WHERE created_at >= $1 AND created_at < $2 
      AND tier IN ('plus', 'pro')
    `

    // Query for new releases submitted today (not just created)
    const newReleasesQuery = `
      SELECT COUNT(*) as count 
      FROM releases 
      WHERE submitted_at >= $1 AND submitted_at < $2
    `

    // Execute all queries in parallel
    const [
      onlineUsersResult,
      newUsersResult,
      newSubscriptionsResult,
      newReleasesResult
    ] = await Promise.all([
      pool.query(onlineUsersQuery),
      pool.query(newUsersQuery, [startOfDay, endOfDay]),
      pool.query(newSubscriptionsQuery, [startOfDay, endOfDay]),
      pool.query(newReleasesQuery, [startOfDay, endOfDay])
    ])

    const overviewData = {
      onlineUsers: parseInt(onlineUsersResult.rows[0].count),
      newUsersToday: parseInt(newUsersResult.rows[0].count),
      newSubscriptionsToday: parseInt(newSubscriptionsResult.rows[0].count),
      newReleasesToday: parseInt(newReleasesResult.rows[0].count)
    }

    return NextResponse.json(overviewData)
  } catch (error) {
    console.error('Error fetching admin overview data:', error)
    return NextResponse.json(
      { error: "Failed to fetch overview data" },
      { status: 500 }
    )
  }
}
