import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artist_id')

    if (!artistId) {
      return NextResponse.json({ error: 'artist_id is required' }, { status: 400 })
    }

    // Get monthly totals for graphing (use reporting_month for accurate filtering)
    const monthlyResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', reporting_month) as month,
        SUM(amount_usd) as total_earnings,
        COUNT(DISTINCT reporting_month) as transaction_count
      FROM streaming_earnings 
      WHERE artist_id = $1
      GROUP BY DATE_TRUNC('month', reporting_month)
      ORDER BY month DESC
      LIMIT 12
    `, [artistId])

    // Get withdrawal transactions only
    const withdrawalResult = await pool.query(`
      SELECT 
        created_at as date,
        'Withdrawal' as type,
        method as source,
        amount_requested as amount,
        status
      FROM withdrawal_requests 
      WHERE artist_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [artistId])

    // Only include withdrawal transactions in transaction history
    const allTransactions = withdrawalResult.rows

    return NextResponse.json({
      monthly_data: monthlyResult.rows.map(row => ({
        month: row.month,
        total_earnings: Number(row.total_earnings),
        transaction_count: parseInt(row.transaction_count)
      })),
      transactions: allTransactions
    })
  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json({ error: 'Failed to fetch wallet history' }, { status: 500 })
  }
}
