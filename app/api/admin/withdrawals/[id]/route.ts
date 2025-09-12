import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyAdminToken } from '@/lib/admin-middleware'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const adminCheck = await verifyAdminToken(request)
    if (!adminCheck.isValid) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 })
    }

    const { status } = await request.json()
    const withdrawalId = params.id

    if (!status || !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ 
        error: 'Valid status (pending, approved, rejected, or completed) is required' 
      }, { status: 400 })
    }

    // Update withdrawal status
    const result = await pool.query(`
      UPDATE withdrawal_requests 
      SET status = $1, processed_at = CURRENT_TIMESTAMP, processed_by = $2
      WHERE id = $3
      RETURNING *
    `, [status, adminCheck.adminId, withdrawalId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: `Withdrawal request ${status} successfully`,
      withdrawal: result.rows[0]
    })
  } catch (error) {
    console.error('Update withdrawal status error:', error)
    return NextResponse.json({ error: 'Failed to update withdrawal status' }, { status: 500 })
  }
}
