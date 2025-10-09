import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";

/**
 * Admin review of flagged audio scan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scan_id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const userCheck = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (!userCheck.rows[0]?.is_admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { scan_id } = await params;
    const { decision, notes } = await request.json();

    if (!decision || !["approved", "rejected"].includes(decision)) {
      return NextResponse.json(
        { error: "Valid decision required (approved or rejected)" },
        { status: 400 }
      );
    }

    // Get scan details
    const scanResult = await pool.query(
      "SELECT id, release_id, scan_status FROM audio_scan_results WHERE id = $1",
      [scan_id]
    );

    if (scanResult.rows.length === 0) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    const scan = scanResult.rows[0];

    // Update scan with admin decision
    await pool.query(
      `UPDATE audio_scan_results SET
        admin_reviewed = true,
        admin_decision = $1,
        admin_notes = $2,
        admin_reviewed_by = $3,
        admin_reviewed_at = CURRENT_TIMESTAMP,
        scan_passed = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5`,
      [
        decision,
        notes,
        decoded.userId,
        decision === "approved", // scan_passed = true if approved
        scan_id,
      ]
    );

    // Update release status if all flagged scans are reviewed
    const remainingFlagged = await pool.query(
      `SELECT COUNT(*) as count
       FROM audio_scan_results
       WHERE release_id = $1
       AND scan_status = 'flagged'
       AND admin_reviewed = false`,
      [scan.release_id]
    );

    if (parseInt(remainingFlagged.rows[0].count) === 0) {
      // All flagged scans have been reviewed
      const allApproved = await pool.query(
        `SELECT COUNT(*) as total,
         COUNT(*) FILTER (WHERE admin_decision = 'approved' OR scan_passed = true) as approved
         FROM audio_scan_results
         WHERE release_id = $1`,
        [scan.release_id]
      );

      const total = parseInt(allApproved.rows[0].total);
      const approved = parseInt(allApproved.rows[0].approved);

      let releaseStatus = "scan_failed";
      if (approved === total) {
        releaseStatus = "admin_approved"; // All scans passed or approved
      }

      await pool.query(
        "UPDATE releases SET audio_scan_status = $1 WHERE id = $2",
        [releaseStatus, scan.release_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Scan ${decision} successfully`,
      decision,
    });
  } catch (error: any) {
    console.error("Admin review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to review scan" },
      { status: 500 }
    );
  }
}
