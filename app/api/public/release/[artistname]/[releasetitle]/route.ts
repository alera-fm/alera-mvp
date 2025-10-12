import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * GET /api/public/release/[artistname]/[releasetitle]
 * Get public release data by artist name and release title
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artistname: string; releasetitle: string }> }
) {
  try {
    const { artistname, releasetitle } = await params;

    // Decode URL parameters (handles %20 spaces and other encoded characters)
    const decodedArtist = decodeURIComponent(artistname).toLowerCase();
    const decodedRelease = decodeURIComponent(releasetitle).toLowerCase();

    // Get release by artist name and release title with artist's public page link
    const releaseResult = await pool.query(
      `SELECT r.id, r.release_title, r.status, r.created_at,
              u.artist_name, u.id as artist_id,
              lp.slug as artist_slug
       FROM releases r
       JOIN users u ON r.artist_id = u.id
       LEFT JOIN landing_pages lp ON lp.artist_id = u.id
       WHERE r.status = 'live' 
       AND (
         LOWER(REPLACE(u.artist_name, ' ', '-')) = $1 
         OR LOWER(REPLACE(u.artist_name, ' ', '_')) = $1
         OR LOWER(u.artist_name) = $1
       )
       AND (
         LOWER(REPLACE(r.release_title, ' ', '-')) = $2 
         OR LOWER(REPLACE(r.release_title, ' ', '_')) = $2
         OR LOWER(r.release_title) = $2
       )
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [decodedArtist, decodedRelease]
    );

    if (releaseResult.rows.length === 0) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const releaseRow = releaseResult.rows[0];

    // Get the latest parsed link data for this release
    const linkResult = await pool.query(
      `SELECT artist_name, release_title, artwork_url, 
              streaming_services, parsed_at
       FROM release_links 
       WHERE release_id = $1 
       ORDER BY parsed_at DESC 
       LIMIT 1`,
      [releaseRow.id]
    );

    // Build artist public link from landing_pages.slug (from LEFT JOIN above)
    // artist_slug comes from: LEFT JOIN landing_pages lp ON lp.artist_id = u.id
    const artistPublicLink = releaseRow.artist_slug
      ? `/p/${releaseRow.artist_slug}`
      : "";

    // If no parsed link data exists, return basic release info
    if (linkResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        release: {
          status: releaseRow.status,
          artistName: releaseRow.artist_name,
          releaseTitle: releaseRow.release_title,
          artworkUrl: null,
          streamingServices: [],
          artistPublicLink: artistPublicLink,
        },
      });
    }

    const linkData = linkResult.rows[0];

    // Return formatted release data
    return NextResponse.json({
      success: true,
      release: {
        status: releaseRow.status,
        artistName: linkData.artist_name,
        releaseTitle: linkData.release_title,
        artworkUrl: linkData.artwork_url,
        streamingServices: linkData.streaming_services,
        artistPublicLink: artistPublicLink,
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
