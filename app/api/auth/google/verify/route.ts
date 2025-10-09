import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { createSubscription } from "@/lib/subscription-utils";
import { notifyNewArtistSignUp } from "@/lib/notifications";

/**
 * Verify Google OAuth token from client-side
 * POST /api/auth/google/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, user_info } = body;

    if (!access_token || !user_info) {
      return NextResponse.json(
        { success: false, error: "Missing access token or user info" },
        { status: 400 }
      );
    }

    // Verify token with Google (optional but recommended)
    const googleVerifyResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!googleVerifyResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Invalid Google access token" },
        { status: 401 }
      );
    }

    const googleUser = await googleVerifyResponse.json();

    console.log("Verified Google user:", googleUser);

    // Check if user exists by Google ID
    let userResult = await pool.query(
      "SELECT * FROM users WHERE google_id = $1",
      [googleUser.id]
    );

    let user;

    if (userResult.rows.length > 0) {
      // User exists - update their info
      user = userResult.rows[0];

      await pool.query(
        `UPDATE users SET 
          oauth_avatar_url = $1,
          oauth_name = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3`,
        [googleUser.picture, googleUser.name, user.id]
      );

      console.log("Updated existing user:", user.id);
    } else {
      // Check if user exists by email
      userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
        googleUser.email,
      ]);

      if (userResult.rows.length > 0) {
        // Link Google account to existing user
        user = userResult.rows[0];

        await pool.query(
          `UPDATE users SET 
            google_id = $1,
            oauth_provider = 'google',
            oauth_avatar_url = $2,
            oauth_name = $3,
            is_verified = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4`,
          [googleUser.id, googleUser.picture, googleUser.name, user.id]
        );

        console.log("Linked Google account to existing user:", user.id);
      } else {
        // Create new user
        const insertResult = await pool.query(
          `INSERT INTO users (
            email,
            google_id,
            oauth_provider,
            oauth_avatar_url,
            oauth_name,
            artist_name,
            is_verified,
            password_hash,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [
            googleUser.email,
            googleUser.id,
            "google",
            googleUser.picture,
            googleUser.name,
            googleUser.name, // Use Google name as artist name by default
          ]
        );

        user = insertResult.rows[0];

        console.log("Created new user from Google:", user.id);

        // Create subscription record for new user (same as regular registration)
        const subscription = await createSubscription(user.id);
        if (!subscription) {
          console.warn(
            `Failed to create subscription for Google user ${user.id}, but user was created`
          );
        }

        // Send Slack notification for new artist sign-up (non-blocking)
        notifyNewArtistSignUp(
          user.artist_name || user.email.split("@")[0],
          user.email
        ).catch((err) =>
          console.error("Failed to send Slack notification:", err)
        );
      }
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return NextResponse.json({
      success: true,
      message: `Welcome ${user.artist_name || user.email}!`,
      token,
      user: {
        id: user.id,
        email: user.email,
        artistName: user.artist_name,
        isVerified: user.is_verified,
        avatarUrl: user.oauth_avatar_url,
      },
    });
  } catch (error) {
    console.error("Google verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify Google authentication",
      },
      { status: 500 }
    );
  }
}
