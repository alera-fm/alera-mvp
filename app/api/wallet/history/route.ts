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

    // Get monthly streaming totals
    const streamingResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', reporting_month) as date,
        'Streaming' as type,
        'Monthly Total' as source,
        ROUND(SUM(amount_usd)::numeric, 2) as amount,
        'pending' as status
      FROM streaming_earnings 
      WHERE artist_id = $1
      GROUP BY DATE_TRUNC('month', reporting_month)
      ORDER BY DATE_TRUNC('month', reporting_month) DESC
      LIMIT 12
    `, [artistId])

    // Get monthly tips totals (placeholder for now - would come from tips table)
    // const tipsResult = await pool.query(`
    //   SELECT 
    //     DATE_TRUNC('month', created_at) as date,
    //     'Tips' as type,
    //     'Monthly Total' as source,
    //     ROUND(SUM(amount)::numeric, 2) as amount,
    //     'paid' as status
    //   FROM tips 
    //   WHERE artist_id = $1
    //   GROUP BY DATE_TRUNC('month', created_at)
    //   ORDER BY DATE_TRUNC('month', created_at) DESC
    //   LIMIT 12
    // `, [artistId])
    const tipsResult = { rows: [] }
    
    // Get monthly merch sales totals (placeholder for now - would come from merch table)
    // const merchResult = await pool.query(`
    //   SELECT 
    //     DATE_TRUNC('month', created_at) as date,
    //     'Merch' as type,
    //     'Monthly Total' as source,
    //     ROUND(SUM(amount)::numeric, 2) as amount,
    //     'paid' as status
    //   FROM merch_sales 
    //   WHERE artist_id = $1
    //   GROUP BY DATE_TRUNC('month', created_at)
    //   ORDER BY DATE_TRUNC('month', created_at) DESC
    //   LIMIT 12
    // `, [artistId])
    const merchResult = { rows: [] }
    
    // Get monthly subscription revenue totals (placeholder for now - would come from subscriptions table)
    // const subscriptionsResult = await pool.query(`
    //   SELECT 
    //     DATE_TRUNC('month', created_at) as date,
    //     'Subscriptions' as type,
    //     'Monthly Total' as source,
    //     ROUND(SUM(amount)::numeric, 2) as amount,
    //     'paid' as status
    //   FROM subscription_payments 
    //   WHERE artist_id = $1
    //   GROUP BY DATE_TRUNC('month', created_at)
    //   ORDER BY DATE_TRUNC('month', created_at) DESC
    //   LIMIT 12
    // `, [artistId])
    const subscriptionsResult = { rows: [] }

    // Get withdrawal transactions
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

    // Combine all transactions (monthly totals + withdrawals)
    const allTransactions = [
      ...streamingResult.rows,
      ...tipsResult.rows,
      ...merchResult.rows, 
      ...subscriptionsResult.rows,
      ...withdrawalResult.rows
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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
