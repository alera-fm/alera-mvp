import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const tokenData = verifyToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { title } = await request.json()
    
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Release title is required' }, { status: 400 })
    }

    // Create new release with draft status
    const result = await pool.query(
      `INSERT INTO releases (
        artist_id, 
        release_title, 
        status, 
        current_step,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING id, release_title, status, current_step, created_at`,
      [tokenData.userId, title.trim(), 'draft', 'basic_info']
    )

    const release = result.rows[0]

    return NextResponse.json({
      success: true,
      release: {
        id: release.id,
        title: release.release_title,
        status: release.status,
        currentStep: release.current_step,
        createdAt: release.created_at
      }
    })

  } catch (error) {
    console.error('Error creating draft release:', error)
    return NextResponse.json(
      { error: 'Failed to create draft release' },
      { status: 500 }
    )
  }
}
