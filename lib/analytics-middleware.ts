import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { getSubscription } from "./subscription-utils";

// Middleware to check if user has access to advanced analytics
export async function requireAnalyticsAccess(
  request: NextRequest,
  advanced: boolean = false
): Promise<number> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    // If not requesting advanced analytics, allow access
    if (!advanced) {
      return decoded.userId;
    }

    // Check subscription status for advanced analytics
    const subscription = await getSubscription(decoded.userId);

    if (!subscription) {
      throw new Error("No subscription found");
    }

    // Trial users with free release used get limited analytics
    if (subscription.tier === "trial" && subscription.free_release_used) {
      throw new Error("Advanced analytics require a paid subscription");
    }

    return decoded.userId;
  } catch (error) {
    throw error;
  }
}

// Helper function to handle trial analytics limitations
export async function getTrialAnalyticsDelay(userId: number): Promise<boolean> {
  try {
    const subscription = await getSubscription(userId);

    // If not a trial user, no delay
    if (!subscription || subscription.tier !== "trial") {
      return false;
    }

    // Trial users get delayed analytics (weekly updates instead of daily)
    return true;
  } catch (error) {
    console.error("Error checking trial analytics delay:", error);
    return false;
  }
}
