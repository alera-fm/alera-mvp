import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const payoutMethodsResult = await pool.query(`
      SELECT pm.*, u.artist_name, u.email as artist_email
      FROM payout_methods pm
      JOIN users u ON pm.artist_id = u.id
      ORDER BY pm.created_at DESC
    `)

    return NextResponse.json({ payoutMethods: payoutMethodsResult.rows })
  } catch (error) {
    console.error('Admin get payout methods error:', error)
    return NextResponse.json({ error: 'Failed to fetch payout methods' }, { status: 500 })
  }
}
