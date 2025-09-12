import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    // Find the verification record
    const verificationResult = await pool.query(`
      SELECT ev.*, u.email as current_email, u.artist_name
      FROM email_verifications ev
      JOIN users u ON ev.user_id = u.id
      WHERE ev.verification_token = $1 AND ev.verified = FALSE
    `, [token])

    if (verificationResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification token' 
      }, { status: 400 })
    }

    const verification = verificationResult.rows[0]

    // Check if token is expired
    if (new Date() > new Date(verification.expires_at)) {
      return NextResponse.json({ 
        error: 'Verification token has expired. Please request a new email change.' 
      }, { status: 400 })
    }

    // Check if new email is still available (in case someone else took it)
    const emailCheckResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [verification.new_email, verification.user_id]
    )
    if (emailCheckResult.rows.length > 0) {
      return NextResponse.json({ 
        error: 'Email address is no longer available. Please try a different email.' 
      }, { status: 400 })
    }

    // Use transaction to update email and mark verification as complete
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Update user's email
      const updateResult = await client.query(`
        UPDATE users 
        SET email = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email, artist_name
      `, [verification.new_email, verification.user_id])

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Mark verification as complete
      await client.query(`
        UPDATE email_verifications 
        SET verified = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE verification_token = $1
      `, [token])

      await client.query('COMMIT')

      return NextResponse.json({
        message: 'Email address updated successfully!',
        user: updateResult.rows[0],
        success: true
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Verify email change error:', error)
    return NextResponse.json({ 
      error: 'Failed to verify email change' 
    }, { status: 500 })
  }
}
