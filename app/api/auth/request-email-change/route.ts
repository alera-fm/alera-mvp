import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { sendEmailVerification } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { new_email } = await request.json()

    if (!new_email) {
      return NextResponse.json({ error: 'New email is required' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if email is already taken by another user
    const emailCheckResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [new_email, decoded.userId]
    )
    if (emailCheckResult.rows.length > 0) {
      return NextResponse.json({ error: 'Email address is already taken' }, { status: 400 })
    }

    // Get current user info
    const userResult = await pool.query(
      'SELECT email, artist_name FROM users WHERE id = $1',
      [decoded.userId]
    )
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentUser = userResult.rows[0]

    // Check if user is trying to change to the same email
    if (currentUser.email === new_email) {
      return NextResponse.json({ error: 'New email is the same as current email' }, { status: 400 })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Delete any existing pending email changes for this user
    await pool.query(
      'DELETE FROM email_verifications WHERE user_id = $1 AND verified = FALSE',
      [decoded.userId]
    )

    // Create new email verification record
    await pool.query(`
      INSERT INTO email_verifications (user_id, new_email, verification_token, expires_at)
      VALUES ($1, $2, $3, $4)
    `, [decoded.userId, new_email, verificationToken, expiresAt])

    // Send verification email (skip for localhost development)
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')
    
    if (isDevelopment) {
      // Development mode: Skip email sending and provide verification URL
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email-change?token=${verificationToken}`
      
      console.log('🔗 Email Verification URL (Development Mode):')
      console.log(verificationUrl)
      
      return NextResponse.json({
        message: 'Development mode: Email sending skipped. Check console for verification URL.',
        verification_sent: true,
        development_mode: true,
        verification_url: verificationUrl
      })
    } else {
      // Production mode: Send actual email
      try {
        await sendEmailVerification(new_email, verificationToken, currentUser.artist_name || 'User')
        
        return NextResponse.json({
          message: 'Verification email sent successfully. Please check your new email address to confirm the change.',
          verification_sent: true
        })
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        
        // Clean up the verification record if email sending fails
        await pool.query(
          'DELETE FROM email_verifications WHERE verification_token = $1',
          [verificationToken]
        )
        
        return NextResponse.json({ 
          error: 'Failed to send verification email. Please try again.' 
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('Request email change error:', error)
    return NextResponse.json({ 
      error: 'Failed to process email change request' 
    }, { status: 500 })
  }
}
