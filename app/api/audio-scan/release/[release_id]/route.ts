import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";

/**
 * Update scan results in database
 */
async function updateScanWithResults(
  scanId: number,
  ircamResults: any,
  releaseId: string
) {
  const { results, status } = ircamResults;

  console.log(
    "[DB] ========== PROCESSING IRCAM RESULTS FOR DATABASE =========="
  );
  console.log("[DB] Scan ID:", scanId);
  console.log("[DB] Release ID:", releaseId);

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

  console.log("[DB] ========== EXTRACTED VALUES ==========");
  console.log("[DB] AI Detected:", aiDetected);
  console.log("[DB] AI Confidence:", aiConfidence);
  console.log("[DB] AI Model Version:", aiModelVersion);
  console.log("[DB] Scan Passed:", scanPassed);
  console.log("[DB] Scan Status:", scanStatus);
  console.log("[DB] Flagged Reason:", flaggedReason);
  console.log("[DB] =========================================");

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

  console.log("[DB] ✅ Database updated successfully for scan ID:", scanId);

  // Update release status
  const releaseScanUpdate = await pool.query(
    `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE scan_status = 'processing' OR scan_status = 'pending') as processing,
      COUNT(*) FILTER (WHERE scan_passed = true) as passed,
      COUNT(*) FILTER (WHERE scan_status = 'flagged') as flagged
     FROM audio_scan_results
     WHERE release_id = $1`,
    [releaseId]
  );

  const stats = releaseScanUpdate.rows[0];
  let releaseStatus = "scan_passed";

  if (parseInt(stats.processing) > 0) {
    releaseStatus = "scanning";
  } else if (parseInt(stats.flagged) > 0) {
    releaseStatus = "scan_flagged";
  } else if (parseInt(stats.passed) === parseInt(stats.total)) {
    releaseStatus = "scan_passed";
  } else {
    releaseStatus = "scan_failed";
  }

  await pool.query(`UPDATE releases SET audio_scan_status = $1 WHERE id = $2`, [
    releaseStatus,
    releaseId,
  ]);

  console.log("[DB] ✅ Release status updated to:", releaseStatus);
}

/**
 * Get all scan results for a release
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ release_id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { release_id } = await params;

    // Verify user owns this release
    const releaseCheck = await pool.query(
      "SELECT id, audio_scan_status FROM releases WHERE id = $1 AND artist_id = $2",
      [release_id, decoded.userId]
    );

    if (releaseCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Release not found or unauthorized" },
        { status: 404 }
      );
    }

    const release = releaseCheck.rows[0];

    // Get all scan results for this release
    // Note: Background processor checks IRCAM every 5 minutes and updates database
    const scans = await pool.query(
      `SELECT
        id,
        track_id,
        ircam_job_id,
        scan_status,
        track_title,
        track_artist,
        ai_generated_detected,
        ai_confidence,
        ai_model_version,
        scan_passed,
        flagged_reason,
        admin_reviewed,
        admin_decision,
        admin_notes,
        error_message,
        created_at,
        updated_at
      FROM audio_scan_results
      WHERE release_id = $1
      ORDER BY created_at DESC`,
      [release_id]
    );

    return NextResponse.json({
      success: true,
      release_id: release.id,
      release_scan_status: release.audio_scan_status,
      scans: scans.rows,
      total_scans: scans.rows.length,
      flagged_scans: scans.rows.filter((s) => s.scan_status === "flagged")
        .length,
      processing_scans: scans.rows.filter(
        (s) => s.scan_status === "processing" || s.scan_status === "pending"
      ).length,
    });
  } catch (error: any) {
    console.error("Get release scans error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get release scan results" },
      { status: 500 }
    );
  }
}
