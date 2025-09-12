import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { pool, query } from '@/lib/db'

// Helper to fill missing dates for last N days
function getLastNDates(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    const artistId = decoded.userId

    // STREAMS: last N days totals and top tracks
    const dateFloor = `CURRENT_DATE - INTERVAL '${days - 1} days'`

    const streamsDailyRes = await query(
      `SELECT date::date as date, COALESCE(SUM(streams), 0) as streams
       FROM streaming_analytics
       WHERE artist_id = $1 AND date >= ${dateFloor}
       GROUP BY date
       ORDER BY date ASC`,
      [artistId]
    )

    const streamsByDate: Record<string, number> = {}
    for (const row of streamsDailyRes.rows as any[]) {
      streamsByDate[row.date.toISOString().split('T')[0]] = Number(row.streams)
    }
    const lastDates = getLastNDates(days)
    const streamsDaily = lastDates.map(d => ({ date: d, streams: streamsByDate[d] || 0 }))
    const totalStreams = streamsDaily.reduce((sum, d) => sum + d.streams, 0)

    const topTracksRes = await query(
      `SELECT song_title as title, COALESCE(SUM(streams), 0) as streams
       FROM streaming_analytics
       WHERE artist_id = $1 AND date >= ${dateFloor}
       GROUP BY song_title
       ORDER BY streams DESC
       LIMIT 5`,
      [artistId]
    )

    // EARNINGS: summary and sparkline (last 6 months by reporting_month)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const earningsRes = await pool.query(
      `SELECT reporting_month::date as date, COALESCE(SUM(amount_usd), 0) as amount
       FROM streaming_earnings
       WHERE artist_id = $1 AND reporting_month >= $2
       GROUP BY reporting_month
       ORDER BY reporting_month ASC`,
      [artistId, sixMonthsAgo.toISOString().split('T')[0]]
    )

    const earningsSeries = (earningsRes.rows as any[]).map(r => ({
      date: (r.date instanceof Date ? r.date : new Date(r.date)).toISOString().split('T')[0],
      amount: Number(r.amount)
    }))

    const allTimeRes = await pool.query(
      `SELECT COALESCE(SUM(amount_usd), 0) as all_time FROM streaming_earnings WHERE artist_id = $1`,
      [artistId]
    )
    const allTimeEarnings = Number(allTimeRes.rows[0]?.all_time || 0)

    const pendingRes = await pool.query(
      `SELECT COALESCE(SUM(amount_usd), 0) as pending FROM streaming_earnings WHERE artist_id = $1 AND status = 'pending'`,
      [artistId]
    )
    const withdrawnRes = await pool.query(
      `SELECT COALESCE(SUM(amount_requested), 0) as withdrawn FROM withdrawal_requests WHERE artist_id = $1 AND status = 'completed'`,
      [artistId]
    )
    const pendingWithdrawalsRes = await pool.query(
      `SELECT COALESCE(SUM(amount_requested), 0) as pending_withdrawals FROM withdrawal_requests WHERE artist_id = $1 AND status = 'pending'`,
      [artistId]
    )
    const lastPayoutRes = await pool.query(
      `SELECT MAX(updated_at) as last_payout_date FROM withdrawal_requests WHERE artist_id = $1 AND status = 'completed'`,
      [artistId]
    )

    const grossPending = Number(pendingRes.rows[0]?.pending || 0)
    const totalWithdrawn = Number(withdrawnRes.rows[0]?.withdrawn || 0)
    const pendingWithdrawals = Number(pendingWithdrawalsRes.rows[0]?.pending_withdrawals || 0)
    const availableBalance = Math.max(0, grossPending - totalWithdrawn - pendingWithdrawals)
    const lastPayoutDate = lastPayoutRes.rows[0]?.last_payout_date || null

    // MUSIC: counts and recent
    const releasesRes = await pool.query(
      `SELECT COUNT(*)::int as count FROM releases WHERE artist_id = $1`,
      [artistId]
    )
    const tracksRes = await pool.query(
      `SELECT COUNT(t.*)::int as count
       FROM tracks t
       JOIN releases r ON r.id = t.release_id
       WHERE r.artist_id = $1`,
      [artistId]
    )
    const recentRes = await pool.query(
      `SELECT id, release_title, status, created_at
       FROM releases
       WHERE artist_id = $1
       ORDER BY created_at DESC
       LIMIT 3`,
      [artistId]
    )

    return NextResponse.json({
      streams: {
        total: totalStreams,
        daily: streamsDaily,
        topTracks: topTracksRes.rows
      },
      earnings: {
        allTime: allTimeEarnings,
        availableBalance,
        lastPayoutDate,
        series: earningsSeries
      },
      music: {
        releases: releasesRes.rows[0]?.count || 0,
        tracks: tracksRes.rows[0]?.count || 0,
        recent: recentRes.rows
      }
    })
  } catch (error) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard summary' }, { status: 500 })
  }
}


