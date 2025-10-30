import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const adminCheck = await query("SELECT is_admin FROM users WHERE id = $1", [
      tokenData.userId,
    ]);

    if (!adminCheck.rows[0]?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30";
    const days = parseInt(range);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Step 1: Total Trial Sign-ups
    // Users with trial subscription OR users with pending/failed payment status (treated as trial)
    const totalTrialSignupsResult = await query(
      `
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.created_at >= $1 AND u.created_at <= $2
      AND (
        s.tier = 'trial' 
        OR s.status IN ('pending_payment', 'payment_failed')
        OR s.id IS NULL
      )
      `,
      [startDate, endDate]
    );
    const totalTrialSignups = parseInt(
      totalTrialSignupsResult.rows[0]?.count || "0"
    );

    // Step 2: Trial Users Attempting ID Check
    // Trial users who signed up in time range AND submitted ID verification (any time)
    const trialUsersAttemptingIdCheckResult = await query(
      `
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.created_at >= $1 AND u.created_at <= $2
      AND u.identity_verification_submitted_at IS NOT NULL
      AND (
        s.tier = 'trial' 
        OR s.status IN ('pending_payment', 'payment_failed')
        OR s.id IS NULL
      )
      `,
      [startDate, endDate]
    );
    const trialUsersAttemptingIdCheck = parseInt(
      trialUsersAttemptingIdCheckResult.rows[0]?.count || "0"
    );

    // Step 3: Trial Users Passing ID Check
    // Trial users who signed up in time range AND got ID verified (any time)
    const trialUsersPassingIdCheckResult = await query(
      `
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.created_at >= $1 AND u.created_at <= $2
      AND u.identity_verified_at IS NOT NULL
      AND (
        s.tier = 'trial' 
        OR s.status IN ('pending_payment', 'payment_failed')
        OR s.id IS NULL
      )
      `,
      [startDate, endDate]
    );
    const trialUsersPassingIdCheck = parseInt(
      trialUsersPassingIdCheckResult.rows[0]?.count || "0"
    );

    // Step 4: Trial Users Submitting First Release
    // Trial users who signed up in time range AND created their FIRST release (any time)
    const trialUsersSubmittingFirstReleaseResult = await query(
      `
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      INNER JOIN releases r ON u.id = r.artist_id
      WHERE u.created_at >= $1 AND u.created_at <= $2
      AND r.created_at IS NOT NULL
      AND (
        s.tier = 'trial' 
        OR s.status IN ('pending_payment', 'payment_failed')
        OR s.id IS NULL
      )
      AND r.created_at = (
        SELECT MIN(r2.created_at) 
        FROM releases r2 
        WHERE r2.artist_id = u.id 
        AND r2.created_at IS NOT NULL
      )
      `,
      [startDate, endDate]
    );
    const trialUsersSubmittingFirstRelease = parseInt(
      trialUsersSubmittingFirstReleaseResult.rows[0]?.count || "0"
    );

    // Step 5: Trial Users First Release Approved/Completed
    // Trial users who signed up in time range AND whose FIRST release is live or sent to store (approved, published, live, sent_to_store)
    const trialUsersFirstReleaseApprovedResult = await query(
      `
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      INNER JOIN releases r ON u.id = r.artist_id
      WHERE u.created_at >= $1 AND u.created_at <= $2
      AND r.created_at = (
        SELECT MIN(r2.created_at)
        FROM releases r2
        WHERE r2.artist_id = u.id AND r2.created_at IS NOT NULL
      )
      AND r.status IN ('approved', 'published', 'live', 'sent_to_store')
      AND (
        s.tier = 'trial' 
        OR s.status IN ('pending_payment', 'payment_failed')
        OR s.id IS NULL
      )
      `,
      [startDate, endDate]
    );
    const trialUsersFirstReleaseApproved = parseInt(
      trialUsersFirstReleaseApprovedResult.rows[0]?.count || "0"
    );

    return NextResponse.json({
      totalTrialSignups,
      trialUsersAttemptingIdCheck,
      trialUsersPassingIdCheck,
      trialUsersSubmittingFirstRelease,
      trialUsersFirstReleaseApproved,
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error("Error fetching onboarding funnel data:", error);
    return NextResponse.json(
      { error: "Failed to fetch funnel data" },
      { status: 500 }
    );
  }
}
