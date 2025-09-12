import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const data = await request.json()
    console.log('[Create Release] received payload keys:', Object.keys(data || {}))

    const {
      distribution_type,
      artist_name,
      release_title,
      record_label,
      primary_genre,
      secondary_genre,
      language,
      explicit_lyrics,
      instrumental,
      version_info,
      version_other,
      original_release_date,
      previously_released,
      album_cover_url,
      selected_stores,
      track_price,
      terms_agreed,
      fake_streaming_agreement,
      distribution_agreement,
      artist_names_agreement,
      snapchat_terms,
      youtube_music_agreement,
      tracks,
      submit_for_review,
      release_date // Added release_date
    } = data

    // Validate required fields
    if (!distribution_type || !artist_name || !release_title || !primary_genre || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate distribution type vs track count
    const trackCount = tracks?.length || 0
    if (distribution_type === 'Single' && trackCount !== 1) {
      return NextResponse.json({ error: 'Single must have exactly 1 track' }, { status: 400 })
    }
    if (distribution_type === 'EP' && (trackCount < 2 || trackCount > 8)) {
      return NextResponse.json({ error: 'EP must have 2-8 tracks' }, { status: 400 })
    }
    if (distribution_type === 'Album' && trackCount < 8) {
      return NextResponse.json({ error: 'Album must have 8 or more tracks' }, { status: 400 })
    }

    // If submitting for review, validate all required agreements
    if (submit_for_review) {
      if (!terms_agreed || !fake_streaming_agreement || !distribution_agreement || !artist_names_agreement || !youtube_music_agreement) {
        return NextResponse.json({ error: 'All agreements must be accepted before submission' }, { status: 400 })
      }
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert or update release
      const releaseResult = await client.query(`
        INSERT INTO releases (
          artist_id, distribution_type, artist_name, release_title, record_label,
          primary_genre, secondary_genre, language, explicit_lyrics, instrumental,
          version_info, version_other, release_date, original_release_date, previously_released,
          album_cover_url, selected_stores, track_price, status, terms_agreed,
          fake_streaming_agreement, distribution_agreement, artist_names_agreement,
          snapchat_terms, youtube_music_agreement, submitted_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
        )
        RETURNING *
      `, [
        decoded.userId,
        distribution_type,
        artist_name,
        release_title,
        record_label,
        primary_genre,
        secondary_genre,
        language,
        explicit_lyrics,
        instrumental,
        version_info,
        version_other,
        release_date,
        original_release_date || null,
        previously_released,
        album_cover_url,
        JSON.stringify(selected_stores || []),
        track_price,
        submit_for_review ? 'under_review' : 'draft',
        terms_agreed,
        fake_streaming_agreement,
        distribution_agreement,
        artist_names_agreement,
        snapchat_terms,
        youtube_music_agreement,
        submit_for_review ? new Date() : null
      ])

      const release = releaseResult.rows[0]

      // Insert tracks
      if (tracks && tracks.length > 0) {
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i]
          const audioUrl = track.audio_file_url || track.audioFileUrl || null
          const audioName = track.audio_file_name || track.audioFileName || null
          console.log('[Create Release] track', i + 1, {
            track_title: track.track_title,
            audio_file_url: track.audio_file_url,
            audioFileUrl: track.audioFileUrl,
            resolvedAudioUrl: audioUrl,
            audio_file_name: track.audio_file_name,
            audioFileName: track.audioFileName,
          })
          await client.query(`
            INSERT INTO tracks (
              release_id, track_number, track_title, artist_names, featured_artists,
              songwriters, producer_credits, performer_credits, genre, audio_file_url,
              audio_file_name, isrc, lyrics_text, has_lyrics, add_featured_to_title
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          `, [
            release.id,
            i + 1,
            track.track_title,
            track.artist_names || [],
            track.featured_artists || [],
            JSON.stringify(track.songwriters || []),
            JSON.stringify(track.producer_credits || []),
            JSON.stringify(track.performer_credits || []),
            track.genre,
            audioUrl,
            audioName,
            track.isrc,
            track.lyrics_text,
            track.has_lyrics || false,
            track.add_featured_to_title || false
          ])
        }
      }

      await client.query('COMMIT')

      return NextResponse.json({
        message: submit_for_review ? 'Release submitted for review successfully' : 'Release saved as draft',
        release
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Create release error:', error)
    return NextResponse.json({ error: 'Failed to create release' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('release_id')

    if (releaseId) {
      // Get specific release with tracks
      const releaseResult = await pool.query(`
        SELECT r.*, 
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
                     'has_lyrics', t.has_lyrics,
                     'add_featured_to_title', t.add_featured_to_title
                   ) ORDER BY t.track_number
                 ) FILTER (WHERE t.id IS NOT NULL), 
                 '[]'
               ) as tracks
        FROM releases r
        LEFT JOIN tracks t ON r.id = t.release_id
        WHERE r.id = $1 AND r.artist_id = $2
        GROUP BY r.id
      `, [releaseId, decoded.userId])

      if (releaseResult.rows.length === 0) {
        return NextResponse.json({ error: 'Release not found' }, { status: 404 })
      }

      return NextResponse.json({ release: releaseResult.rows[0] })
    } else {
      // Get all releases for the artist
      const releasesResult = await pool.query(`
        SELECT r.*, 
               COUNT(t.id) as track_count
        FROM releases r
        LEFT JOIN tracks t ON r.id = t.release_id
        WHERE r.artist_id = $1
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `, [decoded.userId])

      return NextResponse.json({ releases: releasesResult.rows })
    }
  } catch (error) {
    console.error('Get releases error:', error)
    return NextResponse.json({ error: 'Failed to fetch releases' }, { status: 500 })
  }
}