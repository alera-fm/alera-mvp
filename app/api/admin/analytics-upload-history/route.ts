import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Build query with optional platform filter
    let queryText = `
      SELECT 
        au.id,
        au.filename,
        au.platform,
        au.reporting_date,
        au.total_records,
        au.uploaded_at,
        au.uploaded_by,
        au.artist_id,
        u.artist_name as uploaded_by_name,
        u.email as uploaded_by_email,
        artist.artist_name as selected_artist_name
      FROM analytics_uploads au
      LEFT JOIN users u ON au.uploaded_by = u.id
      LEFT JOIN users artist ON au.artist_id = artist.id
      WHERE au.uploaded_at >= NOW() - INTERVAL '${days} days'
    `

    const params: any[] = []
    if (platform && platform !== 'all') {
      queryText += ` AND au.platform = $1`
      params.push(platform)
    }

    queryText += ` ORDER BY au.uploaded_at DESC`

    const result = await query(queryText, params)

    return NextResponse.json({
      uploads: result.rows.map((row: any) => ({
        id: row.id,
        filename: row.filename,
        platform: row.platform,
        reporting_date: row.reporting_date,
        total_records: Number(row.total_records || 0),
        uploaded_at: row.uploaded_at,
        uploaded_by: row.uploaded_by,
        uploaded_by_name: row.uploaded_by_name || row.uploaded_by_email,
        artist_id: row.artist_id,
        selected_artist_name: row.selected_artist_name
      })),
      summary: {
        total_uploads: result.rows.length,
        date_range_days: days
      }
    })
  } catch (error) {
    console.error('Analytics upload history error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics upload history' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const uploadId = parseInt(searchParams.get('upload_id') || '0', 10)
    if (!uploadId) {
      return NextResponse.json({ error: 'upload_id is required' }, { status: 400 })
    }

    await query('DELETE FROM analytics_uploads WHERE id = $1', [uploadId])
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('delete upload error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
