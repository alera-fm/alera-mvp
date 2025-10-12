"use client";

import { RegionalPricingCard } from "@/components/subscription/RegionalPricingCard";
import { useSubscription } from "@/context/SubscriptionContext";
import { useRegionalPricing } from "@/hooks/use-regional-pricing";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Building, Mail } from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

function SubscriptionPageContent() {
  const { upgradeToTier } = useSubscription();
  const { country, isSupported } = useRegionalPricing();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const handleSelectPlan = async (
    tier: "plus" | "pro",
    priceId: string,
    billing: "monthly" | "yearly"
  ) => {
    try {
      const checkoutUrl = await upgradeToTier(tier, country, billing);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Start your music career with ALERA. Regional pricing available for
            your country.
          </p>

          {/* Yearly Savings Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-4 max-w-md mx-auto shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <div className="font-bold text-lg">
                  Save 20% on Yearly Plans!
                </div>
                <div className="text-sm opacity-90">
                  Get 2 months free when you pay annually
                </div>
              </div>
            </div>
          </div>

          {/* Global Billing Toggle */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingCycle("monthly")}
              className="text-sm"
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingCycle("yearly")}
              className="text-sm"
            >
              Yearly
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <RegionalPricingCard
            tier="plus"
            billingCycle={billingCycle}
            onSelectPlan={(priceId, billing) =>
              handleSelectPlan("plus", priceId, billing)
            }
          />

          <RegionalPricingCard
            tier="pro"
            billingCycle={billingCycle}
            onSelectPlan={(priceId, billing) =>
              handleSelectPlan("pro", priceId, billing)
            }
          />

          {/* ALERA Label Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-orange-200 dark:border-orange-800 p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building className="h-8 w-8 text-orange-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ALERA Label
                </h3>
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                Custom
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Enterprise Solution
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Multiple Artist</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">"Whitelabel" Label Dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom Enterprise Solutions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Dedicated Support Team</span>
              </li>
            </ul>

            <Button
              onClick={() =>
                window.open(
                  "mailto:contact@alera.fm?subject=ALERA Label Inquiry",
                  "_blank"
                )
              }
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              <Mail className="h-5 w-5 mr-2" />
              CONTACT US
            </Button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Feature Comparison
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Features
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    Trial
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    Plus
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    ALERA Label
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Releases to 150+ Platforms
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-blue-600 font-semibold">
                    1 Free Release
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Keep 100% of Royalties
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Spotify Verified Checkmark
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Custom Landing Page Builder
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    AI Tokens
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    1,500/day
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    100k/month
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Fan Zone Access
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Fan Monetization (Tips & Subscriptions)
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Multiple Artists
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Whitelabel Dashboard
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    Dedicated Support
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    ✗
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">
                    ✓
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionProvider>
      <SubscriptionPageContent />
    </SubscriptionProvider>
  );
}
