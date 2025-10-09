/**
 * Audio Scan Utility Functions
 * Helper functions to integrate audio scanning into the release submission flow
 */

import { pool } from './db';

export interface TrackForScanning {
  track_id?: number;
  audio_url: string;
  track_title?: string;
  track_artist?: string;
  track_isrc?: string;
}

/**
 * Submit a track for audio scanning
 */
export async function submitTrackForScanning(
  releaseId: number,
  track: TrackForScanning,
  authToken: string
): Promise<{ success: boolean; scan_id?: number; error?: string }> {
  try {
    const response = await fetch('/api/audio-scan/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        release_id: releaseId,
        track_id: track.track_id,
        audio_url: track.audio_url,
        track_title: track.track_title,
        track_artist: track.track_artist,
        track_isrc: track.track_isrc,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to submit for scanning' };
    }

    return { success: true, scan_id: data.scan_id };
  } catch (error: any) {
    console.error('Track scanning error:', error);
    return { success: false, error: error.message || 'Failed to submit for scanning' };
  }
}

/**
 * Check if a release has passed all audio scans
 */
export async function checkReleaseScanStatus(
  releaseId: number
): Promise<{
  allScanned: boolean;
  allPassed: boolean;
  hasFlags: boolean;
  scanStatus: string;
}> {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_scans,
        COUNT(*) FILTER (WHERE scan_status IN ('completed', 'flagged', 'failed')) as completed_scans,
        COUNT(*) FILTER (WHERE scan_passed = true) as passed_scans,
        COUNT(*) FILTER (WHERE scan_status = 'flagged') as flagged_scans
      FROM audio_scan_results
      WHERE release_id = $1`,
      [releaseId]
    );

    const stats = result.rows[0];
    const totalScans = parseInt(stats.total_scans || '0');
    const completedScans = parseInt(stats.completed_scans || '0');
    const passedScans = parseInt(stats.passed_scans || '0');
    const flaggedScans = parseInt(stats.flagged_scans || '0');

    const allScanned = totalScans > 0 && totalScans === completedScans;
    const allPassed = totalScans > 0 && totalScans === passedScans;
    const hasFlags = flaggedScans > 0;

    let scanStatus = 'not_scanned';
    if (totalScans === 0) {
      scanStatus = 'not_scanned';
    } else if (!allScanned) {
      scanStatus = 'scanning';
    } else if (hasFlags) {
      scanStatus = 'scan_flagged';
    } else if (allPassed) {
      scanStatus = 'scan_passed';
    } else {
      scanStatus = 'scan_failed';
    }

    return {
      allScanned,
      allPassed,
      hasFlags,
      scanStatus,
    };
  } catch (error) {
    console.error('Error checking scan status:', error);
    return {
      allScanned: false,
      allPassed: false,
      hasFlags: false,
      scanStatus: 'not_scanned',
    };
  }
}

/**
 * Check if a release can be submitted based on scan results
 */
export async function canSubmitRelease(releaseId: number): Promise<{
  canSubmit: boolean;
  reason?: string;
}> {
  const scanStatus = await checkReleaseScanStatus(releaseId);

  // Can't submit if scans are still in progress
  if (!scanStatus.allScanned) {
    return {
      canSubmit: false,
      reason: 'Audio scanning is still in progress. Please wait for all scans to complete.',
    };
  }

  // Can't submit if there are flags and no admin approval
  if (scanStatus.hasFlags) {
    const adminCheck = await pool.query(
      `SELECT COUNT(*) as approved_count
       FROM audio_scan_results
       WHERE release_id = $1
       AND scan_status = 'flagged'
       AND admin_reviewed = true
       AND admin_decision = 'approved'`,
      [releaseId]
    );

    const flaggedCount = await pool.query(
      `SELECT COUNT(*) as count
       FROM audio_scan_results
       WHERE release_id = $1 AND scan_status = 'flagged'`,
      [releaseId]
    );

    const approvedCount = parseInt(adminCheck.rows[0].approved_count || '0');
    const totalFlagged = parseInt(flaggedCount.rows[0].count || '0');

    if (approvedCount < totalFlagged) {
      return {
        canSubmit: false,
        reason:
          'This release has been flagged for copyright or AI-generated content. An admin will review it within 24-48 hours.',
      };
    }
  }

  // Can't submit if scans failed
  if (!scanStatus.allPassed && !scanStatus.hasFlags) {
    return {
      canSubmit: false,
      reason: 'Some audio scans failed. Please re-upload the affected tracks.',
    };
  }

  return { canSubmit: true };
}

/**
 * Trigger automatic scanning for all tracks in a release
 */
export async function scanAllReleaseTracks(
  releaseId: number,
  authToken: string
): Promise<{ success: boolean; scanned: number; errors: string[] }> {
  try {
    // Get all tracks for the release
    const tracksResult = await pool.query(
      `SELECT
        id as track_id,
        audio_file_url as audio_url,
        track_title,
        artist_name as track_artist,
        isrc as track_isrc
      FROM tracks
      WHERE release_id = $1 AND audio_file_url IS NOT NULL`,
      [releaseId]
    );

    const tracks = tracksResult.rows;
    const errors: string[] = [];
    let scanned = 0;

    for (const track of tracks) {
      // Check if already scanned
      const existingScan = await pool.query(
        `SELECT id FROM audio_scan_results
         WHERE release_id = $1 AND track_id = $2`,
        [releaseId, track.track_id]
      );

      if (existingScan.rows.length > 0) {
        continue; // Skip if already scanned
      }

      const result = await submitTrackForScanning(releaseId, track, authToken);

      if (result.success) {
        scanned++;
      } else {
        errors.push(
          `Failed to scan ${track.track_title || `Track ${track.track_id}`}: ${result.error}`
        );
      }
    }

    return {
      success: errors.length === 0,
      scanned,
      errors,
    };
  } catch (error: any) {
    console.error('Error scanning release tracks:', error);
    return {
      success: false,
      scanned: 0,
      errors: [error.message || 'Failed to scan tracks'],
    };
  }
}
