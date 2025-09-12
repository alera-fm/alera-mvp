
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const artistId = decoded.userId

    // Total fans
    const totalFansResult = await pool.query(
      'SELECT COUNT(*) as total FROM fans WHERE artist_id = $1',
      [artistId]
    )
    const totalFans = parseInt(totalFansResult.rows[0].total)

    // Free vs Paid ratio
    const subscriptionStatsResult = await pool.query(`
      SELECT subscribed_status, COUNT(*) as count
      FROM fans 
      WHERE artist_id = $1 
      GROUP BY subscribed_status
    `, [artistId])

    const subscriptionStats = subscriptionStatsResult.rows.reduce((acc, row) => {
      acc[row.subscribed_status] = parseInt(row.count)
      return acc
    }, { free: 0, paid: 0 })

    // Top 5 countries
    const topCountriesResult = await pool.query(`
      SELECT country, COUNT(*) as count
      FROM fans 
      WHERE artist_id = $1 AND country IS NOT NULL 
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 5
    `, [artistId])

    // Gender breakdown
    const genderBreakdownResult = await pool.query(`
      SELECT gender, COUNT(*) as count
      FROM fans 
      WHERE artist_id = $1 AND gender IS NOT NULL 
      GROUP BY gender
    `, [artistId])

    // Age breakdown (by decade)
    const ageBreakdownResult = await pool.query(`
      SELECT 
        CASE 
          WHEN age BETWEEN 18 AND 29 THEN '18-29'
          WHEN age BETWEEN 30 AND 39 THEN '30-39'
          WHEN age BETWEEN 40 AND 49 THEN '40-49'
          WHEN age BETWEEN 50 AND 59 THEN '50-59'
          WHEN age >= 60 THEN '60+'
          ELSE 'Unknown'
        END as age_group,
        COUNT(*) as count
      FROM fans 
      WHERE artist_id = $1 
      GROUP BY age_group
      ORDER BY age_group
    `, [artistId])

    // Growth over time (monthly for last 12 months)
    const growthResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_fans
      FROM fans 
      WHERE artist_id = $1 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `, [artistId])

    // Source breakdown
    const sourceBreakdownResult = await pool.query(`
      SELECT source, COUNT(*) as count
      FROM fans 
      WHERE artist_id = $1 
      GROUP BY source
    `, [artistId])

    return NextResponse.json({
      totalFans,
      subscriptionStats,
      topCountries: topCountriesResult.rows,
      genderBreakdown: genderBreakdownResult.rows,
      ageBreakdown: ageBreakdownResult.rows,
      growthOverTime: growthResult.rows,
      sourceBreakdown: sourceBreakdownResult.rows
    })
  } catch (error) {
    console.error('Get fan insights error:', error)
    return NextResponse.json({ error: 'Failed to fetch fan insights' }, { status: 500 })
  }
}
