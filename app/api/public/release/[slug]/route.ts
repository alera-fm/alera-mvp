import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * GET /api/public/release/[slug]
 * Get public release data by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get release by slug/title
    const releaseResult = await pool.query(
      `SELECT r.id, r.release_title, r.status, r.created_at,
              u.artist_name, u.id as artist_id
       FROM releases r
       JOIN users u ON r.artist_id = u.id
       WHERE r.status = 'live' 
       AND (
         LOWER(REPLACE(r.release_title, ' ', '-')) = $1 
         OR LOWER(REPLACE(r.release_title, ' ', '_')) = $1
         OR LOWER(r.release_title) = $1
       )
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [slug.toLowerCase()]
    );

    if (releaseResult.rows.length === 0) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const release = releaseResult.rows[0];

    // Get the latest parsed link data for this release
    const linkResult = await pool.query(
      `SELECT artist_name, release_title, artwork_url, 
              streaming_services, fan_engagement, parsed_at
       FROM release_links 
       WHERE release_id = $1 
       ORDER BY parsed_at DESC 
       LIMIT 1`,
      [release.id]
    );

    // If no parsed link data exists, return basic release info
    if (linkResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        release: {
          id: release.id,
          artistName: release.artist_name,
          releaseTitle: release.release_title,
          artworkUrl: null,
          streamingServices: [],
          fanEngagement: {
            enabled: false,
          },
          status: release.status,
          createdAt: release.created_at,
          hasParsedData: false,
        },
      });
    }

    const linkData = linkResult.rows[0];

    // Return formatted release data
    return NextResponse.json({
      success: true,
      release: {
        id: release.id,
        artistName: linkData.artist_name,
        releaseTitle: linkData.release_title,
        artworkUrl: linkData.artwork_url,
        streamingServices: linkData.streaming_services,
        fanEngagement: linkData.fan_engagement,
        status: release.status,
        createdAt: release.created_at,
        parsedAt: linkData.parsed_at,
        hasParsedData: true,
      },
    });
  } catch (error) {
    console.error("[Public API] Error fetching release data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
