import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'under_review'
    const artistId = searchParams.get('artist_id')

    let query = `
      SELECT r.*, u.artist_name as artist_display_name, u.email as artist_email,
             COUNT(t.id) as track_count
      FROM releases r
      JOIN users u ON r.artist_id = u.id
      LEFT JOIN tracks t ON r.id = t.release_id
      WHERE r.status = $1`
    
    const params = [status]
    
    if (artistId) {
      query += ` AND r.artist_id = $2`
      params.push(artistId)
    }
    
    query += `
      GROUP BY r.id, u.artist_name, u.email
      ORDER BY r.submitted_at DESC`

    const releasesResult = await pool.query(query, params)

    return NextResponse.json({ releases: releasesResult.rows })
  } catch (error) {
    console.error('Admin get releases error:', error)
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request)

    const { release_id, status } = await request.json()

    if (!release_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['under_review', 'sent_to_stores', 'live', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be one of: under_review, sent_to_stores, live, rejected' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const result = await client.query(`
        UPDATE releases 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [status, release_id])

      if (result.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Release not found' }, { status: 404 })
      }

      // Log the admin action (temporarily disabled for debugging)
      console.log(`Admin ${adminId} updated release ${release_id} status to ${status}`)

      await client.query('COMMIT')

      return NextResponse.json({
        message: `Release ${status} successfully`,
        release: result.rows[0]
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Admin update release error:', error)
    return NextResponse.json({ error: 'Failed to update release status' }, { status: 500 })
  }
}
