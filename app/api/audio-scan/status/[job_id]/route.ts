import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";
import { ircamService } from "@/lib/ircam-amplify";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
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

    const { job_id } = await params;

    // Get scan record from database
    const scanRecord = await pool.query(
      `SELECT * FROM audio_scan_results
       WHERE ircam_job_id = $1 AND artist_id = $2`,
      [job_id, decoded.userId]
    );

    if (scanRecord.rows.length === 0) {
      return NextResponse.json(
        { error: "Scan not found or unauthorized" },
        { status: 404 }
      );
    }

    const record = scanRecord.rows[0];

    // If scan is still processing, check IRCAM for updates
    if (
      record.scan_status === "processing" ||
      record.scan_status === "pending"
    ) {
      try {
        const ircamResults = await ircamService.getAnalysisResults(job_id);

        // Update database if scan is complete
        if (
          ircamResults.status === "completed" ||
          ircamResults.status === "failed"
        ) {
          await updateScanResults(record.id, ircamResults, record.release_id);

          // Refresh record
          const updatedRecord = await pool.query(
            "SELECT * FROM audio_scan_results WHERE id = $1",
            [record.id]
          );
          return NextResponse.json({
            success: true,
            scan: formatScanResponse(updatedRecord.rows[0]),
          });
        }
      } catch (error) {
        console.error("Error fetching IRCAM results:", error);
        // Continue with database record if IRCAM API fails
      }
    }

    return NextResponse.json({
      success: true,
      scan: formatScanResponse(record),
    });
  } catch (error: any) {
    console.error("Audio scan status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get scan status" },
      { status: 500 }
    );
  }
}

async function updateScanResults(
  scanId: number,
  ircamResults: any,
  releaseId: number
) {
  const { results, status } = ircamResults;

  console.log(
    "[DB] ========== PROCESSING IRCAM RESULTS FOR DATABASE =========="
  );
  console.log("[DB] Scan ID:", scanId);
  console.log("[DB] Release ID:", releaseId);
  console.log(
    "[DB] IRCAM Results Object:",
    JSON.stringify(ircamResults, null, 2)
  );

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
  console.log("[DB] Updating database with values:", {
    scanStatus,
    aiDetected,
    aiConfidence,
    aiModelVersion,
    scanPassed,
    flaggedReason,
  });

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
  console.log("[DB] ===============================================");

  // Update release status
  let releaseStatus = "scan_passed";
  if (scanStatus === "flagged") {
    releaseStatus = "scan_flagged";
  } else if (scanStatus === "failed") {
    releaseStatus = "scan_failed";
  }

  await pool.query(`UPDATE releases SET audio_scan_status = $1 WHERE id = $2`, [
    releaseStatus,
    releaseId,
  ]);
}

function formatScanResponse(record: any) {
  return {
    id: record.id,
    release_id: record.release_id,
    track_id: record.track_id,
    ircam_job_id: record.ircam_job_id,
    status: record.scan_status,
    scan_passed: record.scan_passed,
    ai_generated_detected: record.ai_generated_detected,
    ai_confidence: record.ai_confidence,
    ai_model_version: record.ai_model_version,
    flagged_reason: record.flagged_reason,
    admin_reviewed: record.admin_reviewed,
    admin_decision: record.admin_decision,
    admin_notes: record.admin_notes,
    error_message: record.error_message,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}
