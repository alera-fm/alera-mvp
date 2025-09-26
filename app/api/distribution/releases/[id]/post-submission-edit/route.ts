import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const tokenData = verifyToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: releaseId } = await params
    const { credits, lyrics } = await request.json()

    console.log('Post-submission edit request:', { releaseId, credits, lyrics })

    if (!credits || typeof credits !== 'object') {
      return NextResponse.json({ error: 'Credits are required and must be an object' }, { status: 400 })
    }

    // Lyrics can be empty, so we don't validate it
    console.log('Validation passed - credits:', credits, 'lyrics:', lyrics)

    // Check if release exists and belongs to user
    console.log('Querying release:', { releaseId, userId: tokenData.userId })
    const existingRelease = await pool.query(
      "SELECT * FROM releases WHERE id = $1 AND artist_id = $2",
      [releaseId, tokenData.userId]
    )
    console.log('Query result:', existingRelease.rows.length, 'rows found')

    if (existingRelease.rows.length === 0) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    const release = existingRelease.rows[0]
    console.log('Found release:', { id: release.id, status: release.status, artist_id: release.artist_id })

    // Check if release is in a state that allows post-submission edits
    const allowedStatuses = ['pending', 'under_review', 'sent_to_stores', 'live']
    if (!allowedStatuses.includes(release.status)) {
      console.log('Release status not allowed:', release.status)
      return NextResponse.json({ 
        error: `Release cannot be edited in current status: ${release.status}` 
      }, { status: 400 })
    }

    // Allow multiple edits - update_status can be changed from "Changes Submitted" to "Changes Submitted" again
    console.log('Release status allows editing:', release.status, 'Current update_status:', release.update_status)

    // Update the release with new credits and lyrics
    // Set update_status to "Changes Submitted"
    const creditsJson = JSON.stringify(credits)
    console.log('Updating release with:', { 
      credits: creditsJson, 
      lyrics, 
      releaseId, 
      userId: tokenData.userId 
    })
    
    let result
    try {
      result = await pool.query(`
        UPDATE releases SET
          credits = $1,
          lyrics = $2,
          update_status = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND artist_id = $5
        RETURNING *
      `, [
        creditsJson,
        lyrics,
        'Changes Submitted',
        releaseId,
        tokenData.userId
      ])
      
      console.log('Update query executed successfully, rows affected:', result.rows.length)
    } catch (dbError) {
      console.error('Database update error:', dbError)
      throw dbError
    }

    if (result.rows.length === 0) {
      console.log('No rows updated - release not found or unauthorized')
      return NextResponse.json({ error: 'Failed to update release' }, { status: 500 })
    }

    console.log('Successfully updated release:', result.rows[0].id)
    return NextResponse.json({
      success: true,
      message: 'Changes submitted for review',
      release: result.rows[0]
    })

  } catch (error) {
    console.error('Error updating post-submission release:', error)
    return NextResponse.json(
      { error: `Failed to update release: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
