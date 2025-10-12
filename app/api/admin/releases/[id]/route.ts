import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id: releaseId } = await params;

    const releaseResult = await pool.query(
      `
      SELECT r.*, u.artist_name, u.email as artist_email,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', t.id,
                   'track_number', t.track_number,
                   'track_title', t.track_title,
                   'artist_names', t.artist_names,
                   'featured_artists', t.featured_artists,
                   'songwriters', t.songwriters,
                   'producer_credits', t.producer_credits,
                   'performer_credits', t.performer_credits,
                   'genre', t.genre,
                   'audio_file_url', t.audio_file_url,
                   'audio_file_name', t.audio_file_name,
                   'isrc', t.isrc,
                   'lyrics_text', t.lyrics_text,
                   'has_lyrics', t.has_lyrics
                 ) ORDER BY t.track_number
               ) FILTER (WHERE t.id IS NOT NULL), 
               '[]'
             ) as tracks
      FROM releases r
      JOIN users u ON r.artist_id = u.id
      LEFT JOIN tracks t ON r.id = t.release_id
      WHERE r.id = $1
      GROUP BY r.id, u.artist_name, u.email, r.upc
    `,
      [releaseId]
    );

    if (releaseResult.rows.length === 0) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const release = releaseResult.rows[0];

    // Get audio scan results for this release
    const scanResults = await pool.query(
      `
      SELECT
        id,
        track_id,
        ircam_job_id,
        scan_status,
        track_title,
        track_artist,
        ai_generated_detected,
        ai_confidence,
        ai_model_version,
        scan_passed,
        flagged_reason,
        admin_reviewed,
        admin_decision,
        admin_notes,
        error_message,
        created_at,
        updated_at
      FROM audio_scan_results
      WHERE release_id = $1
      ORDER BY created_at DESC
    `,
      [releaseId]
    );

    return NextResponse.json({
      release: release,
      audio_scans: scanResults.rows,
      scan_summary: {
        total: scanResults.rows.length,
        processing: scanResults.rows.filter(
          (s) => s.scan_status === "processing" || s.scan_status === "pending"
        ).length,
        passed: scanResults.rows.filter((s) => s.scan_passed === true).length,
        flagged: scanResults.rows.filter((s) => s.scan_status === "flagged")
          .length,
        failed: scanResults.rows.filter((s) => s.scan_status === "failed")
          .length,
      },
    });
  } catch (error) {
    console.error("Admin get release error:", error);
    return NextResponse.json(
      { error: "Failed to fetch release" },
      { status: 500 }
    );
  }
}
