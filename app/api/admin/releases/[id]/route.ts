import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { id: releaseId } = await params

    const releaseResult = await pool.query(`
      SELECT r.*, u.artist_name as artist_display_name, u.email as artist_email,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', t.id,
                   'track_number', t.track_number,
                   'track_title', t.track_title,
                   'artist_names', t.artist_names,
                   'featured_artists', t.featured_artists,
                   'songwriters', t.songwriters,
                   'producer_credits', t.producer_credits,
                   'performer_credits', t.performer_credits,
                   'genre', t.genre,
                   'audio_file_url', t.audio_file_url,
                   'audio_file_name', t.audio_file_name,
                   'isrc', t.isrc,
                   'lyrics_text', t.lyrics_text,
                   'has_lyrics', t.has_lyrics
                 ) ORDER BY t.track_number
               ) FILTER (WHERE t.id IS NOT NULL), 
               '[]'
             ) as tracks
      FROM releases r
      JOIN users u ON r.artist_id = u.id
      LEFT JOIN tracks t ON r.id = t.release_id
      WHERE r.id = $1
      GROUP BY r.id, u.artist_name, u.email, r.upc
    `, [releaseId])

    if (releaseResult.rows.length === 0) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    return NextResponse.json({ release: releaseResult.rows[0] })
  } catch (error) {
    console.error('Admin get release error:', error)
    return NextResponse.json({ error: 'Failed to fetch release' }, { status: 500 })
  }
}
