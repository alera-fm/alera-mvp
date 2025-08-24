import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artist_id')

    if (!artistId) {
      return NextResponse.json({ error: 'artist_id is required' }, { status: 400 })
    }

    const result = await pool.query(`
      SELECT 
        id,
        amount_requested,
        method,
        account_details,
        status,
        created_at,
        updated_at,
        processed_at
      FROM withdrawal_requests 
      WHERE artist_id = $1
      ORDER BY created_at DESC
    `, [artistId])

    return NextResponse.json({ withdrawals: result.rows })
  } catch (error) {
    console.error('Get withdrawals error:', error)
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
  }
}
