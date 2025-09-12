import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artist_id')
    const range = searchParams.get('range') || '30days'

    if (!artistId) {
      return NextResponse.json({ error: 'artist_id is required' }, { status: 400 })
    }

    // Calculate date range
    let dateFilter = ''
    const now = new Date()
    let startDate: Date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Default to 30 days

    switch (range) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'alltime':
        dateFilter = '' // No date filter for all time
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    if (range !== 'alltime') {
      dateFilter = `AND reporting_month >= '${startDate.toISOString().split('T')[0]}'`
    }

    // For withdrawal requests, we need a different date filter using created_at
    let withdrawalDateFilter = ''
    if (range !== 'alltime') {
      withdrawalDateFilter = `AND created_at >= '${startDate.toISOString().split('T')[0]}'`
    }

    // Get total earnings from streaming_earnings table
    const totalResult = await pool.query(`
      SELECT COALESCE(SUM(amount_usd), 0) as total_earnings
      FROM streaming_earnings 
      WHERE artist_id = $1 ${dateFilter}
    `, [artistId])

    // Get pending earnings (all earnings are considered pending until withdrawn)
    const pendingResult = await pool.query(`
      SELECT COALESCE(SUM(amount_usd), 0) as pending_earnings
      FROM streaming_earnings 
      WHERE artist_id = $1 ${dateFilter}
    `, [artistId])

    // Get earnings by platform from streaming_earnings table
    const platformResult = await pool.query(`
      SELECT 
        platform,
        ROUND(SUM(amount_usd)::numeric, 2) as amount
      FROM streaming_earnings 
      WHERE artist_id = $1 ${dateFilter}
      GROUP BY platform
      ORDER BY amount DESC
    `, [artistId])

    const withdrawnResult = await pool.query(`
      SELECT COALESCE(SUM(amount_requested), 0) as withdrawn
      FROM withdrawal_requests 
      WHERE artist_id = $1 AND status IN ('completed', 'approved')
    `, [artistId])

    const pendingWithdrawalsResult = await pool.query(`
      SELECT COALESCE(SUM(amount_requested), 0) as pending_withdrawals
      FROM withdrawal_requests 
      WHERE artist_id = $1 AND status = 'pending'
    `, [artistId])

    const lastPayoutResult = await pool.query(`
      SELECT MAX(updated_at) as last_payout_date
      FROM withdrawal_requests 
      WHERE artist_id = $1 AND status IN ('completed', 'approved')
    `, [artistId])

    // Get all-time total earnings (unaffected by time range)
    const allTimeEarningsQuery = `
      SELECT COALESCE(SUM(amount_usd), 0) as all_time_earnings
      FROM streaming_earnings 
      WHERE artist_id = $1
    `
    const allTimeEarningsResult = await pool.query(allTimeEarningsQuery, [artistId])
    
    // Get earnings for the selected time range only
    const periodEarningsQuery = `
      SELECT COALESCE(SUM(amount_usd), 0) as period_earnings
      FROM streaming_earnings 
      WHERE artist_id = $1 ${dateFilter}
    `
    const periodEarningsResult = await pool.query(periodEarningsQuery, [artistId])
    
    // Get withdrawals for the selected time range
    const periodWithdrawnQuery = `
      SELECT COALESCE(SUM(amount_requested), 0) as period_withdrawn
      FROM withdrawal_requests 
      WHERE artist_id = $1 
      AND status IN ('completed', 'approved')
      ${withdrawalDateFilter}
    `
    const periodWithdrawnResult = await pool.query(periodWithdrawnQuery, [artistId])

    const allTimeEarnings = Number(allTimeEarningsResult.rows[0].all_time_earnings)
    const periodEarnings = Number(periodEarningsResult.rows[0].period_earnings)
    const totalWithdrawn = Number(withdrawnResult.rows[0].withdrawn)
    const periodWithdrawn = Number(periodWithdrawnResult.rows[0].period_withdrawn)
    const pendingWithdrawals = Number(pendingWithdrawalsResult.rows[0].pending_withdrawals)
    const lastPayoutDate = lastPayoutResult.rows[0].last_payout_date
    const grossPendingEarnings = Number(pendingResult.rows[0].pending_earnings)
    
    // Available balance = all time earnings - total withdrawn (non-pending) - pending withdrawals
    const availableBalance = allTimeEarnings - totalWithdrawn - pendingWithdrawals

    return NextResponse.json({
      filter_range: range,
      all_time_earnings: allTimeEarnings,
      period_earnings: periodEarnings,
      total_withdrawn: totalWithdrawn,
      period_withdrawn: periodWithdrawn,
      available_balance: Math.max(0, availableBalance), // Ensure never negative
      last_payout_date: lastPayoutDate,
      summary_cards: {
        all_time_earnings: allTimeEarnings,
        period_earnings: periodEarnings,
        total_withdrawn: totalWithdrawn,
        period_withdrawn: periodWithdrawn,
        available_balance: Math.max(0, availableBalance),
        last_payout_date: lastPayoutDate
      },
      earnings_by_platform: platformResult.rows
    })
  } catch (error) {
    console.error('Wallet summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch wallet summary' }, { status: 500 })
  }
}