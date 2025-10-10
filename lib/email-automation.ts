import { scheduleEmail, sendEmail } from "./email-service";
import { pool } from "./db";

// Background email processing - runs automatically
let emailProcessor: NodeJS.Timeout | null = null;
let isEmailProcessing = false; // Prevent overlapping runs

export interface EmailTrigger {
  userId: number;
  triggerType: "welcome" | "artist_page_tip" | "ai_career_manager";
  scheduledFor: Date;
}

// Email 1: Welcome email - triggered immediately after email verification
export async function triggerWelcomeEmail(userId: number): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send welcome email immediately
    const success = await sendEmail({
      to: user.email,
      templateName: "welcome",
      artistName,
    });

    if (success) {
      // Schedule the artist page tip email for 3 days later
      const tipEmailDate = new Date();
      tipEmailDate.setDate(tipEmailDate.getDate() + 3);
      await scheduleEmail(userId, "artistPageTip", tipEmailDate);

      // Schedule the AI career manager email for 7 days later
      const aiEmailDate = new Date();
      aiEmailDate.setDate(aiEmailDate.getDate() + 7);
      await scheduleEmail(userId, "aiCareerManager", aiEmailDate);

      // Schedule the time to make release email for 14 days later
      const releaseEmailDate = new Date();
      releaseEmailDate.setDate(releaseEmailDate.getDate() + 14);
      await scheduleEmail(userId, "timeToMakeRelease", releaseEmailDate);

      // Schedule the trial ending soon email for 23 days later (7 days before 30-day trial ends)
      const trialEndingDate = new Date();
      trialEndingDate.setDate(trialEndingDate.getDate() + 23);
      await scheduleEmail(userId, "trialEndingSoon", trialEndingDate);

      console.log(`Welcome email sent to user ${userId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error triggering welcome email:", error);
    return false;
  }
}

// Email 2: Artist page tip - triggered 3 days after signup (only if no page created)
export async function triggerArtistPageTipEmail(
  userId: number
): Promise<boolean> {
  try {
    // Check if user has created a public page
    const pageResult = await pool.query(
      "SELECT id FROM landing_pages WHERE artist_id = $1",
      [userId]
    );

    // If user already has a public page, don't send the tip email
    if (pageResult.rows.length > 0) {
      console.log(
        `User ${userId} already has a public page, skipping tip email`
      );
      return true;
    }

    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send artist page tip email
    const success = await sendEmail({
      to: user.email,
      templateName: "artistPageTip",
      artistName,
    });

    if (success) {
      console.log(`Artist page tip email sent to user ${userId}`);
    }

    return success;
  } catch (error) {
    console.error("Error triggering artist page tip email:", error);
    return false;
  }
}

// Email 3: AI Career Manager - triggered 7 days after signup
export async function triggerAICareerManagerEmail(
  userId: number
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send AI career manager email
    const success = await sendEmail({
      to: user.email,
      templateName: "aiCareerManager",
      artistName,
    });

    if (success) {
      console.log(`AI career manager email sent to user ${userId}`);
    }

    return success;
  } catch (error) {
    console.error("Error triggering AI career manager email:", error);
    return false;
  }
}

// Email 4: Time to Make a Release - triggered 14 days after signup (only if no release started)
export async function triggerTimeToMakeReleaseEmail(
  userId: number
): Promise<boolean> {
  try {
    // Check if user has started any releases
    const releaseResult = await pool.query(
      "SELECT id FROM releases WHERE artist_id = $1",
      [userId]
    );

    // If user already has releases, don't send the email
    if (releaseResult.rows.length > 0) {
      console.log(
        `User ${userId} already has releases, skipping time to make release email`
      );
      return true;
    }

    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send time to make release email
    const success = await sendEmail({
      to: user.email,
      templateName: "timeToMakeRelease",
      artistName,
    });

    if (success) {
      console.log(`Time to make release email sent to user ${userId}`);
    }

    return success;
  } catch (error) {
    console.error("Error triggering time to make release email:", error);
    return false;
  }
}

// Email 5: Trial Ending Soon - triggered 7 days before trial expires
export async function triggerTrialEndingSoonEmail(
  userId: number
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send trial ending soon email
    const success = await sendEmail({
      to: user.email,
      templateName: "trialEndingSoon",
      artistName,
    });

    if (success) {
      console.log(`Trial ending soon email sent to user ${userId}`);
    }

    return success;
  } catch (error) {
    console.error("Error triggering trial ending soon email:", error);
    return false;
  }
}

// Email 6: Trial Ended - triggered immediately when trial expires
export async function triggerTrialEndedEmail(userId: number): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send trial ended email
    const success = await sendEmail({
      to: user.email,
      templateName: "trialEnded",
      artistName,
    });

    if (success) {
      console.log(`Trial ended email sent to user ${userId}`);
    }

    return success;
  } catch (error) {
    console.error("Error triggering trial ended email:", error);
    return false;
  }
}

// Email 7: Release Submitted - triggered immediately when release is submitted
export async function triggerReleaseSubmittedEmail(
  userId: number,
  releaseTitle: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send release submitted email
    const success = await sendEmail({
      to: user.email,
      templateName: "releaseSubmitted",
      artistName,
      releaseTitle,
    });

    if (success) {
      console.log(
        `Release submitted email sent to user ${userId} for release: ${releaseTitle}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering release submitted email:", error);
    return false;
  }
}

// Email 8: Release Approved - triggered when admin approves release
export async function triggerReleaseApprovedEmail(
  userId: number,
  releaseTitle: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send release approved email
    const success = await sendEmail({
      to: user.email,
      templateName: "releaseApproved",
      artistName,
      releaseTitle,
    });

    if (success) {
      console.log(
        `Release approved email sent to user ${userId} for release: ${releaseTitle}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering release approved email:", error);
    return false;
  }
}

// Email 9: Release Live - triggered when admin changes status to "Live"
export async function triggerReleaseLiveEmail(
  userId: number,
  releaseTitle: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send release live email
    const success = await sendEmail({
      to: user.email,
      templateName: "releaseLive",
      artistName,
      releaseTitle,
    });

    if (success) {
      console.log(
        `Release live email sent to user ${userId} for release: ${releaseTitle}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering release live email:", error);
    return false;
  }
}

// Email 10: Release Rejected - triggered when admin changes status to "Rejected"
export async function triggerReleaseRejectedEmail(
  userId: number,
  releaseTitle: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send release rejected email
    const success = await sendEmail({
      to: user.email,
      templateName: "releaseRejected",
      artistName,
      releaseTitle,
    });

    if (success) {
      console.log(
        `Release rejected email sent to user ${userId} for release: ${releaseTitle}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering release rejected email:", error);
    return false;
  }
}

// Email 11: Payout Sent - triggered when admin marks withdrawal as "Paid"
export async function triggerPayoutSentEmail(
  userId: number,
  amount: string,
  payoutMethod: string,
  lastFour: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send payout sent email
    const success = await sendEmail({
      to: user.email,
      templateName: "payoutSent",
      artistName,
      amount,
      payoutMethod,
      lastFour,
    });

    if (success) {
      console.log(
        `Payout sent email sent to user ${userId} for amount: ${amount}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering payout sent email:", error);
    return false;
  }
}

// Email 12: Payout Method Approved - triggered when admin approves payout method
export async function triggerPayoutMethodApprovedEmail(
  userId: number,
  payoutMethod: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send payout method approved email
    const success = await sendEmail({
      to: user.email,
      templateName: "payoutMethodApproved",
      artistName,
      payoutMethod,
    });

    if (success) {
      console.log(
        `Payout method approved email sent to user ${userId} for method: ${payoutMethod}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering payout method approved email:", error);
    return false;
  }
}

// Email 13: Subscription Confirmation - triggered when user upgrades to Plus/Pro
export async function triggerSubscriptionConfirmationEmail(
  userId: number,
  tier: string,
  billingCycle: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send subscription confirmation email
    const success = await sendEmail({
      to: user.email,
      templateName: "subscriptionConfirmation",
      artistName,
      tier,
      billingCycle,
    });

    if (success) {
      console.log(
        `Subscription confirmation email sent to user ${userId} for tier: ${tier}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering subscription confirmation email:", error);
    return false;
  }
}

// Email 14: Subscription Payment Failed - triggered when recurring payment fails
export async function triggerSubscriptionPaymentFailedEmail(
  userId: number,
  tier: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send subscription payment failed email
    const success = await sendEmail({
      to: user.email,
      templateName: "subscriptionPaymentFailed",
      artistName,
      tier,
    });

    if (success) {
      console.log(
        `Subscription payment failed email sent to user ${userId} for tier: ${tier}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering subscription payment failed email:", error);
    return false;
  }
}

// Check for expired trials and send trial ended emails
export async function checkExpiredTrials(): Promise<void> {
  try {
    // Find users whose trial has expired but haven't been notified
    const expiredTrialsResult = await pool.query(`
      SELECT DISTINCT s.user_id, u.email, u.artist_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.tier = 'trial' 
        AND s.trial_expires_at <= NOW()
        AND s.status = 'active'
        AND NOT EXISTS (
          SELECT 1 FROM email_queue eq 
          WHERE eq.user_id = s.user_id 
            AND eq.template_name = 'trialEnded' 
            AND eq.sent = true
        )
    `);

    for (const trial of expiredTrialsResult.rows) {
      try {
        // Send trial ended email
        const success = await triggerTrialEndedEmail(trial.user_id);
        if (success) {
          console.log(`Trial ended email sent to user ${trial.user_id}`);
        }
      } catch (error) {
        console.error(
          `Error sending trial ended email to user ${trial.user_id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error checking expired trials:", error);
  }
}

// Process scheduled emails (runs automatically in background)
export async function processScheduledEmails(): Promise<void> {
  // Prevent overlapping runs
  if (isEmailProcessing) {
    console.log("[Email Processor] Already processing, skipping this run...");
    return;
  }

  isEmailProcessing = true;

  try {
    const { getScheduledEmails, markEmailAsSent } = await import(
      "./email-service"
    );
    const scheduledEmails = await getScheduledEmails();
    const now = new Date();

    for (const email of scheduledEmails) {
      if (email.scheduledFor <= now) {
        let success = false;

        switch (email.templateName) {
          case "artistPageTip":
            success = await triggerArtistPageTipEmail(email.userId);
            break;
          case "aiCareerManager":
            success = await triggerAICareerManagerEmail(email.userId);
            break;
          case "timeToMakeRelease":
            success = await triggerTimeToMakeReleaseEmail(email.userId);
            break;
          case "trialEndingSoon":
            success = await triggerTrialEndingSoonEmail(email.userId);
            break;
          default:
            console.error(`Unknown email template: ${email.templateName}`);
        }

        if (success) {
          await markEmailAsSent(email.id);
        }
      }
    }

    // Also check for expired trials
    await checkExpiredTrials();
  } catch (error) {
    console.error("Error processing scheduled emails:", error);
  } finally {
    isEmailProcessing = false;
  }
}

// Email 11: Takedown Request - triggered when user requests a takedown
export async function triggerTakedownRequestEmail(
  userId: number,
  releaseTitle: string
): Promise<boolean> {
  try {
    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, artist_name FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    const user = userResult.rows[0];
    const artistName = user.artist_name || "Artist";

    // Send takedown request email
    const success = await sendEmail({
      to: user.email,
      templateName: "takedownRequest",
      artistName,
      releaseTitle,
    });

    if (success) {
      console.log(
        `Takedown request email sent to user ${userId} for release: ${releaseTitle}`
      );
    }

    return success;
  } catch (error) {
    console.error("Error triggering takedown request email:", error);
    return false;
  }
}

// Start automatic email processing (runs every 5 minutes)
export function startEmailProcessor(): void {
  if (emailProcessor) {
    console.log("Email processor already running");
    return;
  }

  console.log("Starting automatic email processor...");

  // Don't process emails immediately on startup - wait for first interval
  // This prevents overwhelming the system on startup

  // Process every 5 minutes (not 1 minute!)
  emailProcessor = setInterval(async () => {
    console.log("Processing scheduled emails...");
    await processScheduledEmails();
  }, 5 * 60 * 1000); // 5 minutes (was incorrectly 1 minute)

  console.log("Email processor started - checking every 5 minutes");
}

// Stop email processing
export function stopEmailProcessor(): void {
  if (emailProcessor) {
    clearInterval(emailProcessor);
    emailProcessor = null;
    console.log("Email processor stopped");
  }
}
