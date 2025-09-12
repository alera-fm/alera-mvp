
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
    const artistId = decoded.userId

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all' // all, free, paid

    const offset = (page - 1) * limit

    let whereClause = 'WHERE artist_id = $1'
    let queryParams: any[] = [artistId]
    let paramCount = 1

    if (search) {
      paramCount++
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`
      queryParams.push(`%${search}%`)
    }

    if (filter !== 'all') {
      paramCount++
      whereClause += ` AND subscribed_status = $${paramCount}`
      queryParams.push(filter)
    }

    // Get fans with pagination
    const fansQuery = `
      SELECT id, name, email, phone_number, country, gender, age, birth_year, 
             subscribed_status, source, created_at
      FROM fans 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `
    queryParams.push(limit, offset)

    const fansResult = await pool.query(fansQuery, queryParams)

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM fans ${whereClause}`
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2))
    const totalCount = parseInt(countResult.rows[0].count)

    return NextResponse.json({
      fans: fansResult.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Get fans error:', error)
    return NextResponse.json({ error: 'Failed to fetch fans' }, { status: 500 })
  }
}

export async function POST_checkPaid(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const artistId = decoded.userId

    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const row = await pool.query('SELECT subscribed_status FROM fans WHERE artist_id=$1 AND email=$2 LIMIT 1', [artistId, email])
    const status = row.rows[0]?.subscribed_status || null
    return NextResponse.json({ exists: !!status, status })
  } catch (e) {
    console.error('Check paid error:', e)
    return NextResponse.json({ error: 'Failed to check fan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const artistId = decoded.userId

    const { name, email, phone_number, country, gender, age, birth_year, subscribed_status, source } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if fan already exists for this artist
    const existingFan = await pool.query(
      'SELECT id FROM fans WHERE artist_id = $1 AND email = $2',
      [artistId, email]
    )

    if (existingFan.rows.length > 0) {
      return NextResponse.json({ error: 'Fan with this email already exists' }, { status: 409 })
    }

    const result = await pool.query(`
      INSERT INTO fans (artist_id, name, email, phone_number, country, gender, age, birth_year, subscribed_status, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [artistId, name, email, phone_number, country, gender, age, birth_year, subscribed_status || 'free', source || 'manual'])

    return NextResponse.json({ fan: result.rows[0] })
  } catch (error) {
    console.error('Create fan error:', error)
    return NextResponse.json({ error: 'Failed to create fan' }, { status: 500 })
  }
}
