import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const result = await pool.query(`
      SELECT 
        wr.id,
        wr.amount_requested,
        wr.method,
        wr.account_details,
        wr.status,
        wr.created_at,
        wr.updated_at,
        wr.processed_at,
        u.email as artist_email,
        u.artist_name
      FROM withdrawal_requests wr
      JOIN users u ON wr.artist_id = u.id
      ORDER BY wr.created_at DESC
    `)

    return NextResponse.json({
      withdrawals: result.rows
    })
  } catch (error) {
    console.error('Admin withdrawals error:', error)
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { withdrawal_id, status } = await request.json()

    if (!withdrawal_id || !status) {
      return NextResponse.json({ error: 'Missing withdrawal_id or status' }, { status: 400 })
    }

    // Update withdrawal status
    const result = await pool.query(`
      UPDATE withdrawal_requests 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, withdrawal_id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Withdrawal status updated successfully',
      withdrawal: result.rows[0]
    })
  } catch (error) {
    console.error('Update withdrawal status error:', error)
    return NextResponse.json({ error: 'Failed to update withdrawal status' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { withdrawal_id, status } = await request.json()

    if (!withdrawal_id || !status) {
      return NextResponse.json(
        { error: 'Withdrawal ID and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const result = await client.query(`
        UPDATE withdrawal_requests 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [status, withdrawal_id])

      if (result.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
      }

      // Log the admin action
      // Assuming authResult is available in the scope, possibly populated by requireAdmin middleware
      // and contains the admin's user ID.  If not available, you'll need to fetch the admin's ID.
      // The following line is a placeholder and might require adjustments based on your actual auth setup.
      const authResult = { user: { id: 'ADMIN_USER_ID' } };  // Replace with actual admin user ID retrieval

      await client.query(`
        INSERT INTO admin_action_logs (admin_id, action_type, details, created_at)
        VALUES ($1, 'WITHDRAWAL_STATUS_UPDATE', $2, NOW())
      `, [
        authResult.user.id,  //  Use the actual admin user ID here
        JSON.stringify({
          withdrawal_id: withdrawal_id,
          new_status: status,
          amount: result.rows[0].amount_requested
        })
      ])

      await client.query('COMMIT')

      return NextResponse.json({
        message: `Withdrawal ${status} successfully`,
        withdrawal: result.rows[0]
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Admin withdrawal update error:', error)

    if (error instanceof Error) {
      if (error.message === 'No authorization token provided' || 
          error.message === 'Invalid token' ||
          error.message === 'Admin access required') {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
