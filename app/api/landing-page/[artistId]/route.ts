import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ artistId: string }> }) {
  try {
    const { artistId: artistIdParam } = await params
    const artistId = parseInt(artistIdParam, 10)
    const sql = `SELECT id, artist_id, slug, page_config FROM landing_pages WHERE artist_id = $1 LIMIT 1`
    const result = await query(sql, [artistId])
    return NextResponse.json({ page: result.rows[0] || null })
  } catch (e) {
    console.error('Landing page GET error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ artistId: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { artistId: artistIdParam } = await params
    const artistIdFromParam = parseInt(artistIdParam, 10)
    if (decoded.userId !== artistIdFromParam) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { slug, page_config } = await request.json()
    if (!slug || !page_config) return NextResponse.json({ error: 'Missing slug or page_config' }, { status: 400 })

    // Ensure slug is unique across artists
    const taken = await query('SELECT 1 FROM landing_pages WHERE slug = $1 AND artist_id <> $2 LIMIT 1', [slug, artistIdFromParam])
    if (taken.rows.length > 0) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    }

    const upsert = `
      INSERT INTO landing_pages (artist_id, slug, page_config)
      VALUES ($1, $2, $3)
      ON CONFLICT (artist_id) DO UPDATE SET
        slug = EXCLUDED.slug,
        page_config = EXCLUDED.page_config
      RETURNING id, artist_id, slug, page_config
    `
    const result = await query(upsert, [artistIdFromParam, slug, page_config])
    return NextResponse.json({ page: result.rows[0] })
  } catch (e) {
    console.error('Landing page POST error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


