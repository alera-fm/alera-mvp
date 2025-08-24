
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Check if user is admin
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [decoded.userId])
    if (!userResult.rows[0]?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const artistId = searchParams.get('artist_id')
    const offset = (page - 1) * limit

    let whereClause = ''
    let queryParams: any[] = []
    let paramCount = 0

    if (artistId && artistId !== 'all') {
      paramCount++
      whereClause = 'WHERE f.artist_id = $' + paramCount
      queryParams.push(artistId)
    }

    // Get fans with artist info
    const fansResult = await pool.query(`
      SELECT 
        f.*,
        u.artist_name,
        u.email as artist_email
      FROM fans f
      JOIN users u ON f.artist_id = u.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...queryParams, limit, offset])

    // Get total count
    const countResult = await pool.query(`
      SELECT COUNT(*) 
      FROM fans f
      JOIN users u ON f.artist_id = u.id
      ${whereClause}
    `, queryParams)
    const totalCount = parseInt(countResult.rows[0].count)

    // Get overall stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_fans,
        COUNT(DISTINCT f.artist_id) as total_artists,
        COUNT(CASE WHEN f.subscribed_status = 'paid' THEN 1 END) as paid_fans,
        COUNT(CASE WHEN f.subscribed_status = 'free' THEN 1 END) as free_fans
      FROM fans f
      ${whereClause}
    `, queryParams)

    return NextResponse.json({
      fans: fansResult.rows,
      stats: statsResult.rows[0],
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Admin get fans error:', error)
    return NextResponse.json({ error: 'Failed to fetch fan data' }, { status: 500 })
  }
}
