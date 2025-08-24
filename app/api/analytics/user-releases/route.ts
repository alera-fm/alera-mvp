
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get unique songs from streaming analytics
    const songsQuery = `
      SELECT DISTINCT song_title as title, song_title as id
      FROM streaming_analytics 
      WHERE artist_id = $1 
      ORDER BY song_title ASC
    `
    const songsResult = await query(songsQuery, [decoded.userId])

    return NextResponse.json({
      releases: songsResult.rows
    })

  } catch (error) {
    console.error('User releases API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
