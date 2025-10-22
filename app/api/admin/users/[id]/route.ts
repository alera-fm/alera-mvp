import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id: userId } = await params;

    // Fetch user details with subscription and activity stats
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.artist_name,
        u.created_at,
        u.is_verified,
        u.identity_verified,
        s.tier as subscription_tier,
        s.status as subscription_status,
        s.trial_expires_at,
        s.subscription_expires_at,
        (SELECT COUNT(*) FROM releases WHERE artist_id = u.id) as release_count,
        (SELECT COALESCE(SUM(amount_usd), 0) FROM streaming_earnings WHERE CAST(artist_id AS INTEGER) = u.id) as total_earnings
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      WHERE u.id = $1
    `;

    const result = await pool.query(userQuery, [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = result.rows[0];

    const user = {
      id: userData.id,
      email: userData.email,
      artist_name: userData.artist_name,
      created_at: userData.created_at,
      is_verified: userData.is_verified,
      identity_verified: userData.identity_verified || false,
      subscription: userData.subscription_tier
        ? {
            tier: userData.subscription_tier,
            status: userData.subscription_status,
            trial_expires_at: userData.trial_expires_at,
            subscription_expires_at: userData.subscription_expires_at,
          }
        : null,
      release_count: parseInt(userData.release_count) || 0,
      total_earnings: parseFloat(userData.total_earnings) || 0,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
