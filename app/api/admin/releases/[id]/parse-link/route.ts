import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-middleware";
import { parseReleaseLink, ParsedReleaseData } from "@/lib/release-link-parser";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/admin/releases/[id]/parse-link
 * Parse a distributor release link and store the data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id: releaseId } = await params;
    const { sourceUrl } = await request.json();

    if (!sourceUrl || typeof sourceUrl !== "string") {
      return NextResponse.json(
        { error: "sourceUrl is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(sourceUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Check if release exists and is live
    const releaseResult = await pool.query(
      "SELECT id, release_title, status FROM releases WHERE id = $1",
      [releaseId]
    );

    if (releaseResult.rows.length === 0) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const release = releaseResult.rows[0];
    if (release.status !== "live") {
      return NextResponse.json(
        { error: "Release must be live to parse links" },
        { status: 400 }
      );
    }

    // Check if link already exists
    const existingLinkResult = await pool.query(
      "SELECT id FROM release_links WHERE release_id = $1 AND source_url = $2",
      [releaseId, sourceUrl]
    );

    if (existingLinkResult.rows.length > 0) {
      return NextResponse.json(
        { error: "This link has already been parsed for this release" },
        { status: 409 }
      );
    }

    console.log(
      `[Admin API] Parsing release link for release ${releaseId}: ${sourceUrl}`
    );

    // Parse the release link
    const parsedData = await parseReleaseLink(sourceUrl);

    // Store the parsed data in database
    const insertResult = await pool.query(
      `INSERT INTO release_links (
        release_id, artist_name, release_title, artwork_url, 
        streaming_services, fan_engagement, source_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, parsed_at`,
      [
        releaseId,
        parsedData.artistName,
        parsedData.releaseTitle,
        parsedData.artworkUrl,
        JSON.stringify(parsedData.streamingServices),
        JSON.stringify(parsedData.fanEngagement),
        sourceUrl,
      ]
    );

    const newLink = insertResult.rows[0];

    console.log(
      `[Admin API] ✅ Successfully parsed and stored release link with ID: ${newLink.id}`
    );
    console.log(
      `[Admin API] 📊 Final parsed data:`,
      JSON.stringify(parsedData, null, 2)
    );

    return NextResponse.json({
      success: true,
      linkId: newLink.id,
      parsedAt: newLink.parsed_at,
      data: parsedData,
    });
  } catch (error) {
    console.error("[Admin API] Error parsing release link:", error);

    if (error instanceof Error) {
      if (error.message.includes("HTTP") || error.message.includes("fetch")) {
        return NextResponse.json(
          { error: "Failed to fetch the release page. Please check the URL." },
          { status: 400 }
        );
      }

      if (
        error.message.includes("Firecrawl") ||
        error.message.includes("timeout")
      ) {
        return NextResponse.json(
          { error: "Firecrawl could not scrape this page. Please try again." },
          { status: 500 }
        );
      }

      if (error.message.includes("OpenAI") || error.message.includes("JSON")) {
        return NextResponse.json(
          { error: "Failed to extract data. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/releases/[id]/parse-link
 * Get parsed links for a release
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id: releaseId } = await params;

    // Get all parsed links for this release
    const result = await pool.query(
      `SELECT id, artist_name, release_title, artwork_url, 
              streaming_services, fan_engagement, source_url, 
              parsed_at, created_at, updated_at
       FROM release_links 
       WHERE release_id = $1 
       ORDER BY created_at DESC`,
      [releaseId]
    );

    const links = result.rows.map((row) => ({
      id: row.id,
      artistName: row.artist_name,
      releaseTitle: row.release_title,
      artworkUrl: row.artwork_url,
      streamingServices: row.streaming_services,
      fanEngagement: row.fan_engagement,
      sourceUrl: row.source_url,
      parsedAt: row.parsed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ links });
  } catch (error) {
    console.error("[Admin API] Error fetching release links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
