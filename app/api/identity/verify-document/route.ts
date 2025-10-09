import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * Submit document-based identity verification (Lightweight IDV)
 * POST /api/identity/verify-document
 */
export async function POST(request: NextRequest) {
  try {
    const tokenData = await requireAuth(request);
    const userId = tokenData.userId;
    const body = await request.json();
    const {
      documentType,
      documentUrl,
      documentName,
      fullName,
      dateOfBirth,
      documentNumber,
    } = body;

    // Validate required fields
    if (!documentType || !documentUrl || !fullName || !dateOfBirth) {
      return NextResponse.json(
        {
          error:
            "Document type, document URL, full name, and date of birth are required",
        },
        { status: 400 }
      );
    }

    // Check if user already has pending or approved verification
    const existingVerification = await pool.query(
      `SELECT identity_verification_status FROM users WHERE id = $1`,
      [userId]
    );

    const status = existingVerification.rows[0]?.identity_verification_status;
    if (status === "approved") {
      return NextResponse.json(
        { error: "Identity already verified" },
        { status: 400 }
      );
    }

    if (status === "pending") {
      return NextResponse.json(
        { error: "Identity verification is already pending admin review" },
        { status: 400 }
      );
    }

    // Update user with document verification data - SET TO PENDING
    await pool.query(
      `UPDATE users 
       SET identity_verification_status = 'pending',
           idv_method = 'document',
           idv_document_type = $2,
           idv_document_url = $3,
           idv_document_name = $4,
           idv_full_name = $5,
           idv_date_of_birth = $6,
           idv_document_number = $7,
           identity_verification_submitted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        userId,
        documentType,
        documentUrl,
        documentName,
        fullName,
        dateOfBirth,
        documentNumber || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        "Document verification submitted successfully. Please wait for admin approval.",
    });
  } catch (error) {
    console.error("Document verification error:", error);
    return NextResponse.json(
      { error: "Failed to submit document verification" },
      { status: 500 }
    );
  }
}
