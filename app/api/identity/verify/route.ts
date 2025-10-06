import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/subscription-middleware";
import { query } from "@/lib/db";

const SCRAPECREATORS_API_KEY = "rsh2aYLB8nXZWGJM5XoKf11rp6d2";
const SCRAPECREATORS_BASE_URL = "https://api.scrapecreators.com/v1";

interface VerificationRequest {
  platform: "instagram" | "tiktok" | "youtube" | "facebook";
  username: string;
  url?: string; // For Facebook and YouTube
  channelId?: string; // For YouTube
}

// Verify identity using scrapecreators API
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth(request);
    const body: VerificationRequest = await request.json();
    const { platform, username, url, channelId } = body;

    // Validate required fields
    if (!platform || !username) {
      return NextResponse.json(
        { error: "Platform and username are required" },
        { status: 400 }
      );
    }

    // Check if user is already verified
    const existingVerification = await query(
      `SELECT identity_verified FROM users WHERE id = $1`,
      [userId]
    );

    if (existingVerification.rows[0]?.identity_verified) {
      return NextResponse.json(
        { error: "Identity already verified" },
        { status: 400 }
      );
    }

    // Call scrapecreators API based on platform
    let apiUrl = "";
    let apiResponse;

    try {
      switch (platform) {
        case "instagram":
          apiUrl = `${SCRAPECREATORS_BASE_URL}/instagram/profile?handle=${encodeURIComponent(
            username
          )}`;
          break;
        case "tiktok":
          apiUrl = `${SCRAPECREATORS_BASE_URL}/tiktok/profile?handle=${encodeURIComponent(
            username
          )}`;
          break;
        case "youtube":
          if (channelId) {
            apiUrl = `${SCRAPECREATORS_BASE_URL}/youtube/channel?channelId=${encodeURIComponent(
              channelId
            )}&handle=${encodeURIComponent(username)}`;
          } else if (url) {
            apiUrl = `${SCRAPECREATORS_BASE_URL}/youtube/channel?url=${encodeURIComponent(
              url
            )}&handle=${encodeURIComponent(username)}`;
          } else {
            apiUrl = `${SCRAPECREATORS_BASE_URL}/youtube/channel?handle=${encodeURIComponent(
              username
            )}`;
          }
          break;
        case "facebook":
          if (!url) {
            return NextResponse.json(
              { error: "URL is required for Facebook verification" },
              { status: 400 }
            );
          }
          apiUrl = `${SCRAPECREATORS_BASE_URL}/facebook/profile?url=${encodeURIComponent(
            url
          )}`;
          break;
        default:
          return NextResponse.json(
            { error: "Invalid platform" },
            { status: 400 }
          );
      }

      console.log(`Calling scrapecreators API: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers: {
          "x-api-key": SCRAPECREATORS_API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Scrapecreators API error: ${response.status} - ${errorText}`
        );

        if (response.status === 401) {
          return NextResponse.json(
            { error: "Verification service temporarily unavailable" },
            { status: 503 }
          );
        } else if (response.status === 402) {
          return NextResponse.json(
            { error: "Verification service quota exceeded" },
            { status: 503 }
          );
        } else {
          return NextResponse.json(
            { error: "Profile not found or invalid credentials" },
            { status: 404 }
          );
        }
      }

      apiResponse = await response.json();
      console.log(`Scrapecreators API response for ${platform}:`, apiResponse);
    } catch (apiError) {
      console.error("Scrapecreators API call failed:", apiError);
      return NextResponse.json(
        { error: "Verification service temporarily unavailable" },
        { status: 503 }
      );
    }

    // Extract relevant data based on platform
    let profileData;
    let displayName;
    let profilePicture;

    switch (platform) {
      case "instagram":
        profileData = apiResponse.data?.user || apiResponse.user;
        displayName = profileData?.full_name || profileData?.username;
        profilePicture =
          profileData?.profile_pic_url_hd || profileData?.profile_pic_url;
        break;
      case "tiktok":
        profileData = apiResponse.user;
        displayName = profileData?.nickname || profileData?.uniqueId;
        profilePicture = profileData?.avatarLarger || profileData?.avatarMedium;
        break;
      case "youtube":
        profileData = apiResponse;
        displayName = profileData?.name;
        profilePicture = profileData?.avatar?.image?.sources?.[0]?.url;
        break;
      case "facebook":
        profileData = apiResponse;
        displayName = profileData?.name;
        profilePicture = profileData?.profilePhoto?.url;
        break;
    }

    // Return verification data for user confirmation
    return NextResponse.json({
      success: true,
      verificationData: {
        platform,
        username,
        displayName,
        profilePicture,
        profileData: apiResponse, // Full response for confirmation
      },
    });
  } catch (error) {
    console.error("Identity verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify identity" },
      { status: 500 }
    );
  }
}

// Confirm identity verification
export async function PUT(request: NextRequest) {
  try {
    const userId = await requireAuth(request);
    const body = await request.json();
    const { platform, username, profileData, confirmed } = body;

    if (!confirmed) {
      return NextResponse.json(
        { error: "Verification not confirmed" },
        { status: 400 }
      );
    }

    // Check if user is already verified
    const existingVerification = await query(
      `SELECT identity_verified FROM users WHERE id = $1`,
      [userId]
    );

    if (existingVerification.rows[0]?.identity_verified) {
      return NextResponse.json(
        { error: "Identity already verified" },
        { status: 400 }
      );
    }

    // Update user with verification data
    await query(
      `UPDATE users 
       SET identity_verified = TRUE,
           identity_platform = $2,
           identity_username = $3,
           identity_data = $4,
           identity_verified_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId, platform, username, JSON.stringify(profileData)]
    );

    return NextResponse.json({
      success: true,
      message: "Identity verification completed successfully",
    });
  } catch (error) {
    console.error("Identity verification confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm identity verification" },
      { status: 500 }
    );
  }
}

// Get current verification status
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth(request);

    const result = await query(
      `SELECT identity_verified, identity_platform, identity_username, 
              identity_data, identity_verified_at
       FROM users WHERE id = $1`,
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      verified: user.identity_verified,
      platform: user.identity_platform,
      username: user.identity_username,
      verifiedAt: user.identity_verified_at,
      profileData: user.identity_data || null,
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    return NextResponse.json(
      { error: "Failed to get verification status" },
      { status: 500 }
    );
  }
}
