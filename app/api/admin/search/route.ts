import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-middleware";
import type { SearchResult } from "@/types/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    // Search users by email or artist name
    const usersQuery = `
      SELECT 
        id,
        email,
        artist_name,
        'user' as type
      FROM users
      WHERE (
        LOWER(email) LIKE LOWER($1) 
        OR LOWER(artist_name) LIKE LOWER($1)
      )
      ORDER BY 
        CASE 
          WHEN LOWER(email) = LOWER($2) THEN 1
          WHEN LOWER(artist_name) = LOWER($2) THEN 1
          ELSE 2
        END,
        created_at DESC
      LIMIT 5
    `;

    // Search releases by title or UPC
    const releasesQuery = `
      SELECT 
        r.id,
        r.release_title,
        r.artist_name,
        r.upc,
        'release' as type
      FROM releases r
      WHERE (
        LOWER(r.release_title) LIKE LOWER($1)
        OR LOWER(r.artist_name) LIKE LOWER($1)
        OR LOWER(r.upc) LIKE LOWER($1)
      )
      ORDER BY 
        CASE 
          WHEN LOWER(r.release_title) = LOWER($2) THEN 1
          WHEN LOWER(r.upc) = LOWER($2) THEN 1
          ELSE 2
        END,
        r.submitted_at DESC
      LIMIT 5
    `;

    const [usersResult, releasesResult] = await Promise.all([
      pool.query(usersQuery, [searchTerm, query.trim()]),
      pool.query(releasesQuery, [searchTerm, query.trim()]),
    ]);

    const results: SearchResult[] = [
      ...usersResult.rows.map((row) => ({
        type: "user" as const,
        id: row.id,
        title: row.artist_name || row.email,
        subtitle: row.email,
      })),
      ...releasesResult.rows.map((row) => ({
        type: "release" as const,
        id: row.id,
        title: row.release_title,
        subtitle: `${row.artist_name}${row.upc ? ` • UPC: ${row.upc}` : ""}`,
      })),
    ];

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (error) {
    console.error("Admin search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
