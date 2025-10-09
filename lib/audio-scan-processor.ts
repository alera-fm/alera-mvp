/**
 * Audio Scan Background Processor
 * Automatically checks IRCAM for processing scans every 5 minutes
 * Similar to how activity updates work
 */

import { pool } from "./db";
import { ircamService } from "./ircam-amplify";

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Process all scans that are in 'processing' or 'pending' status
 */
async function processAudioScans() {
  try {
    console.log("[Audio Scan Processor] Checking for processing scans...");

    // Get all processing scans
    const result = await pool.query(
      `SELECT id, release_id, ircam_job_id, track_title, track_artist, created_at
       FROM audio_scan_results
       WHERE scan_status IN ('processing', 'pending')
       ORDER BY created_at ASC`
    );

    const processingScans = result.rows;

    if (processingScans.length === 0) {
      console.log("[Audio Scan Processor] No processing scans found");
      return;
    }

    console.log(
      `[Audio Scan Processor] Found ${processingScans.length} processing scans, checking IRCAM...`
    );

    // Check each scan with IRCAM
    for (const scan of processingScans) {
      try {
        console.log(
          `[Audio Scan Processor] Checking IRCAM for job ${scan.ircam_job_id} (${scan.track_title})`
        );

        const ircamResults = await ircamService.getAnalysisResults(
          scan.ircam_job_id
        );

        // Only update if scan is complete or failed
        if (
          ircamResults.status === "completed" ||
          ircamResults.status === "failed"
        ) {
          console.log(
            `[Audio Scan Processor] Scan ${scan.id} is ${ircamResults.status}, updating database...`
          );
          await updateScanResults(scan.id, ircamResults, scan.release_id);
        } else {
          console.log(
            `[Audio Scan Processor] Scan ${scan.id} still ${ircamResults.status}, will check again in 5 minutes`
          );
        }
      } catch (error) {
        console.error(
          `[Audio Scan Processor] Error checking scan ${scan.id}:`,
          error
        );

        // If job fails for too long (> 1 hour), mark as failed
        const scanAge = Date.now() - new Date(scan.created_at).getTime();
        if (scanAge > 60 * 60 * 1000) {
          // 1 hour
          console.log(
            `[Audio Scan Processor] Scan ${scan.id} timeout, marking as failed`
          );
          await markScanAsFailed(
            scan.id,
            "Scan timeout - no response from IRCAM after 1 hour"
          );
        }
      }
    }

    console.log("[Audio Scan Processor] ✅ Processing complete");
  } catch (error) {
    console.error(
      "[Audio Scan Processor] Error in audio scan processor:",
      error
    );
  }
}

/**
 * Update scan results in database
 */
async function updateScanResults(
  scanId: number,
  ircamResults: any,
  releaseId: string
) {
  const { results, status } = ircamResults;

  console.log("[Audio Scan Processor] ========== UPDATING SCAN ==========");
  console.log("[Audio Scan Processor] Scan ID:", scanId);
  console.log("[Audio Scan Processor] Release ID:", releaseId);

  // Determine if AI was detected
  const aiDetected = results?.ai_generated?.detected || false;
  const aiConfidence = results?.ai_generated?.confidence || 0;
  const aiModelVersion =
    results?.ai_generated?.ai_model_signatures?.[0] || null;

  // Scan passes if no AI detected and completed successfully
  const scanPassed = !aiDetected && status === "completed";

  // Determine scan status
  let scanStatus = "completed";
  let flaggedReason = null;

  if (aiDetected) {
    scanStatus = "flagged";
    flaggedReason = `AI-generated music detected (${aiConfidence}% confidence)`;
  } else if (status === "failed") {
    scanStatus = "failed";
    flaggedReason = ircamResults.error || "Analysis failed";
  }

  console.log("[Audio Scan Processor] AI Detected:", aiDetected);
  console.log("[Audio Scan Processor] AI Confidence:", aiConfidence);
  console.log("[Audio Scan Processor] Scan Passed:", scanPassed);
  console.log("[Audio Scan Processor] Scan Status:", scanStatus);

  // Update scan record
  await pool.query(
    `UPDATE audio_scan_results SET
      scan_status = $1,
      ai_generated_detected = $2,
      ai_confidence = $3,
      ai_model_version = $4,
      scan_passed = $5,
      flagged_reason = $6,
      raw_response = $7,
      error_message = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9`,
    [
      scanStatus,
      aiDetected,
      aiConfidence,
      aiModelVersion,
      scanPassed,
      flaggedReason,
      JSON.stringify(ircamResults),
      status === "failed" ? ircamResults.error : null,
      scanId,
    ]
  );

  console.log("[Audio Scan Processor] ✅ Database updated for scan:", scanId);

  // Update release status
  await updateReleaseStatus(releaseId);
}

/**
 * Update overall release scan status based on all track scans
 */
async function updateReleaseStatus(releaseId: string) {
  const stats = await pool.query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE scan_status IN ('processing', 'pending')) as processing,
      COUNT(*) FILTER (WHERE scan_passed = true) as passed,
      COUNT(*) FILTER (WHERE scan_status = 'flagged') as flagged
     FROM audio_scan_results
     WHERE release_id = $1`,
    [releaseId]
  );

  const counts = stats.rows[0];
  let releaseStatus = "scan_passed";

  if (parseInt(counts.processing) > 0) {
    releaseStatus = "scanning";
  } else if (parseInt(counts.flagged) > 0) {
    releaseStatus = "scan_flagged";
  } else if (parseInt(counts.passed) === parseInt(counts.total)) {
    releaseStatus = "scan_passed";
  } else {
    releaseStatus = "scan_failed";
  }

  await pool.query(`UPDATE releases SET audio_scan_status = $1 WHERE id = $2`, [
    releaseStatus,
    releaseId,
  ]);

  console.log(
    "[Audio Scan Processor] ✅ Release status updated to:",
    releaseStatus
  );
}

/**
 * Mark scan as failed (timeout or error)
 */
async function markScanAsFailed(scanId: number, reason: string) {
  await pool.query(
    `UPDATE audio_scan_results SET
      scan_status = 'failed',
      scan_passed = false,
      flagged_reason = $1,
      error_message = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2`,
    [reason, scanId]
  );
}

/**
 * Start the audio scan processor
 * Runs every 5 minutes to check IRCAM for scan updates
 */
export function startAudioScanProcessor() {
  console.log("🎵 Starting Audio Scan Processor (checks every 5 minutes)...");

  // Run immediately on startup
  processAudioScans().catch((error) => {
    console.error("[Audio Scan Processor] Initial run error:", error);
  });

  // Then run every 5 minutes
  setInterval(() => {
    processAudioScans().catch((error) => {
      console.error("[Audio Scan Processor] Scheduled run error:", error);
    });
  }, POLL_INTERVAL);

  console.log("✅ Audio Scan Processor started");
}
