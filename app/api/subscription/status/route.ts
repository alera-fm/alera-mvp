import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/subscription-middleware";
import {
  getSubscription,
  createSubscription,
  getDaysRemaining,
  isSubscriptionExpired,
  getDailyTokenUsage,
  getMonthlyTokenUsage,
  getPendingReleasesCount,
  getOnboardingProgress,
} from "@/lib/subscription-utils";
import { getStripeSubscription } from "@/lib/stripe";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await requireAuth(request);

    // Get user's subscription
    const subscription = await getSubscription(userId);

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // If paid tier but we don't have an expiration yet, fetch from Stripe as a fallback
    if (
      subscription.tier !== "trial" &&
      !subscription.subscription_expires_at &&
      subscription.stripe_subscription_id
    ) {
      try {
        const stripeSub = await getStripeSubscription(
          subscription.stripe_subscription_id
        );
        if (stripeSub?.current_period_end) {
          const expiresAt = new Date(stripeSub.current_period_end * 1000);
          // Persist for future requests
          await query(
            `UPDATE subscriptions SET subscription_expires_at = $1 WHERE id = $2`,
            [expiresAt.toISOString(), subscription.id]
          );
          // Mutate local object for response below
          // @ts-ignore – widen for runtime value
          subscription.subscription_expires_at = expiresAt as unknown as Date;
        }
      } catch (e) {
        console.warn(
          "Failed to backfill subscription_expires_at from Stripe:",
          e
        );
      }
    }

    // Calculate subscription details
    const isExpired = isSubscriptionExpired(subscription);
    const daysRemaining = getDaysRemaining(subscription);

    // Get onboarding progress for trial users
    const onboardingProgress =
      subscription.tier === "trial" ? await getOnboardingProgress(userId) : [];

    // Get current usage statistics
    const [dailyTokenUsage, monthlyTokenUsage, pendingReleases] =
      await Promise.all([
        getDailyTokenUsage(userId),
        subscription.tier === "plus"
          ? getMonthlyTokenUsage(userId, subscription.created_at)
          : 0,
        getPendingReleasesCount(userId),
      ]);

    // Calculate limits based on tier AND status
    const isActiveSubscription = subscription.status === "active";
    const isTrialOrPaymentIssue =
      subscription.tier === "trial" ||
      subscription.status === "pending_payment" ||
      subscription.status === "payment_failed";

    let aiTokenLimits = {
      used: 0,
      limit: 0,
      resetDate: new Date(),
      resetType: "unlimited" as "daily" | "monthly" | "unlimited",
    };

    if (isTrialOrPaymentIssue) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      aiTokenLimits = {
        used: dailyTokenUsage,
        limit: 1500,
        resetDate: tomorrow,
        resetType: "daily",
      };
    } else if (subscription.tier === "plus" && isActiveSubscription) {
      // Calculate next billing cycle date (30 days from subscription start)
      const startDate = new Date(subscription.created_at);
      const dayOfMonth = startDate.getDate();
      const now = new Date();
      const nextReset = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);

      // If we haven't reached the billing day this month, use this month
      // Otherwise, use next month
      if (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 1);
      }

      aiTokenLimits = {
        used: monthlyTokenUsage,
        limit: 100000,
        resetDate: nextReset,
        resetType: "monthly",
      };
    } else if (subscription.tier === "pro") {
      aiTokenLimits = {
        used: 0,
        limit: 0,
        resetDate: new Date(),
        resetType: "unlimited",
      };
    }

    // Check actual release count for trial users
    const releaseCountResult = await query(
      `SELECT COUNT(*) FROM releases WHERE artist_id = $1`,
      [userId]
    );
    const totalReleases = parseInt(releaseCountResult.rows[0]?.count || "0");

    // Release limits (users with payment issues get trial limits)
    const releaseLimits = {
      pending: pendingReleases,
      limit: isTrialOrPaymentIssue
        ? totalReleases >= 1
          ? 0 // Trial user has already created a release
          : 1 // Trial users get 1 release if they haven't created one yet
        : -1, // -1 means unlimited for paid users
    };

    // Feature access based on tier AND status (users with payment issues get trial access)
    const featureAccess = {
      // Release creation: Trial users can create ONE release, paid users can create unlimited
      release_creation:
        (subscription.tier === "trial" &&
          totalReleases < 1 &&
          isActiveSubscription) ||
        (subscription.tier !== "trial" && isActiveSubscription),

      // AI agent: Only active paid users OR trial users with limits
      ai_agent:
        (subscription.tier === "pro" && isActiveSubscription) ||
        (subscription.tier === "trial" &&
          subscription.status === "active" &&
          dailyTokenUsage < 1500) ||
        (subscription.tier === "plus" &&
          isActiveSubscription &&
          monthlyTokenUsage < 100000),

      // CRITICAL FIX: Fan features ONLY for active paid users OR actual trial users
      // Users with pending/failed payments get NO access to these premium features
      fan_campaigns:
        (subscription.tier === "trial" && subscription.status === "active") ||
        (subscription.tier === "pro" && isActiveSubscription) ||
        (subscription.tier === "plus" && isActiveSubscription),
      fan_import:
        (subscription.tier === "trial" && subscription.status === "active") ||
        (subscription.tier === "pro" && isActiveSubscription) ||
        (subscription.tier === "plus" && isActiveSubscription),
      tip_jar:
        (subscription.tier === "trial" && subscription.status === "active") ||
        (subscription.tier === "pro" && isActiveSubscription) ||
        (subscription.tier === "plus" && isActiveSubscription),
      paid_subscriptions:
        (subscription.tier === "trial" && subscription.status === "active") ||
        (subscription.tier === "pro" && isActiveSubscription) ||
        (subscription.tier === "plus" && isActiveSubscription),

      // Analytics access: Trial users get basic analytics only
      analytics_advanced:
        subscription.tier !== "trial" || !subscription.free_release_used,
    };

    // Safely serialize timestamps that may arrive as Date or string
    const serializeTs = (value: any): string | null => {
      if (!value) return null;
      try {
        const d = new Date(value);
        return isNaN(d.getTime()) ? String(value) : d.toISOString();
      } catch {
        return String(value);
      }
    };

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        isExpired,
        daysRemaining,
        trialExpiresAt: serializeTs(subscription.trial_expires_at),
        subscriptionExpiresAt: serializeTs(
          subscription.subscription_expires_at
        ),
        current_period_end: serializeTs(subscription.subscription_expires_at),
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        freeReleaseUsed: subscription.free_release_used || false,
        freeReleaseId: subscription.free_release_id || null,
      },
      usage: {
        aiTokens: aiTokenLimits,
        releases: releaseLimits,
      },
      featureAccess,
      onboarding: {
        progress: onboardingProgress,
        steps: [
          { id: "create_account", name: "Create your Account" },
          { id: "set_up_artist_profile", name: "Set up your Artist Profile" },
          { id: "upload_first_single", name: "Upload your first single" },
          {
            id: "complete_identity_check",
            name: "Complete your one-time identity check",
          },
          {
            id: "submit_release_to_stores",
            name: "Submit your release to stores!",
          },
        ],
      },
      upgradeAvailable: {
        canUpgradeToPlus: subscription.tier === "trial",
        canUpgradeToPro:
          subscription.tier === "trial" || subscription.tier === "plus",
      },
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get subscription status",
      },
      { status: 500 }
    );
  }
}
