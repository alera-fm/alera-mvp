import { getEmailTemplate, replaceEmailPlaceholders } from './email-templates';
import { pool } from './db';
import nodemailer from 'nodemailer';

// Enhanced SMTP configuration with better error handling
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Add connection timeout and retry settings
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    // Enable debug for troubleshooting
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  };

  // Log SMTP configuration in development only
  if (process.env.NODE_ENV === 'development') {
    console.log('SMTP Configuration:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      hasPassword: !!config.auth.pass
    });
  }

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Email delivery logging function
async function logEmailDelivery(
  to: string, 
  templateName: string, 
  messageId: string | null, 
  status: 'sent' | 'failed', 
  errorMessage?: string
): Promise<void> {
  try {
    await pool.query(`
      INSERT INTO email_delivery_logs (to_email, template_name, message_id, status, error_message, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [to, templateName, messageId, status, errorMessage || null, new Date()]);
  } catch (error) {
    console.error('Failed to log email delivery:', error);
  }
}

export interface EmailData {
  to: string;
  templateName: string;
  artistName: string;
  releaseTitle?: string;
  amount?: string;
  payoutMethod?: string;
  lastFour?: string;
  tier?: string;
  billingCycle?: string;
  verificationUrl?: string;
}

export interface EmailQueueItem {
  id: string;
  userId: number;
  templateName: string;
  scheduledFor: Date;
  sent: boolean;
  createdAt: Date;
}

export async function sendEmail(emailData: EmailData, retryCount = 0): Promise<boolean> {
  const maxRetries = 3;
  
  try {
    // Verify SMTP connection
    await transporter.verify();

    const template = getEmailTemplate(emailData.templateName);
    if (!template) {
      console.error(`Email template not found: ${emailData.templateName}`);
      return false;
    }

    const placeholderData = {
      releaseTitle: emailData.releaseTitle,
      amount: emailData.amount,
      payoutMethod: emailData.payoutMethod,
      lastFour: emailData.lastFour,
      tier: emailData.tier,
      billingCycle: emailData.billingCycle,
      verificationUrl: emailData.verificationUrl
    };

    const html = replaceEmailPlaceholders(template.html, emailData.artistName, placeholderData);
    const subject = replaceEmailPlaceholders(template.subject, emailData.artistName, placeholderData);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'ALERA <noreply@alera.fm>',
      to: emailData.to,
      subject: subject,
      html: html,
      // Add headers for better deliverability
      headers: {
        'X-Mailer': 'ALERA Email System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
      },
      // Add message ID for tracking
      messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@alera.fm>`,
    };

    const result = await transporter.sendMail(mailOptions);
    
    // Log successful delivery
    await logEmailDelivery(emailData.to, emailData.templateName, result.messageId, 'sent');
    
    return true;
  } catch (error) {
    console.error(`Error sending email (attempt ${retryCount + 1}):`, error);
    
    // Log failed delivery
    await logEmailDelivery(emailData.to, emailData.templateName, null, 'failed', error instanceof Error ? error.message : String(error));
    
    // Retry logic
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
      return sendEmail(emailData, retryCount + 1);
    }
    
    return false;
  }
}

export async function scheduleEmail(
  userId: number, 
  templateName: string, 
  scheduledFor: Date
): Promise<string> {
  const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    await pool.query(
      `INSERT INTO email_queue (id, user_id, template_name, scheduled_for, sent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [emailId, userId, templateName, scheduledFor, false, new Date()]
    );
    
    console.log(`Email scheduled: ${templateName} for user ${userId} at ${scheduledFor}`);
    return emailId;
  } catch (error) {
    console.error('Error scheduling email:', error);
    throw error;
  }
}

export async function getScheduledEmails(): Promise<EmailQueueItem[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM email_queue WHERE sent = false ORDER BY scheduled_for ASC'
    );
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      templateName: row.template_name,
      scheduledFor: new Date(row.scheduled_for),
      sent: row.sent,
      createdAt: new Date(row.created_at)
    }));
  } catch (error) {
    console.error('Error getting scheduled emails:', error);
    return [];
  }
}

export async function markEmailAsSent(emailId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'UPDATE email_queue SET sent = true WHERE id = $1',
      [emailId]
    );
    
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error marking email as sent:', error);
    return false;
  }
}

export async function getEmailsForUser(userId: number): Promise<EmailQueueItem[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM email_queue WHERE user_id = $1 AND sent = false ORDER BY scheduled_for ASC',
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      templateName: row.template_name,
      scheduledFor: new Date(row.scheduled_for),
      sent: row.sent,
      createdAt: new Date(row.created_at)
    }));
  } catch (error) {
    console.error('Error getting emails for user:', error);
    return [];
  }
}

export async function cancelScheduledEmail(emailId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM email_queue WHERE id = $1',
      [emailId]
    );
    
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error canceling scheduled email:', error);
    return false;
  }
}
