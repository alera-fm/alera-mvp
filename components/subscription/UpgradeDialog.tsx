"use client";

import { useState } from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useRegionalPricing } from "@/hooks/use-regional-pricing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Zap,
  Crown,
  Loader2,
  ArrowRight,
  Star,
  Globe,
  Building,
  Mail,
} from "lucide-react";

export function UpgradeDialog() {
  const {
    upgradeDialogOpen,
    closeUpgradeDialog,
    upgradeDialogReason,
    upgradeDialogTier,
    subscription,
    upgradeToTier,
  } = useSubscription();

  const { pricing, country, isSupported, formatPrice } = useRegionalPricing();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"plus" | "pro">(
    upgradeDialogTier
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const handleUpgrade = async (tier: "plus" | "pro") => {
    setLoading(true);
    try {
      const checkoutUrl = await upgradeToTier(tier, country, billingCycle);
      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error during upgrade:", error);
    } finally {
      setLoading(false);
    }
  };

  const tierFeatures = {
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
    label: [
      "Multiple Artist",
      '"Whitelabel" Label Dashboard',
      "Custom Enterprise Solutions",
      "Dedicated Support Team",
    ],
  };

  const getCurrentTierName = () => {
    if (subscription?.tier === "trial") return "Trial";
    if (subscription?.tier === "plus") return "Plus";
    if (subscription?.tier === "pro") return "Pro";
    return "Unknown";
  };

  return (
    <Dialog open={upgradeDialogOpen} onOpenChange={closeUpgradeDialog}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold">
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-sm md:text-lg">
            {upgradeDialogReason}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-4">
          {/* Current tier info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Current Plan: {getCurrentTierName()}
                </h3>
              </div>
              <Badge variant="outline">
                {subscription?.tier === "trial"
                  ? "Free Trial"
                  : subscription?.tier === "plus"
                  ? formatPrice(
                      pricing.plus.monthly.amount,
                      pricing.plus.monthly.currency
                    ) + "/month"
                  : formatPrice(
                      pricing.pro.monthly.amount,
                      pricing.pro.monthly.currency
                    ) + "/month"}
              </Badge>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
            </Button>
          </div>

          {billingCycle === "yearly" && (
            <div className="flex justify-center w-full">
              <Badge
                variant="secondary"
                className="ml-2 bg-green-500 text-white animate-pulse"
              >
                🎉 Save 20%
              </Badge>
            </div>
          )}

          {/* Tier comparison */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Plus Tier */}
            <Card
              className={`relative ${
                selectedTier === "plus" ? "ring-2 ring-purple-500" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Plus
                  </CardTitle>
                  <Badge className="bg-purple-500 text-white self-start sm:self-center">
                    {billingCycle === "monthly"
                      ? formatPrice(
                          pricing.plus.monthly.amount,
                          pricing.plus.monthly.currency
                        ) + "/month"
                      : formatPrice(
                          pricing.plus.yearly.amount,
                          pricing.plus.yearly.currency
                        ) + "/year"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Perfect for growing artists
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ul className="space-y-2">
                  {tierFeatures.plus.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade("plus")}
                  disabled={loading || subscription?.tier === "plus"}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {subscription?.tier === "plus"
                    ? "Current Plan"
                    : "Upgrade to Plus"}
                  {subscription?.tier !== "plus" && (
                    <ArrowRight className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card
              className={`relative ${
                selectedTier === "pro" ? "ring-2 ring-yellow-500" : ""
              } border-2 border-yellow-400 dark:border-yellow-500 shadow-lg`}
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white px-4 py-1 text-sm font-semibold shadow-md">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pt-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Pro
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white self-start sm:self-center">
                    {billingCycle === "monthly"
                      ? formatPrice(
                          pricing.pro.monthly.amount,
                          pricing.pro.monthly.currency
                        ) + "/month"
                      : formatPrice(
                          pricing.pro.yearly.amount,
                          pricing.pro.yearly.currency
                        ) + "/year"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For serious artists and labels
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ul className="space-y-2">
                  {tierFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade("pro")}
                  disabled={loading || subscription?.tier === "pro"}
                  className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Crown className="h-4 w-4 mr-2" />
                  )}
                  {subscription?.tier === "pro"
                    ? "Current Plan"
                    : "Upgrade to Pro"}
                  {subscription?.tier !== "pro" && (
                    <ArrowRight className="h-4 w-4 ml-2" />
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* ALERA Label Plan */}
            <Card className="relative border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5 text-orange-500" />
                    ALERA Label
                  </CardTitle>
                  <Badge className="bg-orange-500 text-white self-start sm:self-center">
                    Custom
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enterprise Solution
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ul className="space-y-2">
                  {tierFeatures.label.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() =>
                    window.open(
                      "mailto:contact@alera.fm?subject=ALERA Label Inquiry",
                      "_blank"
                    )
                  }
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  CONTACT US
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional info */}
          <div className="text-center text-xs md:text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-border/10 mt-6">
            <p>
              All plans include secure payment processing and can be cancelled
              anytime.
            </p>
            <p className="mt-1">
              Billing is monthly and you can upgrade or downgrade at any time.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
