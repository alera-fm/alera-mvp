import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artist_id')
    const days = parseInt(searchParams.get('days') || '30')
    
    // Build query with optional artist filter
    let query = `
      SELECT 
        uh.id,
        uh.artist_id,
        u.artist_name,
        u.email,
        uh.filename,
        uh.reporting_month,
        uh.total_records as record_count,
        uh.total_amount,
        uh.platform_count,
        uh.upload_status,
        uh.uploaded_at,
        uh.uploaded_at as first_upload,
        uh.uploaded_at as last_upload
      FROM upload_history uh
      LEFT JOIN users u ON uh.artist_id = u.id
      WHERE uh.uploaded_at >= NOW() - INTERVAL '${days} days'
    `
    
    const params = []
    if (artistId) {
      query += ` AND uh.artist_id = $1`
      params.push(artistId)
    }
    
    query += `
      ORDER BY uh.uploaded_at DESC
    `

    const result = await pool.query(query, params)

    return NextResponse.json({
      uploads: result.rows.map(row => ({
        id: row.id,
        artist_id: row.artist_id,
        artist_name: row.artist_name || row.email,
        filename: row.filename,
        reporting_month: row.reporting_month,
        total_records: parseInt(row.record_count || row.total_records || 0),
        total_amount: Number(row.total_amount || 0),
        uploaded_at: row.uploaded_at,
        platform_count: parseInt(row.platform_count || 0),
        upload_status: row.upload_status || 'success'
      })),
      summary: {
        total_uploads: result.rows.length,
        date_range_days: days
      }
    })
  } catch (error) {
    console.error('Upload history error:', error)
    return NextResponse.json({ error: 'Failed to fetch upload history' }, { status: 500 })
  }
}
