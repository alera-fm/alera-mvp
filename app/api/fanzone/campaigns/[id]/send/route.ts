
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const artistId = decoded.userId
    const campaignId = params.id

    // Get campaign
    const campaignResult = await pool.query(
      'SELECT * FROM email_campaigns WHERE id = $1 AND artist_id = $2',
      [campaignId, artistId]
    )

    if (campaignResult.rows.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const campaign = campaignResult.rows[0]

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 })
    }

    // Get target fans based on audience filter
    const audienceFilter = campaign.audience_filter || {}
    let whereClause = 'WHERE artist_id = $1'
    let queryParams = [artistId]
    let paramCount = 1

    if (audienceFilter.subscribed_status && audienceFilter.subscribed_status !== 'all') {
      paramCount++
      whereClause += ` AND subscribed_status = $${paramCount}`
      queryParams.push(audienceFilter.subscribed_status)
    }
    
    if (audienceFilter.country && audienceFilter.country !== 'all') {
      paramCount++
      whereClause += ` AND country = $${paramCount}`
      queryParams.push(audienceFilter.country)
    }
    
    if (audienceFilter.gender && audienceFilter.gender !== 'all') {
      paramCount++
      whereClause += ` AND gender = $${paramCount}`
      queryParams.push(audienceFilter.gender)
    }

    const fansResult = await pool.query(`
      SELECT id, email FROM fans ${whereClause}
    `, queryParams)

    // Log email sends (simulate sending for MVP)
    const logPromises = fansResult.rows.map(fan => 
      pool.query(`
        INSERT INTO campaign_logs (campaign_id, fan_id, email, sent_at, status)
        VALUES ($1, $2, $3, NOW(), 'sent')
      `, [campaignId, fan.id, fan.email])
    )

    await Promise.all(logPromises)

    // Update campaign status and sent_at
    await pool.query(
      'UPDATE email_campaigns SET status = $1, sent_at = NOW() WHERE id = $2',
      ['sent', campaignId]
    )

    console.log(`Campaign "${campaign.subject}" sent to ${fansResult.rows.length} fans`)

    return NextResponse.json({ 
      message: 'Campaign sent successfully', 
      emails_sent: fansResult.rows.length 
    })
  } catch (error) {
    console.error('Send campaign error:', error)
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 })
  }
}
