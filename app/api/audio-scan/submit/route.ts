import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { pool } from '@/lib/db';
import { ircamService } from '@/lib/ircam-amplify';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { release_id, track_id, audio_url, track_title, track_artist, track_isrc } =
      await request.json();

    if (!release_id || !audio_url) {
      return NextResponse.json(
        { error: 'release_id and audio_url are required' },
        { status: 400 }
      );
    }

    // Verify user owns this release
    const releaseCheck = await pool.query(
      'SELECT id FROM releases WHERE id = $1 AND artist_id = $2',
      [release_id, decoded.userId]
    );

    if (releaseCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Release not found or unauthorized' },
        { status: 404 }
      );
    }

    // Submit to IRCAM for analysis
    const ircamJobId = await ircamService.submitAudioAnalysis(audio_url, {
      title: track_title,
      artist: track_artist,
      isrc: track_isrc,
    });

    // Store initial scan record in database
    const result = await pool.query(
      `INSERT INTO audio_scan_results (
        release_id,
        track_id,
        artist_id,
        ircam_job_id,
        scan_status,
        audio_url,
        track_title,
        track_artist,
        track_isrc
      ) VALUES ($1, $2, $3, $4, 'processing', $5, $6, $7, $8)
      RETURNING id, ircam_job_id, scan_status`,
      [
        release_id,
        track_id,
        decoded.userId,
        ircamJobId,
        audio_url,
        track_title,
        track_artist,
        track_isrc,
      ]
    );

    // Update release status to scanning
    await pool.query(
      `UPDATE releases SET audio_scan_status = 'scanning' WHERE id = $1`,
      [release_id]
    );

    return NextResponse.json({
      success: true,
      scan_id: result.rows[0].id,
      ircam_job_id: result.rows[0].ircam_job_id,
      status: result.rows[0].scan_status,
      message: 'Audio scan submitted successfully',
    });
  } catch (error: any) {
    console.error('Audio scan submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit audio for scanning' },
      { status: 500 }
    );
  }
}
