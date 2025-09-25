import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const tokenData = verifyToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Mark the welcome dialog as shown for this user
    const result = await query(
      'UPDATE users SET welcome_pricing_dialog_shown = TRUE WHERE id = $1',
      [tokenData.userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking welcome dialog as shown:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
