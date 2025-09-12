import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { artist_id, method, account_info } = await request.json()

    if (!artist_id || !method || !account_info) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert or update payout method
    const result = await pool.query(`
      INSERT INTO payout_methods (artist_id, method, encrypted_account_info, status, created_at, updated_at)
      VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (artist_id) 
      DO UPDATE SET 
        method = EXCLUDED.method,
        encrypted_account_info = EXCLUDED.encrypted_account_info,
        status = 'pending',
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [artist_id, method, account_info])

    return NextResponse.json({ 
      message: 'Payout method saved successfully',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Payout method error:', error)
    return NextResponse.json({ error: 'Failed to save payout method' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artist_id')

    if (!artistId) {
      return NextResponse.json({ error: 'artist_id is required' }, { status: 400 })
    }

    const result = await pool.query(`
      SELECT method, encrypted_account_info as account_info, status, created_at, updated_at
      FROM payout_methods 
      WHERE artist_id = $1
    `, [artistId])

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No payout method found' }, { status: 404 })
    }

    const payoutMethod = result.rows[0]
    
    // Parse and mask the account info for security
    if (payoutMethod.account_info) {
      try {
        const accountData = JSON.parse(payoutMethod.account_info)
        
        // Create masked version based on method type
        switch (accountData.method) {
          case 'PayPal':
            payoutMethod.account_info_masked = accountData.paypal_email?.replace(/(.{2}).*(@.*)/, '$1****$2') || 'Email set'
            break
          case 'Bank Transfer':
            const accountNumber = accountData.account_number || ''
            payoutMethod.account_info_masked = `${accountData.bank_name || 'Bank'} - ****${accountNumber.slice(-4)}`
            break
          case 'Crypto (USDT - TRC20)':
            const walletAddress = accountData.wallet_address || ''
            payoutMethod.account_info_masked = `${walletAddress.slice(0, 6)}****${walletAddress.slice(-4)}`
            break
          default:
            payoutMethod.account_info_masked = 'Account details set'
        }
      } catch (e) {
        // Fallback for old format
        payoutMethod.account_info_masked = payoutMethod.account_info.replace(/(.{4}).*(.{4})/, '$1****$2')
      }
    }

    return NextResponse.json(payoutMethod)
  } catch (error) {
    console.error('Get payout method error:', error)
    return NextResponse.json({ error: 'Failed to fetch payout method' }, { status: 500 })
  }
}
