import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { pool } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const releaseId = params.id

    // Get release details
    const releaseResult = await pool.query(
      "SELECT * FROM releases WHERE id = $1 AND artist_id = $2",
      [releaseId, decoded.userId]
    )

    if (releaseResult.rows.length === 0) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 })
    }

    // Get tracks for the release
    const tracksResult = await pool.query(
      "SELECT * FROM tracks WHERE release_id = $1 ORDER BY track_number",
      [releaseId]
    )

    const release = {
      ...releaseResult.rows[0],
      selected_stores: releaseResult.rows[0].selected_stores || [],
      tracks: tracksResult.rows
    }

    return NextResponse.json({ release })
  } catch (error) {
    console.error("Error fetching release:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    console.log('[Update Release] received payload keys:', Object.keys(data || {}))
    const releaseId = params.id

    const {
      distribution_type,
      artist_name,
      release_title,
      record_label,
      c_line,
      p_line,
      has_spotify_profile,
      spotify_profile_url,
      has_apple_profile,
      apple_profile_url,
      additional_delivery,
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
      release_date
    } = data

    // Validate required fields
    if (!distribution_type || !artist_name || !release_title || !primary_genre || !language || !release_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate songwriter requirements for each track
    if (tracks && tracks.length > 0) {
      for (const track of tracks) {
        if (!track.songwriters || track.songwriters.length === 0) {
          return NextResponse.json({ 
            error: 'Each track must have at least one songwriter with first name, last name, and role' 
          }, { status: 400 })
        }
        
        for (const songwriter of track.songwriters) {
          if (!songwriter.firstName?.trim() || !songwriter.lastName?.trim() || !songwriter.role?.trim()) {
            return NextResponse.json({ 
              error: 'Songwriter information is incomplete. Please provide first name, last name, and role for all songwriters' 
            }, { status: 400 })
          }
        }
      }
    }

    // Validate release date is at least 7 days in the future
    const releaseDateTime = new Date(release_date)
    const minReleaseDate = new Date()
    minReleaseDate.setDate(minReleaseDate.getDate() + 7)

    if (releaseDateTime < minReleaseDate) {
      return NextResponse.json({ error: 'Release date must be at least 7 days in the future' }, { status: 400 })
    }

    // Validate original_release_date is provided if previously_released is true
    if (previously_released && !original_release_date) {
      return NextResponse.json({ error: 'Original release date is required when previously released is selected' }, { status: 400 })
    }

    // Check if release exists and belongs to user
    const existingRelease = await pool.query(
      'SELECT * FROM releases WHERE id = $1 AND artist_id = $2',
      [releaseId, decoded.userId]
    )

    if (existingRelease.rows.length === 0) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    // Don't allow editing if already live or sent to stores
    if (existingRelease.rows[0].status === 'live' || existingRelease.rows[0].status === 'sent_to_stores') {
      return NextResponse.json({ error: 'Cannot edit release that is live or sent to stores' }, { status: 400 })
    }

    // Reset status to under_review if artist makes changes to approved/rejected release
    let finalStatus = submit_for_review ? 'under_review' : 'draft'
    if (existingRelease.rows[0].status === 'approved' || existingRelease.rows[0].status === 'rejected') {
      finalStatus = 'under_review'
      console.log('[Release Edit] Status reset to under_review due to artist changes')
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Update release
      const updateResult = await client.query(`
        UPDATE releases SET
          distribution_type = $1, artist_name = $2, release_title = $3, record_label = $4,
          c_line = $5, p_line = $6, has_spotify_profile = $7, spotify_profile_url = $8, 
          has_apple_profile = $9, apple_profile_url = $10, additional_delivery = $11,
          primary_genre = $12, secondary_genre = $13, language = $14, explicit_lyrics = $15,
          instrumental = $16, version_info = $17, version_other = $18, release_date = $19, original_release_date = $20,
          previously_released = $21, album_cover_url = $22, selected_stores = $23, track_price = $24,
          status = $25, terms_agreed = $26, fake_streaming_agreement = $27, distribution_agreement = $28,
          artist_names_agreement = $29, snapchat_terms = $30, youtube_music_agreement = $31,
          submitted_at = $32, updated_at = CURRENT_TIMESTAMP
        WHERE id = $33 AND artist_id = $34
        RETURNING *
      `, [
        distribution_type,
        artist_name,
        release_title,
        record_label,
        c_line || null,
        p_line || null,
        has_spotify_profile || false,
        spotify_profile_url || null,
        has_apple_profile || false,
        apple_profile_url || null,
        JSON.stringify(additional_delivery || []),
        primary_genre,
        secondary_genre,
        language,
        explicit_lyrics,
        instrumental,
        version_info,
        version_other,
        release_date,
        original_release_date,
        previously_released,
        album_cover_url,
        JSON.stringify(selected_stores || []),
        track_price,
        finalStatus,
        terms_agreed,
        fake_streaming_agreement,
        distribution_agreement,
        artist_names_agreement,
        snapchat_terms,
        youtube_music_agreement,
        submit_for_review ? new Date() : existingRelease.rows[0].submitted_at,
        releaseId,
        decoded.userId
      ])

      // Delete existing tracks and insert new ones
      await client.query('DELETE FROM tracks WHERE release_id = $1', [releaseId])

      if (tracks && tracks.length > 0) {
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i]
          const audioUrl = track.audio_file_url || track.audioFileUrl || null
          const audioName = track.audio_file_name || track.audioFileName || null
          console.log('[Update Release] track', i + 1, {
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
            releaseId,
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
        message: submit_for_review ? 'Release submitted for review successfully' : 'Release updated successfully',
        release: updateResult.rows[0]
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Update release error:', error)
    return NextResponse.json({ error: 'Failed to update release' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const releaseId = params.id

    // Check if release exists and belongs to user
    const existingRelease = await pool.query(
      'SELECT * FROM releases WHERE id = $1 AND artist_id = $2',
      [releaseId, decoded.userId]
    )

    if (existingRelease.rows.length === 0) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    // Don't allow deletion if already under review or published
    if (existingRelease.rows[0].status !== 'draft') {
      return NextResponse.json({ error: 'Cannot delete release that is not in draft status' }, { status: 400 })
    }

    // Delete release (tracks will be deleted automatically due to CASCADE)
    await pool.query('DELETE FROM releases WHERE id = $1 AND artist_id = $2', [releaseId, decoded.userId])

    return NextResponse.json({ message: 'Release deleted successfully' })
  } catch (error) {
    console.error('Delete release error:', error)
    return NextResponse.json({ error: 'Failed to delete release' }, { status: 500 })
  }
}