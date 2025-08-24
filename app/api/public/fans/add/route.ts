import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, name, email, phone_number, country, gender, age, birth_year, subscribed_status } = body || {}

    if (!slug || !name || !email) {
      return NextResponse.json({ error: 'slug, name and email are required' }, { status: 400 })
    }

    const lp = await pool.query('SELECT artist_id FROM landing_pages WHERE slug = $1 LIMIT 1', [slug])
    const artistId = lp.rows[0]?.artist_id
    if (!artistId) return NextResponse.json({ error: 'Invalid slug' }, { status: 404 })

    // Upsert-like behaviour: if fan exists for email, do nothing
    const exists = await pool.query('SELECT id FROM fans WHERE artist_id=$1 AND lower(email)=lower($2) LIMIT 1', [artistId, email])
    if (exists.rows.length > 0) {
      return NextResponse.json({ ok: true, fan_id: exists.rows[0].id, status: 'exists' })
    }

    const res = await pool.query(
      `INSERT INTO fans (artist_id, name, email, phone_number, country, gender, age, birth_year, subscribed_status, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [
        artistId,
        name,
        email,
        phone_number || null,
        country || null,
        gender || null,
        age ? Number(age) : null,
        birth_year ? Number(birth_year) : null,
        subscribed_status || 'free',
        'email_capture',
      ]
    )

    return NextResponse.json({ ok: true, fan_id: res.rows[0].id })
  } catch (e) {
    console.error('public add fan error', e)
    return NextResponse.json({ error: 'Failed to add fan' }, { status: 500 })
  }
}


