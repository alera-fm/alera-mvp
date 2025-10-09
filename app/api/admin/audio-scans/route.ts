import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { pool } from '@/lib/db';

/**
 * Get all flagged audio scans for admin review
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const userCheck = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!userCheck.rows[0]?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'pending'; // pending, reviewed, all

    let whereClause = "scan_status = 'flagged'";
    if (filter === 'pending') {
      whereClause += ' AND admin_reviewed = false';
    } else if (filter === 'reviewed') {
      whereClause += ' AND admin_reviewed = true';
    }

    // Get flagged scans
    const scans = await pool.query(
      `SELECT
        asr.*,
        r.release_title,
        r.artist_name as release_artist,
        u.email as artist_email,
        u.artist_name as artist_name
      FROM audio_scan_results asr
      JOIN releases r ON asr.release_id = r.id
      JOIN users u ON asr.artist_id = u.id
      WHERE ${whereClause}
      ORDER BY asr.created_at DESC`,
      []
    );

    return NextResponse.json({
      success: true,
      scans: scans.rows,
      total: scans.rows.length,
    });
  } catch (error: any) {
    console.error('Admin get scans error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get flagged scans' },
      { status: 500 }
    );
  }
}
