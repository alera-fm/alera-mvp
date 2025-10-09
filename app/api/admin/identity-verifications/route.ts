import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * Get all pending identity verifications for admin review
 * GET /api/admin/identity-verifications
 */
export async function GET(request: NextRequest) {
  try {
    const tokenData = await requireAuth(request);

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [tokenData.userId]
    );

    if (!adminCheck.rows[0]?.is_admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all pending identity verifications (both social and document)
    const pendingVerifications = await pool.query(
      `SELECT 
        id,
        email,
        artist_name,
        identity_platform,
        identity_username,
        identity_data,
        idv_method,
        idv_document_type,
        idv_document_url,
        idv_document_name,
        idv_full_name,
        idv_date_of_birth,
        idv_document_number,
        identity_verification_submitted_at,
        created_at
      FROM users 
      WHERE identity_verification_status = 'pending'
      ORDER BY identity_verification_submitted_at ASC`
    );

    return NextResponse.json({
      success: true,
      verifications: pendingVerifications.rows,
      total: pendingVerifications.rows.length,
    });
  } catch (error) {
    console.error("Get pending verifications error:", error);
    return NextResponse.json(
      { error: "Failed to get pending verifications" },
      { status: 500 }
    );
  }
}

/**
 * Review identity verification (approve/reject)
 * POST /api/admin/identity-verifications
 */
export async function POST(request: NextRequest) {
  try {
    const tokenData = await requireAuth(request);

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [tokenData.userId]
    );

    if (!adminCheck.rows[0]?.is_admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, decision, notes } = body;

    if (!userId || !decision) {
      return NextResponse.json(
        { error: "User ID and decision are required" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json(
        { error: "Decision must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Update user verification status
    const updateQuery =
      decision === "approved"
        ? `UPDATE users 
         SET identity_verification_status = 'approved',
             identity_verified = TRUE,
             identity_verified_at = CURRENT_TIMESTAMP,
             identity_admin_reviewed_by = $2,
             identity_admin_reviewed_at = CURRENT_TIMESTAMP,
             identity_admin_notes = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`
        : `UPDATE users 
         SET identity_verification_status = 'rejected',
             identity_admin_reviewed_by = $2,
             identity_admin_reviewed_at = CURRENT_TIMESTAMP,
             identity_admin_notes = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`;

    await pool.query(updateQuery, [userId, tokenData.userId, notes || null]);

    return NextResponse.json({
      success: true,
      message: `Identity verification ${decision} successfully`,
    });
  } catch (error) {
    console.error("Review verification error:", error);
    return NextResponse.json(
      { error: "Failed to review verification" },
      { status: 500 }
    );
  }
}
