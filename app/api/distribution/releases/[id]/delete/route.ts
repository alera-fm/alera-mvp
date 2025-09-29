import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function DELETE(
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

    console.log('Delete draft request for release:', { releaseId, userId: tokenData.userId })

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

    // Only allow deletion of draft releases
    if (release.status !== 'draft') {
      return NextResponse.json({ 
        error: `Cannot delete release with status: ${release.status}. Only draft releases can be deleted.` 
      }, { status: 400 })
    }

    // Delete the release
    const result = await pool.query(
      "DELETE FROM releases WHERE id = $1 AND artist_id = $2 AND status = 'draft'",
      [releaseId, tokenData.userId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Failed to delete release' }, { status: 500 })
    }

    console.log('Successfully deleted draft release:', releaseId)

    return NextResponse.json({
      success: true,
      message: 'Draft release deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting draft release:', error)
    return NextResponse.json({ 
      error: 'Failed to delete draft release' 
    }, { status: 500 })
  }
}
