import { getEmailTemplate, replaceEmailPlaceholders } from './email-templates';
import { pool } from './db';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
}

export interface EmailQueueItem {
  id: string;
  userId: number;
  templateName: string;
  scheduledFor: Date;
  sent: boolean;
  createdAt: Date;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const template = getEmailTemplate(emailData.templateName);
    if (!template) {
      console.error(`Email template not found: ${emailData.templateName}`);
      return false;
    }

    const html = replaceEmailPlaceholders(template.html, emailData.artistName, {
      releaseTitle: emailData.releaseTitle,
      amount: emailData.amount,
      payoutMethod: emailData.payoutMethod,
      lastFour: emailData.lastFour,
      tier: emailData.tier,
      billingCycle: emailData.billingCycle
    });
    
    // Send email using existing SMTP configuration
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@alera.fm',
      to: emailData.to,
      subject: template.subject,
      html: html,
    });

    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
