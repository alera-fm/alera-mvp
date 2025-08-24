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

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`

    console.log('Sending verification email to:', email)
    console.log('Verification URL:', verificationUrl)

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your ALERA account',
      html: `
        <h1>Welcome to ALERA!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    })

    console.log('Email sent successfully:', result.messageId)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new Error('Failed to send verification email')
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
