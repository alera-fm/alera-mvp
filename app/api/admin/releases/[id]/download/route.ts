import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import JSZip from "jszip";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    const userResult = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [decoded.userId]
    );
    if (!userResult.rows[0]?.is_admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id: releaseId } = await params;

    // Fetch complete release data with tracks
    const releaseResult = await pool.query(
      `
      SELECT r.*, 
             u.email as artist_email,
             u.artist_name,
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
                   'has_lyrics', t.has_lyrics,
                   'add_featured_to_title', t.add_featured_to_title
                 ) ORDER BY t.track_number
               ) FILTER (WHERE t.id IS NOT NULL), 
               '[]'
             ) as tracks
      FROM releases r
      LEFT JOIN users u ON r.artist_id = u.id
      LEFT JOIN tracks t ON r.id = t.release_id
      WHERE r.id = $1
      GROUP BY r.id, u.email, u.artist_name
    `,
      [releaseId]
    );

    if (releaseResult.rows.length === 0) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    const release = releaseResult.rows[0];
    const zip = new JSZip();

    // Add release metadata as JSON
    const releaseMetadata = {
      ...release,
      download_timestamp: new Date().toISOString(),
      downloaded_by: decoded.userId,
    };

    zip.file("release_metadata.json", JSON.stringify(releaseMetadata, null, 2));

    // Add release metadata as CSV for easy viewing
    const csvData = convertReleaseToCSV(release);
    zip.file("release_data.csv", csvData);

    // Create a detailed readme file
    const readme = generateReadmeContent(release);
    zip.file("README.txt", readme);

    // Download and add album cover if exists
    if (release.album_cover_url) {
      try {
        const coverResponse = await fetch(release.album_cover_url);
        if (coverResponse.ok) {
          const coverBuffer = await coverResponse.arrayBuffer();
          const fileExtension =
            getFileExtension(release.album_cover_url) || "jpg";
          zip.file(`album_cover.${fileExtension}`, coverBuffer);
        }
      } catch (error) {
        console.error("Error downloading album cover:", error);
        // Continue without the cover - don't fail the entire download
      }
    }

    // Download and add audio files
    const audioFolder = zip.folder("audio_files");
    const tracks = Array.isArray(release.tracks)
      ? release.tracks
      : JSON.parse(release.tracks || "[]");

    for (const track of tracks) {
      if (track.audio_file_url) {
        try {
          const audioResponse = await fetch(track.audio_file_url);
          if (audioResponse.ok) {
            const audioBuffer = await audioResponse.arrayBuffer();
            const fileName =
              track.audio_file_name || `track_${track.track_number}.mp3`;
            audioFolder?.file(fileName, audioBuffer);
          }
        } catch (error) {
          console.error(
            `Error downloading audio file for track ${track.track_number}:`,
            error
          );
          // Continue with other files - don't fail the entire download
        }
      }
    }

    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Return the zip file
    const fileName = `${release.release_title.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_complete_release_data.zip`;

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download release error:", error);
    return NextResponse.json(
      { error: "Failed to download release data" },
      { status: 500 }
    );
  }
}

function convertReleaseToCSV(release: any): string {
  const rows = [];

  // Add header
  rows.push(["Field", "Value"].join(","));

  // Define field order for better organization
  const fieldOrder = [
    "id",
    "artist_name",
    "artist_email",
    "release_title",
    "distribution_type",
    "record_label",
    "c_line",
    "p_line",
    "primary_genre",
    "secondary_genre",
    "language",
    "explicit_lyrics",
    "instrumental",
    "version_info",
    "version_other",
    "release_date",
    "original_release_date",
    "previously_released",
    "album_cover_url",
    "has_spotify_profile",
    "spotify_profile_url",
    "has_apple_profile",
    "apple_profile_url",
    "additional_delivery",
    "selected_stores",
    "track_price",
    "status",
    "terms_agreed",
    "fake_streaming_agreement",
    "distribution_agreement",
    "artist_names_agreement",
    "snapchat_terms",
    "youtube_music_agreement",
    "created_at",
    "updated_at",
    "upc",
  ];

  // Add ordered fields first
  fieldOrder.forEach((key) => {
    if (release.hasOwnProperty(key)) {
      const value = release[key];
      let csvValue = "";
      if (Array.isArray(value)) {
        csvValue = `"${value.join("; ")}"`;
      } else if (typeof value === "object" && value !== null) {
        csvValue = `"${JSON.stringify(value)}"`;
      } else {
        csvValue = `"${String(value || "")}"`;
      }
      rows.push([key, csvValue].join(","));
    }
  });

  // Add any remaining fields not in the ordered list
  Object.entries(release).forEach(([key, value]) => {
    if (key !== "tracks" && !fieldOrder.includes(key)) {
      let csvValue = "";
      if (Array.isArray(value)) {
        csvValue = `"${value.join("; ")}"`;
      } else if (typeof value === "object" && value !== null) {
        csvValue = `"${JSON.stringify(value)}"`;
      } else {
        csvValue = `"${String(value || "")}"`;
      }
      rows.push([key, csvValue].join(","));
    }
  });

  // Add tracks data
  const tracks = Array.isArray(release.tracks)
    ? release.tracks
    : JSON.parse(release.tracks || "[]");
  if (tracks.length > 0) {
    rows.push(["", ""].join(",")); // Empty row
    rows.push(["TRACKS DATA", ""].join(","));
    rows.push(["", ""].join(",")); // Empty row

    tracks.forEach((track: any, index: number) => {
      rows.push([`Track ${index + 1}`, ""].join(","));
      Object.entries(track).forEach(([key, value]) => {
        let csvValue = "";
        if (Array.isArray(value)) {
          csvValue = `"${value.join("; ")}"`;
        } else if (typeof value === "object" && value !== null) {
          csvValue = `"${JSON.stringify(value)}"`;
        } else {
          csvValue = `"${String(value || "")}"`;
        }
        rows.push([`  ${key}`, csvValue].join(","));
      });
      rows.push(["", ""].join(",")); // Empty row between tracks
    });
  }

  return rows.join("\n");
}

function generateReadmeContent(release: any): string {
  const tracks = Array.isArray(release.tracks)
    ? release.tracks
    : JSON.parse(release.tracks || "[]");

  return `ALERA RELEASE DATA DOWNLOAD
==========================

Release Title: ${release.release_title}
Artist: ${release.artist_name}
Artist Email: ${release.artist_email}
Distribution Type: ${release.distribution_type}
Record Label: ${release.record_label || "Not specified"}
Status: ${release.status}
Submission Date: ${new Date(release.created_at).toLocaleString()}
Download Date: ${new Date().toLocaleString()}

CONTENTS OF THIS ZIP FILE:
- release_metadata.json: Complete release data in JSON format
- release_data.csv: Release data in CSV format for easy viewing
- album_cover.[ext]: Album artwork (if available)
- audio_files/: Folder containing all track audio files
- README.txt: This file

COPYRIGHT INFORMATION:
- C-Line (©): ${release.c_line || "Not specified"}
- P-Line (℗): ${release.p_line || "Not specified"}

EXISTING ARTIST PROFILES:
- Spotify for Artists: ${release.has_spotify_profile ? "YES" : "NO"}${
    release.spotify_profile_url ? ` (${release.spotify_profile_url})` : ""
  }
- Apple Music for Artists: ${release.has_apple_profile ? "YES" : "NO"}${
    release.apple_profile_url ? ` (${release.apple_profile_url})` : ""
  }

ADDITIONAL DELIVERY OPTIONS:
${
  release.additional_delivery &&
  Array.isArray(release.additional_delivery) &&
  release.additional_delivery.length > 0
    ? release.additional_delivery.join(", ")
    : "None selected"
}

TRACKS INCLUDED:
${tracks
  .map(
    (track: any) =>
      `- Track ${track.track_number}: ${track.track_title} (${
        track.audio_file_name || "No audio file"
      })`
  )
  .join("\n")}

LEGAL AGREEMENTS STATUS:
- Terms Agreed: ${release.terms_agreed ? "YES" : "NO"}
- Distribution Agreement: ${release.distribution_agreement ? "YES" : "NO"}
- Artist Names Agreement: ${release.artist_names_agreement ? "YES" : "NO"}
- Fake Streaming Agreement: ${release.fake_streaming_agreement ? "YES" : "NO"}
- YouTube Music Agreement: ${release.youtube_music_agreement ? "YES" : "NO"}
- Snapchat Terms: ${release.snapchat_terms ? "YES" : "NO"}

DISTRIBUTION STORES:
${
  Array.isArray(release.selected_stores)
    ? release.selected_stores.join(", ")
    : JSON.parse(release.selected_stores || "[]").join(", ") || "None selected"
}

For support or questions, please contact support@alera.com
`;
}

function getFileExtension(url: string): string | null {
  try {
    const urlPath = new URL(url).pathname;
    const parts = urlPath.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
  } catch {
    return null;
  }
}
