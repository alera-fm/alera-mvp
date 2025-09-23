import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sendEmail, scheduleEmail } from '@/lib/email-service';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { templateName, userId, scheduledFor } = await request.json();

    if (!templateName || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user details
    const userResult = await pool.query(
      'SELECT id, email, artist_name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || 'Artist';

    if (scheduledFor) {
      // Schedule email for later
      const scheduledDate = new Date(scheduledFor);
      const emailId = scheduleEmail(userId, templateName, scheduledDate);
      
      return NextResponse.json({ 
        success: true, 
        emailId,
        scheduledFor: scheduledDate.toISOString()
      });
    } else {
      // Send email immediately
      const success = await sendEmail({
        to: user.email,
        templateName,
        artistName
      });

      if (success) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error in email send API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
