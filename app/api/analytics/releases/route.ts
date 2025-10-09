import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import {
  requireAnalyticsAccess,
  getTrialAnalyticsDelay,
} from "@/lib/analytics-middleware";
import { getSubscription } from "@/lib/subscription-utils";

export async function GET(request: NextRequest) {
  try {
    // Use the analytics middleware for access control
    let userId;
    try {
      // Check if the request is for advanced analytics
      const { searchParams } = new URL(request.url);
      const isAdvancedRequest = searchParams.get("advanced") === "true";
      userId = await requireAnalyticsAccess(request, isAdvancedRequest);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Check if user is on trial tier for data delay
    const isTrialUser = await getTrialAnalyticsDelay(userId);

    const { searchParams } = new URL(request.url);
    const songTitle = searchParams.get("release_id"); // This is actually song title now
    const platforms = searchParams.get("platforms")?.split(",") || [];

    // Trial users get a fixed 30-day window regardless of what they request
    const requestedDays = parseInt(searchParams.get("days") || "30");
    const days = isTrialUser ? 30 : requestedDays;

    // Get user's subscription to check trial status
    const subscription = await getSubscription(userId);
    const isTrialWithUsedRelease =
      subscription?.tier === "trial" && subscription?.free_release_used;

    // Separate streaming and social media platforms
    const streamingPlatforms = ["Spotify", "Apple Music", "Deezer"];

    // Trial users with used release can only see basic streaming data
    let selectedStreamingPlatforms = platforms.filter((p) =>
      streamingPlatforms.includes(p)
    );

    // Trial users with used release cannot access social platform data
    let selectedSocialPlatforms = isTrialWithUsedRelease
      ? []
      : platforms.filter((p) => !streamingPlatforms.includes(p));

    const hasSongFilter = songTitle && songTitle !== "total";
    const songFilter = hasSongFilter ? `AND song_title = $2` : "";
    const shazamSongFilter = hasSongFilter ? `AND track_title = $2` : "";

    // For trial users, only show weekly data (not daily)
    const dateFilter = isTrialUser
      ? `AND date >= CURRENT_DATE - INTERVAL '${days} days' AND date <= CURRENT_DATE - INTERVAL '7 days'`
      : `AND date >= CURRENT_DATE - INTERVAL '${days} days'`;

    let totalStreams = 0;
    let streamsByPlatform: any[] = [];
    let topCountries: any[] = [];
    let deviceTypes: any[] = [];
    let dailyStreams: any[] = [];
    let totalSaves = 0;

    // Social media platform data
    let shazamRecognitions = 0;
    let shazamCountries: any[] = [];
    let shazamCities: any[] = [];

    let tiktokUsage = 0;
    let tiktokViews = 0;
    let tiktokTerritories: any[] = [];

    let metaViews = 0;
    let metaTerritories: any[] = [];

    // Query streaming analytics (Spotify, Apple Music, Deezer)
    if (selectedStreamingPlatforms.length > 0 || platforms.length === 0) {
      const streamingPlatformFilter =
        selectedStreamingPlatforms.length > 0
          ? `AND platform IN (${selectedStreamingPlatforms
              .map((p) => `'${p}'`)
              .join(",")})`
          : "";

      const streamingParams = hasSongFilter
        ? [userId, songTitle]
        : [userId];

      // Get total streams from streaming platforms
      const totalStreamsQuery = `
      SELECT COALESCE(SUM(streams), 0) as total_streams
        FROM streaming_analytics 
        WHERE artist_id = $1 ${songFilter} ${streamingPlatformFilter} ${dateFilter}
      `;
      const totalStreamsResult = await query(
        totalStreamsQuery,
        streamingParams
      );
      totalStreams += totalStreamsResult.rows[0]?.total_streams || 0;

      // Get streams by platform
      const streamsByPlatformQuery = `
      SELECT platform, COALESCE(SUM(streams), 0) as streams
        FROM streaming_analytics 
        WHERE artist_id = $1 ${songFilter} ${streamingPlatformFilter} ${dateFilter}
      GROUP BY platform
      ORDER BY streams DESC
    `;
      const streamsByPlatformResult = await query(
        streamsByPlatformQuery,
        streamingParams
      );
      streamsByPlatform = streamsByPlatformResult.rows;

      // Get top countries from streaming platforms with "Other" category
      const topCountriesQuery = `
        WITH top_countries AS (
      SELECT country, COALESCE(SUM(streams), 0) as streams
          FROM streaming_analytics 
          WHERE artist_id = $1 AND country IS NOT NULL ${songFilter} ${streamingPlatformFilter} ${dateFilter}
      GROUP BY country
      ORDER BY streams DESC
          LIMIT 5
        ),
        total_countries AS (
          SELECT COALESCE(SUM(streams), 0) as total_streams
          FROM streaming_analytics 
          WHERE artist_id = $1 AND country IS NOT NULL ${songFilter} ${streamingPlatformFilter} ${dateFilter}
        ),
        top_countries_total AS (
          SELECT COALESCE(SUM(streams), 0) as top_total
          FROM top_countries
        )
        SELECT country, streams FROM top_countries
        UNION ALL
        SELECT 'Other' as country, 
               (SELECT total_streams FROM total_countries) - (SELECT top_total FROM top_countries_total) as streams
        WHERE (SELECT total_streams FROM total_countries) > (SELECT top_total FROM top_countries_total)
      `;
      const topCountriesResult = await query(
        topCountriesQuery,
        streamingParams
      );
      topCountries = topCountriesResult.rows.filter((row) => row.streams > 0);

      // Get device types from streaming platforms with "Other" category
      const deviceTypesQuery = `
        WITH top_device_types AS (
          SELECT device_type, COALESCE(SUM(streams), 0) as streams
          FROM streaming_analytics 
          WHERE artist_id = $1 AND device_type IS NOT NULL ${songFilter} ${streamingPlatformFilter} ${dateFilter}
          GROUP BY device_type
      ORDER BY streams DESC
          LIMIT 5
        ),
        total_device_types AS (
          SELECT COALESCE(SUM(streams), 0) as total_streams
          FROM streaming_analytics 
          WHERE artist_id = $1 AND device_type IS NOT NULL ${songFilter} ${streamingPlatformFilter} ${dateFilter}
        ),
        top_device_types_total AS (
          SELECT COALESCE(SUM(streams), 0) as top_total
          FROM top_device_types
        )
        SELECT device_type, streams FROM top_device_types
        UNION ALL
        SELECT 'Other' as device_type, 
               (SELECT total_streams FROM total_device_types) - (SELECT top_total FROM top_device_types_total) as streams
        WHERE (SELECT total_streams FROM total_device_types) > (SELECT top_total FROM top_device_types_total)
      `;
      const deviceTypesResult = await query(deviceTypesQuery, streamingParams);
      deviceTypes = deviceTypesResult.rows.filter((row) => row.streams > 0);

      // Get daily stream activity from streaming platforms
      const dailyStreamsQuery = `
        SELECT date as reporting_date, COALESCE(SUM(streams), 0) as streams
        FROM streaming_analytics 
        WHERE artist_id = $1 ${songFilter} ${streamingPlatformFilter} ${dateFilter}
        GROUP BY date
        ORDER BY date ASC
      `;
      const dailyStreamsResult = await query(
        dailyStreamsQuery,
        streamingParams
      );
      dailyStreams = dailyStreamsResult.rows;
    }

    // Query Shazam analytics
    if (selectedSocialPlatforms.includes("Shazam") || platforms.length === 0) {
      const shazamParams = hasSongFilter
        ? [userId, songTitle]
        : [userId];

      const shazamQuery = `
        SELECT COALESCE(SUM(shazam_count), 0) as total_recognitions
        FROM shazam_analytics 
        WHERE artist_id = $1 ${shazamSongFilter}
      `;
      const shazamResult = await query(shazamQuery, shazamParams);
      shazamRecognitions = shazamResult.rows[0]?.total_recognitions || 0;

      // Get Shazam countries with "Other" category
      const shazamCountriesQuery = `
        WITH top_countries AS (
          SELECT country, COALESCE(SUM(shazam_count), 0) as count
          FROM shazam_analytics 
          WHERE artist_id = $1 AND country IS NOT NULL ${shazamSongFilter}
          GROUP BY country
          ORDER BY count DESC
          LIMIT 5
        ),
        total_countries AS (
          SELECT COALESCE(SUM(shazam_count), 0) as total_count
          FROM shazam_analytics 
          WHERE artist_id = $1 AND country IS NOT NULL ${shazamSongFilter}
        ),
        top_countries_total AS (
          SELECT COALESCE(SUM(count), 0) as top_total
          FROM top_countries
        )
        SELECT country, count FROM top_countries
        UNION ALL
        SELECT 'Other' as country, 
               (SELECT total_count FROM total_countries) - (SELECT top_total FROM top_countries_total) as count
        WHERE (SELECT total_count FROM total_countries) > (SELECT top_total FROM top_countries_total)
      `;
      const shazamCountriesResult = await query(
        shazamCountriesQuery,
        shazamParams
      );
      shazamCountries = shazamCountriesResult.rows.filter(
        (row) => row.count > 0
      );

      // Get Shazam cities with "Other" category
      const shazamCitiesQuery = `
        WITH top_cities AS (
          SELECT city, COALESCE(SUM(shazam_count), 0) as count
          FROM shazam_analytics 
          WHERE artist_id = $1 AND city IS NOT NULL ${shazamSongFilter}
          GROUP BY city
          ORDER BY count DESC
          LIMIT 5
        ),
        total_cities AS (
          SELECT COALESCE(SUM(shazam_count), 0) as total_count
          FROM shazam_analytics 
          WHERE artist_id = $1 AND city IS NOT NULL ${shazamSongFilter}
        ),
        top_cities_total AS (
          SELECT COALESCE(SUM(count), 0) as top_total
          FROM top_cities
        )
        SELECT city, count FROM top_cities
        UNION ALL
        SELECT 'Other' as city, 
               (SELECT total_count FROM total_cities) - (SELECT top_total FROM top_cities_total) as count
        WHERE (SELECT total_count FROM total_cities) > (SELECT top_total FROM top_cities_total)
      `;
      const shazamCitiesResult = await query(shazamCitiesQuery, shazamParams);
      shazamCities = shazamCitiesResult.rows.filter((row) => row.count > 0);
    }

    // Query TikTok analytics
    if (selectedSocialPlatforms.includes("TikTok") || platforms.length === 0) {
      const tiktokParams = hasSongFilter
        ? [userId, songTitle]
        : [userId];

      const tiktokQuery = `
        SELECT COALESCE(SUM(creations), 0) as total_usage
        FROM tiktok_analytics 
        WHERE artist_id = $1 ${songFilter}
      `;
      const tiktokResult = await query(tiktokQuery, tiktokParams);
      tiktokUsage = tiktokResult.rows[0]?.total_usage || 0;

      // Get TikTok views
      const tiktokViewsQuery = `
        SELECT COALESCE(SUM(video_views), 0) as total_views
        FROM tiktok_analytics 
        WHERE artist_id = $1 ${songFilter}
      `;
      const tiktokViewsResult = await query(tiktokViewsQuery, tiktokParams);
      tiktokViews = tiktokViewsResult.rows[0]?.total_views || 0;

      // Get TikTok territories with "Other" category
      const tiktokTerritoriesQuery = `
        WITH top_territories AS (
          SELECT territory, COALESCE(SUM(video_views), 0) as views
          FROM tiktok_analytics 
          WHERE artist_id = $1 AND territory IS NOT NULL ${songFilter}
          GROUP BY territory
          ORDER BY views DESC
          LIMIT 5
        ),
        total_territories AS (
          SELECT COALESCE(SUM(video_views), 0) as total_views
          FROM tiktok_analytics 
          WHERE artist_id = $1 AND territory IS NOT NULL ${songFilter}
        ),
        top_territories_total AS (
          SELECT COALESCE(SUM(views), 0) as top_total
          FROM top_territories
        )
        SELECT territory, views FROM top_territories
        UNION ALL
        SELECT 'Other' as territory, 
               (SELECT total_views FROM total_territories) - (SELECT top_total FROM top_territories_total) as views
        WHERE (SELECT total_views FROM total_territories) > (SELECT top_total FROM top_territories_total)
      `;
      const tiktokTerritoriesResult = await query(
        tiktokTerritoriesQuery,
        tiktokParams
      );
      tiktokTerritories = tiktokTerritoriesResult.rows.filter(
        (row) => row.views > 0
      );
    }

    // Query Meta analytics (separate from streaming)
    if (selectedSocialPlatforms.includes("Meta") || platforms.length === 0) {
      const metaParams = hasSongFilter
        ? [userId, songTitle]
        : [userId];

      const metaQuery = `
        SELECT COALESCE(SUM(event_count), 0) as total_events
        FROM meta_analytics 
        WHERE artist_id = $1 ${songFilter}
      `;
      const metaResult = await query(metaQuery, metaParams);
      metaViews = metaResult.rows[0]?.total_events || 0;

      // Get Meta territories with "Other" category
      const metaTerritoriesQuery = `
        WITH top_territories AS (
          SELECT territory, COALESCE(SUM(event_count), 0) as events
          FROM meta_analytics 
          WHERE artist_id = $1 AND territory IS NOT NULL ${songFilter}
          GROUP BY territory
          ORDER BY events DESC
          LIMIT 5
        ),
        total_territories AS (
          SELECT COALESCE(SUM(event_count), 0) as total_events
          FROM meta_analytics 
          WHERE artist_id = $1 AND territory IS NOT NULL ${songFilter}
        ),
        top_territories_total AS (
          SELECT COALESCE(SUM(events), 0) as top_total
          FROM top_territories
        )
        SELECT territory, events FROM top_territories
        UNION ALL
        SELECT 'Other' as territory, 
               (SELECT total_events FROM total_territories) - (SELECT top_total FROM top_territories_total) as events
        WHERE (SELECT total_events FROM total_territories) > (SELECT top_total FROM top_territories_total)
      `;
      const metaTerritoriesResult = await query(
        metaTerritoriesQuery,
        metaParams
      );
      metaTerritories = metaTerritoriesResult.rows.filter(
        (row) => row.events > 0
      );
    }

    return NextResponse.json({
      totalStreams,
      streamsByPlatform,
      // Trial users with used release get limited data
      topCountries: isTrialWithUsedRelease ? [] : topCountries,
      deviceTypes: isTrialWithUsedRelease ? [] : deviceTypes,
      dailyStreams,
      totalSaves: 0, // No saves in new schema, keeping for compatibility
      // Trial users with used release don't get social media data
      shazamRecognitions: isTrialWithUsedRelease ? 0 : shazamRecognitions,
      shazamCountries: isTrialWithUsedRelease ? [] : shazamCountries,
      shazamCities: isTrialWithUsedRelease ? [] : shazamCities,
      tiktokUsage: isTrialWithUsedRelease ? 0 : tiktokUsage,
      tiktokViews: isTrialWithUsedRelease ? 0 : tiktokViews,
      tiktokTerritories: isTrialWithUsedRelease ? [] : tiktokTerritories,
      metaViews: isTrialWithUsedRelease ? 0 : metaViews,
      metaTerritories: isTrialWithUsedRelease ? [] : metaTerritories,
      // Add trial status info for frontend
      trialStatus: {
        isTrial: subscription?.tier === "trial",
        isLimited: isTrialWithUsedRelease,
        dataDelayed: isTrialUser,
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
