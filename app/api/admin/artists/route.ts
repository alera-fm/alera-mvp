import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, email, artist_name, created_at
      FROM users 
      WHERE is_admin = false
      ORDER BY artist_name ASC, email ASC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching artists:', error)
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }
}
