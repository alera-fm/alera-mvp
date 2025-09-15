import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await requireAdmin(request)
    const { id: releaseId } = await params

    const { upc, trackCodes } = await request.json()

    if (!upc && !trackCodes) {
      return NextResponse.json({ error: 'Either UPC or track codes must be provided' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Update release UPC if provided
      if (upc) {
        const upcResult = await client.query(`
          UPDATE releases 
          SET upc = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `, [upc, releaseId])

        if (upcResult.rows.length === 0) {
          await client.query('ROLLBACK')
          return NextResponse.json({ error: 'Release not found' }, { status: 404 })
        }
      }

      // Update track ISRC codes if provided
      if (trackCodes && Array.isArray(trackCodes)) {
        for (const trackCode of trackCodes) {
          const { trackId, isrc } = trackCode
          
          if (!trackId || !isrc) {
            await client.query('ROLLBACK')
            return NextResponse.json({ error: 'Each track code must have trackId and isrc' }, { status: 400 })
          }

          const trackResult = await client.query(`
            UPDATE tracks 
            SET isrc = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND release_id = $3
            RETURNING *
          `, [isrc, trackId, releaseId])

          if (trackResult.rows.length === 0) {
            await client.query('ROLLBACK')
            return NextResponse.json({ error: `Track ${trackId} not found for this release` }, { status: 404 })
          }
        }
      }

      // Log the admin action
      console.log(`Admin ${adminId} updated codes for release ${releaseId}`)

      await client.query('COMMIT')

      return NextResponse.json({
        message: 'Codes updated successfully',
        releaseId
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Admin update codes error:', error)
    return NextResponse.json({ error: 'Failed to update codes' }, { status: 500 })
  }
}
