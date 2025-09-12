import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generateRandomToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log('[Password Reset Request] Email:', email)

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    console.log('[Password Reset Request] User found:', result.rows.length > 0)

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: 'If an account with that email exists, we\'ve sent a password reset link.'
      })
    }

    // Generate reset token with 1 hour expiry
    const resetToken = generateRandomToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    console.log('[Password Reset Request] Generated token:', resetToken.substring(0, 10) + '...')

    // Store reset token
    const tokenResult = await query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING id',
      [resetToken, expiresAt, email]
    )

    console.log('[Password Reset Request] Token stored:', tokenResult.rows.length > 0)

    // Send reset email (skip for localhost development)
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')
    
    if (isDevelopment) {
      // Development mode: Skip email sending and log reset URL
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
      
      console.log('🔗 Password Reset URL (Development Mode):')
      console.log(resetUrl)
      console.log('[Password Reset Request] Email sending skipped in development mode')
    } else {
      // Production mode: Send actual email
      try {
        await sendPasswordResetEmail(email, resetToken)
        console.log('[Password Reset Request] Email sent successfully')
      } catch (emailError) {
        console.error('[Password Reset Request] Email send failed:', emailError)
        // Continue anyway for security (don't reveal email sending issues)
      }
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we\'ve sent a password reset link.'
    })

  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
