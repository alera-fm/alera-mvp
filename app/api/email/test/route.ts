import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, artistName } = await request.json();

    if (!email || !artistName) {
      return NextResponse.json({ error: 'Email and artistName are required' }, { status: 400 });
    }

    // Test sending welcome email
    const success = await sendEmail({
      to: email,
      templateName: 'welcome',
      artistName: artistName
    });

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send test email' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
