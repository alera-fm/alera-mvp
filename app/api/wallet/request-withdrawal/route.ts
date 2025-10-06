import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/subscription-middleware";
import { getSubscription } from "@/lib/subscription-utils";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await requireAuth(request);

    const { artist_id, amount_requested, method, account_details } =
      await request.json();

    if (!artist_id || !amount_requested || !method) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify that artist_id matches authenticated user
    if (parseInt(artist_id) !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Check if user is on trial tier
    const subscription = await getSubscription(userId);
    if (subscription?.tier === "trial") {
      return NextResponse.json(
        {
          error:
            "Trial users cannot withdraw earnings. Upgrade to Plus or Pro to access your earnings.",
          requiresUpgrade: true,
          tier: "plus",
        },
        { status: 403 }
      );
    }

    // Check if artist has sufficient pending earnings
    const earningsResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount_usd), 0) as total_earnings
      FROM streaming_earnings 
      WHERE artist_id = $1
    `,
      [artist_id]
    );

    const withdrawnResult = await pool.query(
      `
      SELECT COALESCE(SUM(amount_requested), 0) as withdrawn
      FROM withdrawal_requests 
      WHERE artist_id = $1 AND status = 'approved'
    `,
      [artist_id]
    );

    const totalEarnings = Number(earningsResult.rows[0].total_earnings);
    const withdrawn = Number(withdrawnResult.rows[0].withdrawn);
    const pendingEarnings = totalEarnings - withdrawn;

    if (amount_requested > pendingEarnings) {
      return NextResponse.json(
        {
          error: "Insufficient funds",
          available: pendingEarnings,
        },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const result = await pool.query(
      `
      INSERT INTO withdrawal_requests 
      (artist_id, amount_requested, method, account_details, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `,
      [artist_id, amount_requested, method, account_details]
    );

    return NextResponse.json({
      message: "Withdrawal request submitted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json(
      { error: "Failed to submit withdrawal request" },
      { status: 500 }
    );
  }
}
