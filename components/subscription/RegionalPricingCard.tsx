"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Globe, Zap, Users, Music, Star } from "lucide-react";
import { useRegionalPricing } from "@/hooks/use-regional-pricing";
import { useSubscription } from "@/context/SubscriptionContext";

interface RegionalPricingCardProps {
  tier: "plus" | "pro";
  billingCycle: "monthly" | "yearly";
  onSelectPlan: (priceId: string, billing: "monthly" | "yearly") => void;
}

export function RegionalPricingCard({
  tier,
  billingCycle,
  onSelectPlan,
}: RegionalPricingCardProps) {
  const {
    pricing,
    country,
    isLoading,
    isSupported,
    formatPrice,
    getYearlySavings,
  } = useRegionalPricing();
  const { subscription } = useSubscription();

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPricing = pricing[tier];
  const yearlySavings = getYearlySavings(tier);
  const isCurrentPlan = subscription?.tier === tier;

  const features = {
    plus: [
      "Unlimited Releases to 150+ Platforms Worldwide (Singles, EPs & Albums)",
      "Keep 100% of Royalties",
      "Spotify Verified Checkmark",
      "Custom Landing Page Builder",
      "Fan Zone Access",
      "Multi-Platform Analytics",
      "100,000 AI Tokens Per Month (ALERA AI Manager)",
    ],
    pro: [
      "Everything In Plus",
      "Direct Fan Monetisation (Landing Page Tips & Subscriptions)",
      "Unlimited AI Career Manager",
      "Advanced Fan Zone Access (Campaigns & Import)",
      "Deeper Career Analytics",
      "Guaranteed Release Protection",
      "Exclusive Access To New Features",
      "Priority Support",
    ],
  };

  return (
    <Card
      className={`w-full max-w-sm mx-auto relative ${
        isCurrentPlan ? "ring-2 ring-green-500" : ""
      }`}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500 text-white">
            <Check className="h-3 w-3 mr-1" />
            Current Plan
          </div>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">
          ALERA {tier === "plus" ? "Plus" : "Pro"}
        </CardTitle>

        <div className="space-y-2">
          {billingCycle === "monthly" && (
            <div className="text-4xl font-bold">
              {formatPrice(
                currentPricing.monthly.amount,
                currentPricing.monthly.currency
              )}
              <span className="text-lg font-normal text-gray-500">/month</span>
            </div>
          )}

          {billingCycle === "yearly" && (
            <div className="text-4xl font-bold">
              {formatPrice(
                currentPricing.yearly.amount,
                currentPricing.yearly.currency
              )}
              <span className="text-lg font-normal text-gray-500">/year</span>
            </div>
          )}
        </div>

        {/* Yearly Savings Badge */}
        {billingCycle === "yearly" && yearlySavings > 0 && (
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500 text-white animate-pulse pointer-events-none">
              🎉 Save {yearlySavings}%
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features[tier].map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={() =>
            onSelectPlan(
              billingCycle === "monthly"
                ? currentPricing.monthly.priceId
                : currentPricing.yearly.priceId,
              billingCycle
            )
          }
          disabled={isCurrentPlan}
          className={`w-full ${
            tier === "pro"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          }`}
        >
          {isCurrentPlan
            ? "Current Plan"
            : `Get ${tier === "plus" ? "Plus" : "Pro"}`}
        </Button>
      </CardContent>
    </Card>
  );
}
