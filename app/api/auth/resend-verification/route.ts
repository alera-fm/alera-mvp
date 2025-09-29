import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generateRandomToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists and is not already verified
    const result = await query(
      'SELECT id, is_verified FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = result.rows[0]

    if (user.is_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new verification token with expiration
    const verificationToken = generateRandomToken()
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Update verification token and expiration
    await query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE email = $3',
      [verificationToken, tokenExpires, email]
    )

    // Send verification email
    await sendVerificationEmail(email, verificationToken, user.artist_name || email.split('@')[0])

    return NextResponse.json({
      message: 'Verification email sent'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
