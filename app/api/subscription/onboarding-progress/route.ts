import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/subscription-middleware";
import { query } from "@/lib/db";

// Get user's onboarding progress by checking actual data
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await requireAuth(request);

    // Step 1: Create your Account (always completed for logged-in users)
    const accountCreated = true;

    // Step 2: Set up your Artist Profile
    const userProfile = await query(
      `SELECT artist_name, email, is_verified, display_name, phone_number, country, address, identity_verified
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    const profile = userProfile.rows[0];
    const artistProfileSetup = !!(
      profile?.artist_name &&
      profile?.email &&
      profile?.is_verified
    );

    // Step 3: Upload your first single
    const releasesCount = await query(
      `SELECT COUNT(*) as count FROM releases WHERE artist_id = $1`,
      [userId]
    );
    const hasUploadedMusic = parseInt(releasesCount.rows[0]?.count || "0") > 0;

    // Step 4: Complete your one-time identity check
    const identityCheckCompleted = profile?.identity_verified || false;

    // Step 5: Submit your release to stores!
    const submittedRelease = await query(
      `SELECT COUNT(*) as count 
       FROM releases 
       WHERE artist_id = $1 AND status != 'draft'`,
      [userId]
    );
    const releaseSubmittedToStores =
      parseInt(submittedRelease.rows[0]?.count || "0") > 0;

    // Build progress array
    const progress = [
      {
        step_name: "create_account",
        completed: accountCreated,
        completed_at: accountCreated ? new Date().toISOString() : null,
      },
      {
        step_name: "set_up_artist_profile",
        completed: artistProfileSetup,
        completed_at: artistProfileSetup ? new Date().toISOString() : null,
      },
      {
        step_name: "upload_first_single",
        completed: hasUploadedMusic,
        completed_at: hasUploadedMusic ? new Date().toISOString() : null,
      },
      {
        step_name: "complete_identity_check",
        completed: identityCheckCompleted,
        completed_at: identityCheckCompleted ? new Date().toISOString() : null,
      },
      {
        step_name: "submit_release_to_stores",
        completed: releaseSubmittedToStores,
        completed_at: releaseSubmittedToStores
          ? new Date().toISOString()
          : null,
      },
    ];

    return NextResponse.json({
      progress,
      steps: [
        { id: "create_account", name: "Create your Account" },
        { id: "set_up_artist_profile", name: "Set up your Artist Profile" },
        { id: "upload_first_single", name: "Upload your first single" },
        {
          id: "complete_identity_check",
          name: "Complete your one-time identity check",
        },
        {
          id: "submit_release_to_stores",
          name: "Submit your release to stores!",
        },
      ],
    });
  } catch (error) {
    console.error("Onboarding progress error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get onboarding progress",
      },
      { status: 500 }
    );
  }
}

// This endpoint is no longer needed since we're detecting progress dynamically
// But keeping it for backward compatibility
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await requireAuth(request);

    // Get request body
    const { stepName, completed } = await request.json();

    if (!stepName) {
      return NextResponse.json(
        { error: "Step name is required" },
        { status: 400 }
      );
    }

    // Since we're now detecting progress dynamically, we don't need to store it
    // But we can still log the completion for analytics if needed
    console.log(`User ${userId} completed step: ${stepName}`);

    // Get updated progress (dynamically detected)
    const getResponse = await GET(request);
    const data = await getResponse.json();

    return NextResponse.json({
      message: "Onboarding step completion logged",
      progress: data.progress,
    });
  } catch (error) {
    console.error("Update onboarding step error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update onboarding step",
      },
      { status: 500 }
    );
  }
}
