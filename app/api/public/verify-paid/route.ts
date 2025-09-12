import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { slug, email } = await request.json()
    if (!slug || !email) {
      return NextResponse.json({ error: 'slug and email are required' }, { status: 400 })
    }

    // Find artist_id by landing page slug
    const lp = await pool.query('SELECT artist_id FROM landing_pages WHERE slug = $1 LIMIT 1', [slug])
    const artistId = lp.rows[0]?.artist_id
    if (!artistId) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 404 })
    }

    const f = await pool.query(
      'SELECT subscribed_status FROM fans WHERE artist_id = $1 AND lower(email) = lower($2) LIMIT 1',
      [artistId, email]
    )
    const status = f.rows[0]?.subscribed_status || null
    const paid = status === 'paid'
    return NextResponse.json({ paid, status })
  } catch (e) {
    console.error('verify-paid error', e)
    return NextResponse.json({ error: 'Failed to verify' }, { status: 500 })
  }
}


