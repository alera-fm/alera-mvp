
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
    const offset = (page - 1) * limit

    // Get campaigns with sent count
    const campaignsResult = await pool.query(`
      SELECT 
        c.*,
        COUNT(cl.id) as emails_sent
      FROM email_campaigns c
      LEFT JOIN campaign_logs cl ON c.id = cl.campaign_id
      WHERE c.artist_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [artistId, limit, offset])

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM email_campaigns WHERE artist_id = $1',
      [artistId]
    )
    const totalCount = parseInt(countResult.rows[0].count)

    return NextResponse.json({
      campaigns: campaignsResult.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Get campaigns error:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
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

    const { subject, body, link, audience_filter, send_immediately = false } = await request.json()

    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 })
    }

    // Create campaign
    const campaignResult = await pool.query(`
      INSERT INTO email_campaigns (artist_id, subject, body, link, audience_filter, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [artistId, subject, body, link, JSON.stringify(audience_filter || {}), send_immediately ? 'sent' : 'draft'])

    const campaign = campaignResult.rows[0]

    if (send_immediately) {
      // Get target fans based on audience filter
      let whereClause = 'WHERE artist_id = $1'
      let queryParams = [artistId]
      let paramCount = 1

      if (audience_filter) {
        if (audience_filter.subscribed_status && audience_filter.subscribed_status !== 'all') {
          paramCount++
          whereClause += ` AND subscribed_status = $${paramCount}`
          queryParams.push(audience_filter.subscribed_status)
        }
        
        if (audience_filter.country && audience_filter.country !== 'all') {
          paramCount++
          whereClause += ` AND country = $${paramCount}`
          queryParams.push(audience_filter.country)
        }
        
        if (audience_filter.gender && audience_filter.gender !== 'all') {
          paramCount++
          whereClause += ` AND gender = $${paramCount}`
          queryParams.push(audience_filter.gender)
        }
      }

      const fansResult = await pool.query(`
        SELECT id, email FROM fans ${whereClause}
      `, queryParams)

      // Log email sends (simulate sending for MVP)
      const logPromises = fansResult.rows.map(fan => 
        pool.query(`
          INSERT INTO campaign_logs (campaign_id, fan_id, email, sent_at, status)
          VALUES ($1, $2, $3, NOW(), 'sent')
        `, [campaign.id, fan.id, fan.email])
      )

      await Promise.all(logPromises)

      // Update campaign sent_at
      await pool.query(
        'UPDATE email_campaigns SET sent_at = NOW() WHERE id = $1',
        [campaign.id]
      )

      console.log(`Campaign "${subject}" sent to ${fansResult.rows.length} fans`)
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
