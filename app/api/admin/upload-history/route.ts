import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artist_id')
    const days = parseInt(searchParams.get('days') || '30')
    
    // Build query with optional artist filter - include both analytics and earnings uploads
    const params = []
    let artistFilter = ''
    if (artistId) {
      artistFilter = ` AND uh.artist_id = $${params.length + 1}`
      params.push(artistId)
    }
    
    let analyticsArtistFilter = ''
    if (artistId) {
      analyticsArtistFilter = ` AND au.uploaded_by = $${params.length + 1}`
      params.push(artistId)
    }
    
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
        uh.uploaded_at as last_upload,
        'earnings' as upload_type
      FROM upload_history uh
      LEFT JOIN users u ON uh.artist_id = u.id
      WHERE uh.uploaded_at >= NOW() - INTERVAL '${days} days'${artistFilter}
      
      UNION ALL
      
      SELECT 
        au.id,
        au.uploaded_by as artist_id,
        u2.artist_name,
        u2.email,
        au.filename,
        au.reporting_date as reporting_month,
        au.total_records as record_count,
        0 as total_amount,
        1 as platform_count,
        'success' as upload_status,
        au.uploaded_at,
        au.uploaded_at as first_upload,
        au.uploaded_at as last_upload,
        'analytics' as upload_type
      FROM analytics_uploads au
      LEFT JOIN users u2 ON au.uploaded_by = u2.id
      WHERE au.uploaded_at >= NOW() - INTERVAL '${days} days'${analyticsArtistFilter}
      
      ORDER BY uploaded_at DESC
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
        upload_status: row.upload_status || 'success',
        upload_type: row.upload_type || 'earnings'
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
