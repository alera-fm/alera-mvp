import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function POST(
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

    console.log('Takedown request for release:', { releaseId, userId: tokenData.userId })

    // Check if release exists and belongs to user
    const existingRelease = await pool.query(
      "SELECT id, release_title, status, artist_id FROM releases WHERE id = $1 AND artist_id = $2",
      [releaseId, tokenData.userId]
    )

    if (existingRelease.rows.length === 0) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    const release = existingRelease.rows[0]
    console.log('Found release:', { id: release.id, title: release.release_title, status: release.status })

    // Check if release is in a state that allows takedown requests
    const allowedStatuses = ['live', 'sent_to_stores', 'under_review']
    if (!allowedStatuses.includes(release.status)) {
      return NextResponse.json({ 
        error: `Release cannot be taken down in current status: ${release.status}. Only live, sent to stores, or under review releases can be taken down.` 
      }, { status: 400 })
    }

    // Update the release status to "takedown_requested"
    const result = await pool.query(`
      UPDATE releases 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND artist_id = $3
      RETURNING *
    `, ['takedown_requested', releaseId, tokenData.userId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to update release status' }, { status: 500 })
    }

    console.log('Successfully updated release status to takedown_requested:', result.rows[0].id)

    return NextResponse.json({
      success: true,
      message: 'Takedown request submitted successfully',
      release: result.rows[0]
    })

  } catch (error) {
    console.error('Error requesting takedown:', error)
    return NextResponse.json({ 
      error: 'Failed to request takedown' 
    }, { status: 500 })
  }
}
