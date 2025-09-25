import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendVerificationEmail = async (email: string, token: string, artistName?: string) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`

    console.log('Sending verification email to:', email)
    console.log('Verification URL:', verificationUrl)

    // Import the email service to use the new template
    const { sendEmail } = await import('./email-service')
    const { getEmailTemplate } = await import('./email-templates')

    const template = getEmailTemplate('emailVerification')
    if (!template) {
      throw new Error('Email verification template not found')
    }

    const success = await sendEmail({
      to: email,
      templateName: 'emailVerification',
      artistName: artistName || 'Artist',
      verificationUrl: verificationUrl
    })

    if (success) {
      console.log('Verification email sent successfully')
    } else {
      throw new Error('Failed to send verification email')
    }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new Error('Failed to send verification email')
  }
}

export const sendEmailVerification = async (email: string, token: string, artistName: string) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const verificationUrl = `${appUrl}/auth/verify-email-change?token=${token}`

    console.log('Sending email change verification to:', email)
    console.log('Email verification URL:', verificationUrl)

    const mailOptions = {
      from: process.env.SMTP_FROM || 'ALERA <noreply@alera.fm>',
      to: email,
      subject: 'Verify Your New Email Address - ALERA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your New Email Address</h2>
          <p>Hi ${artistName},</p>
          <p>You've requested to change your email address on ALERA. To complete this change, please click the button below to verify your new email address:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #BFFF00; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 24 hours</li>
            <li>Only click this link if you requested this email change</li>
            <li>Your email address will not be changed until you verify it</li>
          </ul>
          
          <p>If you didn't request this email change, please ignore this email and contact our support team.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent by ALERA. If you have any questions, contact us at support@alera.fm
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Email verification sent successfully to:', email)
  } catch (error) {
    console.error('Failed to send email verification:', error)
    throw error
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`

    console.log('Sending password reset email to:', email)

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your ALERA password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    console.log('Password reset email sent successfully:', result.messageId)
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}
