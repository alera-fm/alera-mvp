import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log('[Password Reset] Request received', { token: token?.substring(0, 10) + '...', passwordLength: password?.length })

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Find user with valid reset token
    const result = await query(
      'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    )

    console.log('[Password Reset] Token lookup result', { found: result.rows.length > 0 })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const user = result.rows[0]
    console.log('[Password Reset] Found user', { userId: user.id, email: user.email })

    // Hash new password
    const passwordHash = await hashPassword(password)
    console.log('[Password Reset] Password hashed successfully')

    // Update password and clear reset token
    const updateResult = await query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2 RETURNING id',
      [passwordHash, user.id]
    )

    console.log('[Password Reset] Update result', { updated: updateResult.rows.length > 0 })

    return NextResponse.json({
      message: 'Password reset successful'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
