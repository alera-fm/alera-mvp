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
import { useAuth } from "@/context/AuthContext";

interface WelcomePricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomePricingDialog({
  isOpen,
  onClose,
}: WelcomePricingDialogProps) {
  const { upgradeToTier } = useSubscription();
  const { pricing, country, isSupported, formatPrice } = useRegionalPricing();
  const { markWelcomeDialogShown } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"plus" | "pro" | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const handleUpgrade = async (tier: "plus" | "pro") => {
    setLoading(true);
    try {
      const checkoutUrl = await upgradeToTier(tier, country, billingCycle);
      if (checkoutUrl) {
        // Mark dialog as shown before redirecting
        await markWelcomeDialogShown();
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

  const handleClose = async () => {
    // Mark dialog as shown when user closes it
    await markWelcomeDialogShown();
    onClose();
  };

  const handleLater = async () => {
    // Mark dialog as shown when user clicks "Maybe Later"
    await markWelcomeDialogShown();
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold">
            Welcome to ALERA!
          </DialogTitle>
          <DialogDescription className="text-base md:text-lg mt-2">
            Choose your plan to start distributing your music and building your
            fanbase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Current trial info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  You're currently on a Free Trial
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create one free release to get started. Upgrade to unlock
                  unlimited releases and advanced features!
                </p>
              </div>
              <Badge variant="outline" className="bg-white dark:bg-gray-800">
                Free Trial
              </Badge>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-2">
            <span
              className={`text-sm font-medium ${
                billingCycle === "monthly" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className="mx-2"
            >
              <ArrowRight
                className={`h-4 w-4 transition-transform ${
                  billingCycle === "yearly" ? "rotate-180" : ""
                }`}
              />
            </Button>
            <span
              className={`text-sm font-medium ${
                billingCycle === "yearly" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Yearly
            </span>
            {billingCycle === "yearly" && (
              <Badge
                variant="secondary"
                className="ml-2 bg-green-500 text-white animate-pulse"
              >
                🎉 Save 20%
              </Badge>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Plus Plan */}
            <Card
              className={`relative transition-all duration-200 ${
                selectedTier === "plus"
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">Plus</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {billingCycle === "monthly"
                      ? formatPrice(
                          pricing.plus.monthly.amount,
                          pricing.plus.monthly.currency
                        )
                      : formatPrice(
                          pricing.plus.yearly.amount,
                          pricing.plus.yearly.currency
                        )}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {billingCycle === "monthly" ? "month" : "year"}
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-sm text-green-600 font-medium">
                      Save{" "}
                      {formatPrice(
                        pricing.plus.monthly.amount * 12 -
                          pricing.plus.yearly.amount,
                        pricing.plus.monthly.currency
                      )}
                      /year
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tierFeatures.plus.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade("plus")}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Start Plus Plan
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card
              className={`relative transition-all duration-200 ${
                selectedTier === "pro"
                  ? "ring-2 ring-purple-500 shadow-lg"
                  : "hover:shadow-md"
              } border-purple-200 dark:border-purple-800`}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-4 pt-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-xl">Pro</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {billingCycle === "monthly"
                      ? formatPrice(
                          pricing.pro.monthly.amount,
                          pricing.pro.monthly.currency
                        )
                      : formatPrice(
                          pricing.pro.yearly.amount,
                          pricing.pro.yearly.currency
                        )}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {billingCycle === "monthly" ? "month" : "year"}
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-sm text-green-600 font-medium">
                      Save{" "}
                      {formatPrice(
                        pricing.pro.monthly.amount * 12 -
                          pricing.pro.yearly.amount,
                        pricing.pro.monthly.currency
                      )}
                      /year
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tierFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => handleUpgrade("pro")}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Start Pro Plan
                      <Crown className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* ALERA Label Plan */}
            <Card className="relative transition-all duration-200 hover:shadow-md border-orange-200 dark:border-orange-800">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building className="h-6 w-6 text-orange-600" />
                  <CardTitle className="text-xl">ALERA Label</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-orange-600">
                    Custom
                  </div>
                  <div className="text-sm text-gray-500">
                    Enterprise Solution
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tierFeatures.label.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  onClick={() =>
                    window.open(
                      "mailto:contact@alera.fm?subject=ALERA Label Inquiry",
                      "_blank"
                    )
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  CONTACT US
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Maybe Later Button */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={handleLater}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Maybe Later - Continue with Free Trial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
