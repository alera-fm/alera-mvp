import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await requireAdmin(request)
    const { id } = await params
    const uploadId = parseInt(id)
    if (isNaN(uploadId)) {
      return NextResponse.json({ error: 'Invalid upload ID' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // First, get the artist_id from the upload record
      const uploadResult = await client.query(
        'SELECT artist_id FROM upload_history WHERE id = $1',
        [uploadId]
      )

      if (uploadResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Upload record not found' }, { status: 404 })
      }

      const artistId = uploadResult.rows[0].artist_id

      // Delete associated streaming earnings data
      await client.query(
        'DELETE FROM streaming_earnings WHERE artist_id = $1',
        [artistId]
      )

      // Delete the upload record
      await client.query(
        'DELETE FROM upload_history WHERE id = $1',
        [uploadId]
      )

      // Log the admin action
      await client.query(`
        INSERT INTO admin_action_logs (admin_id, action_type, details, created_at)
        VALUES ($1, 'DELETE_UPLOAD', $2, CURRENT_TIMESTAMP)
      `, [
        adminId,
        JSON.stringify({ uploadId, artistId })
      ])

      await client.query('COMMIT')

      return NextResponse.json({ message: 'Upload record deleted successfully' })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Delete upload error:', error)
    return NextResponse.json({ error: 'Failed to delete upload record' }, { status: 500 })
  }
}
