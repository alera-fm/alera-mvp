import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { triggerWelcomeEmail } from '@/lib/email-automation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find user with verification token and check expiration
    const result = await query(
      'SELECT id, verification_token_expires FROM users WHERE verification_token = $1',
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    const user = result.rows[0]
    
    // Check if token has expired
    if (user.verification_token_expires && new Date() > new Date(user.verification_token_expires)) {
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification email.' },
        { status: 400 }
      )
    }

    const userId = result.rows[0].id

    // Mark user as verified
    await query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1',
      [userId]
    )

    // Trigger welcome email automation
    try {
      await triggerWelcomeEmail(userId)
    } catch (error) {
      console.error('Error triggering welcome email:', error)
      // Don't fail the verification if email fails
    }

    return NextResponse.json({
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
