import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const adminId = await requireAdmin(request)

    const { id: releaseId } = await params
    const { update_status } = await request.json()

    if (update_status === undefined) {
      return NextResponse.json({ error: 'update_status is required' }, { status: 400 })
    }

    // Validate update_status values
    const validStatuses = ['Changes Submitted', 'Up-to-Date', null, '']
    if (!validStatuses.includes(update_status)) {
      return NextResponse.json({ 
        error: 'Invalid update_status. Must be one of: Changes Submitted, Up-to-Date, or null' 
      }, { status: 400 })
    }

    // Convert empty string to null for database storage
    const dbUpdateStatus = update_status === '' ? null : update_status

    // Check if release exists
    const existingRelease = await pool.query(
      "SELECT id, release_title, artist_id FROM releases WHERE id = $1",
      [releaseId]
    )

    if (existingRelease.rows.length === 0) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    // Update the release's update_status
    const result = await pool.query(`
      UPDATE releases 
      SET update_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [dbUpdateStatus, releaseId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to update release' }, { status: 500 })
    }

    // Log the admin action
    console.log(`Admin ${adminId} updated release ${releaseId} update_status to ${update_status}`)

    return NextResponse.json({
      success: true,
      message: `Release update status updated to ${update_status || 'none'}`,
      release: result.rows[0]
    })

  } catch (error) {
    console.error('Error updating release update_status:', error)
    return NextResponse.json({ 
      error: 'Failed to update release update status' 
    }, { status: 500 })
  }
}
