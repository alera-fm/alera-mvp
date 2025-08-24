
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const artistId = decoded.userId
    const fanId = params.id

    const { name, email, phone_number, country, gender, age, birth_year, subscribed_status } = await request.json()

    // Check if fan belongs to this artist
    const fanCheck = await pool.query(
      'SELECT id FROM fans WHERE id = $1 AND artist_id = $2',
      [fanId, artistId]
    )

    if (fanCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Fan not found or access denied' }, { status: 404 })
    }

    const result = await pool.query(`
      UPDATE fans 
      SET name = $1, email = $2, phone_number = $3, country = $4, gender = $5, 
          age = $6, birth_year = $7, subscribed_status = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND artist_id = $10
      RETURNING *
    `, [name, email, phone_number, country, gender, age, birth_year, subscribed_status, fanId, artistId])

    return NextResponse.json({ fan: result.rows[0] })
  } catch (error) {
    console.error('Update fan error:', error)
    return NextResponse.json({ error: 'Failed to update fan' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const artistId = decoded.userId
    const fanId = params.id

    const result = await pool.query(
      'DELETE FROM fans WHERE id = $1 AND artist_id = $2 RETURNING id',
      [fanId, artistId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Fan not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Fan deleted successfully' })
  } catch (error) {
    console.error('Delete fan error:', error)
    return NextResponse.json({ error: 'Failed to delete fan' }, { status: 500 })
  }
}
