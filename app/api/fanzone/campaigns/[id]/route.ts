
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const artistId = decoded.userId
    const campaignId = params.id

    // Check if campaign exists and belongs to artist
    const campaignCheck = await pool.query(
      'SELECT id FROM email_campaigns WHERE id = $1 AND artist_id = $2',
      [campaignId, artistId]
    )

    if (campaignCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Delete campaign (cascade will handle campaign_logs)
    await pool.query(
      'DELETE FROM email_campaigns WHERE id = $1 AND artist_id = $2',
      [campaignId, artistId]
    )

    return NextResponse.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
