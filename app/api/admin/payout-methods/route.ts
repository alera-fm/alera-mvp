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

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request)
    
    const { payout_method_id, status } = await request.json()
    
    if (!payout_method_id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Valid payout_method_id and status (approved or rejected) are required' 
      }, { status: 400 })
    }

    // Update payout method status
    const result = await pool.query(`
      UPDATE payout_methods 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, payout_method_id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Payout method not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: `Payout method ${status} successfully`,
      payoutMethod: result.rows[0]
    })
  } catch (error) {
    console.error('Update payout method status error:', error)
    return NextResponse.json({ error: 'Failed to update payout method status' }, { status: 500 })
  }
}
