import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { pool } from "@/lib/db";
import {
  getSubscription,
  markFreeTrialRelease,
} from "@/lib/subscription-utils";

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const tokenData = verifyToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const data = await request.json();
    const { releaseId, step, formData, submitForReview = false } = data;

    if (!releaseId || !step || !formData) {
      return NextResponse.json(
        {
          error: "Release ID, step, and form data are required",
        },
        { status: 400 }
      );
    }

    // Check if release exists and belongs to user
    const existingRelease = await pool.query(
      "SELECT * FROM releases WHERE id = $1 AND artist_id = $2",
      [releaseId, tokenData.userId]
    );

    if (existingRelease.rows.length === 0) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    // Step-by-step validation
    const errors: string[] = [];
    const warnings: string[] = [];

    // Map step numbers to descriptive names
    const stepMap: { [key: number]: string } = {
      1: "basic_info",
      2: "tracks",
      3: "terms",
    };

    switch (step) {
      case 1: // Basic Info
        if (!formData.distribution_type) {
          errors.push("Distribution type is required");
        }
        if (!formData.artist_name?.trim()) {
          errors.push("Artist name is required");
        }
        if (!formData.release_title?.trim()) {
          errors.push("Release title is required");
        }
        if (!formData.record_label?.trim()) {
          errors.push("Record label is required");
        }
        if (!formData.c_line?.trim()) {
          errors.push("C-Line is required");
        }
        if (!formData.p_line?.trim()) {
          errors.push("P-Line is required");
        }
        if (!formData.primary_genre) {
          errors.push("Primary genre is required");
        }
        if (!formData.language) {
          errors.push("Language is required");
        }
        if (!formData.release_date) {
          errors.push("Release date is required");
        } else {
          // Validate release date is at least 7 days in the future
          const releaseDateTime = new Date(formData.release_date);
          const minReleaseDate = new Date();
          minReleaseDate.setDate(minReleaseDate.getDate() + 7);

          if (releaseDateTime < minReleaseDate) {
            errors.push("Release date must be at least 7 days in the future");
          }
        }
        break;

      case 2: // Tracks
        if (!formData.tracks || formData.tracks.length === 0) {
          errors.push("At least one track is required");
        } else {
          // Validate each track
          formData.tracks.forEach((track: any, index: number) => {
            if (!track.track_title?.trim()) {
              errors.push(`Track ${index + 1}: Title is required`);
            }
            if (!track.songwriters || track.songwriters.length === 0) {
              errors.push(
                `Track ${index + 1}: At least one songwriter is required`
              );
            } else {
              track.songwriters.forEach((songwriter: any, swIndex: number) => {
                if (
                  !songwriter.firstName?.trim() ||
                  !songwriter.lastName?.trim() ||
                  !songwriter.role?.trim()
                ) {
                  errors.push(
                    `Track ${index + 1}, Songwriter ${
                      swIndex + 1
                    }: First name, last name, and role are required`
                  );
                }
              });
            }
          });
        }
        break;

      case 3: // Terms
        if (!formData.terms_agreed) {
          errors.push("You must agree to the terms and conditions");
        }
        if (!formData.fake_streaming_agreement) {
          errors.push("You must agree to the fake streaming prevention terms");
        }
        if (!formData.distribution_agreement) {
          errors.push("You must agree to the distribution agreement");
        }
        if (!formData.artist_names_agreement) {
          errors.push("You must agree to the artist names agreement");
        }
        if (
          formData.selected_stores &&
          formData.selected_stores.includes("Snapchat") &&
          !formData.snapchat_terms
        ) {
          errors.push("You must agree to the Snapchat terms");
        }
        if (!formData.youtube_music_agreement) {
          errors.push("You must agree to the YouTube Music agreement");
        }
        break;

      default:
        errors.push("Invalid step number");
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
          warnings,
          step,
        },
        { status: 400 }
      );
    }

    // If validation passes, update the release
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update release with form data
      const updateResult = await client.query(
        `
        UPDATE releases SET
          distribution_type = $1, artist_name = $2, release_title = $3, record_label = $4,
          c_line = $5, p_line = $6, has_spotify_profile = $7, spotify_profile_url = $8, 
          has_apple_profile = $9, apple_profile_url = $10, additional_delivery = $11,
          primary_genre = $12, secondary_genre = $13, language = $14, explicit_lyrics = $15,
          instrumental = $16, version_info = $17, version_other = $18, release_date = $19, original_release_date = $20,
          previously_released = $21, album_cover_url = $22, selected_stores = $23, track_price = $24,
          status = $25, terms_agreed = $26, fake_streaming_agreement = $27, distribution_agreement = $28,
          artist_names_agreement = $29, snapchat_terms = $30, youtube_music_agreement = $31,
          current_step = $32, updated_at = CURRENT_TIMESTAMP
        WHERE id = $33 AND artist_id = $34
        RETURNING *
      `,
        [
          formData.distribution_type,
          formData.artist_name,
          formData.release_title,
          formData.record_label,
          formData.c_line || null,
          formData.p_line || null,
          formData.has_spotify_profile || false,
          formData.spotify_profile_url || null,
          formData.has_apple_profile || false,
          formData.apple_profile_url || null,
          JSON.stringify(formData.additional_delivery || []),
          formData.primary_genre,
          formData.secondary_genre,
          formData.language,
          formData.explicit_lyrics,
          formData.instrumental,
          formData.version_info,
          formData.version_other,
          formData.release_date || null,
          formData.original_release_date || null,
          formData.previously_released,
          formData.album_cover_url,
          JSON.stringify(formData.selected_stores || []),
          formData.track_price,
          submitForReview ? "pending" : "draft",
          formData.terms_agreed,
          formData.fake_streaming_agreement,
          formData.distribution_agreement,
          formData.artist_names_agreement,
          formData.snapchat_terms,
          formData.youtube_music_agreement,
          stepMap[step],
          releaseId,
          tokenData.userId,
        ]
      );

      // Handle tracks if provided (regardless of step)
      if (formData.tracks && formData.tracks.length > 0) {
        // Delete existing tracks
        await client.query("DELETE FROM tracks WHERE release_id = $1", [
          releaseId,
        ]);

        // Insert new tracks
        for (let i = 0; i < formData.tracks.length; i++) {
          const track = formData.tracks[i];
          await client.query(
            `
            INSERT INTO tracks (
              release_id, track_number, track_title, isrc, songwriters, genre, 
              audio_file_url, audio_file_name, artist_names, featured_artists,
              producer_credits, performer_credits, lyrics_text, has_lyrics
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          `,
            [
              releaseId,
              track.track_number || i + 1, // Use provided track_number or default to index + 1
              track.track_title || `Track ${i + 1}`, // Ensure we have a title
              track.isrc || "",
              JSON.stringify(track.songwriters || []),
              track.genre || formData.primary_genre || "Unknown", // Use track genre or fallback to release primary genre
              track.audio_file_url || track.audioFileUrl || "", // Audio file URL
              track.audio_file_name || track.audioFileName || "", // Audio file name
              track.artist_names || [], // Artist names array
              track.featured_artists || [], // Featured artists array
              JSON.stringify(track.producer_credits || []), // Producer credits
              JSON.stringify(track.performer_credits || []), // Performer credits
              track.lyrics_text || "", // Lyrics text
              track.has_lyrics || false, // Has lyrics flag
            ]
          );
        }
      }

      await client.query("COMMIT");

      // Trigger release submitted email if submitted for review
      if (submitForReview) {
        // Check if user has completed identity verification
        const userVerification = await client.query(
          `SELECT identity_verified FROM users WHERE id = $1`,
          [tokenData.userId]
        );

        if (!userVerification.rows[0]?.identity_verified) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            {
              error: "Identity verification required",
              message:
                "You must complete identity verification before submitting your release. Please verify your identity using one of your social media accounts.",
              requiresVerification: true,
            },
            { status: 403 }
          );
        }

        try {
          const { triggerReleaseSubmittedEmail } = await import(
            "@/lib/email-automation"
          );
          await triggerReleaseSubmittedEmail(
            tokenData.userId,
            formData.release_title
          );

          // If user is on trial, mark this as their free release
          const subscription = await getSubscription(tokenData.userId);
          if (
            subscription?.tier === "trial" &&
            !subscription.free_release_used
          ) {
            await markFreeTrialRelease(tokenData.userId, releaseId);
            console.log(
              `Marked release ${releaseId} as free trial release for user ${tokenData.userId}`
            );

            // Note: Onboarding progress is now detected dynamically from actual data
            // No need to update database tables
          }
        } catch (emailError) {
          console.error("Error sending release submitted email:", emailError);
          // Don't fail the release submission if email fails
        }
      }

      return NextResponse.json({
        success: true,
        message: submitForReview
          ? "Release submitted for review"
          : "Release updated successfully",
        release: updateResult.rows[0],
        step,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating release step:", error);
    return NextResponse.json(
      { error: "Failed to update release" },
      { status: 500 }
    );
  }
}
