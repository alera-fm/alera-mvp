"use client";

import { RegionalPricingCard } from '@/components/subscription/RegionalPricingCard';
import { useSubscription } from '@/context/SubscriptionContext';
import { useRegionalPricing } from '@/hooks/use-regional-pricing';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { useEffect, useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function SubscriptionPageContent() {
  const { upgradeToTier } = useSubscription();
  const { country, isSupported } = useRegionalPricing();

  const handleSelectPlan = async (tier: 'plus' | 'pro', priceId: string, billing: 'monthly' | 'yearly') => {
    try {
      const checkoutUrl = await upgradeToTier(tier, country, billing);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
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
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start your music career with ALERA. Regional pricing available for your country.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <RegionalPricingCard 
            tier="plus" 
            onSelectPlan={(priceId, billing) => handleSelectPlan('plus', priceId, billing)}
          />
          
          <RegionalPricingCard 
            tier="pro" 
            onSelectPlan={(priceId, billing) => handleSelectPlan('pro', priceId, billing)}
          />
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Releases</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">0</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">AI Tokens</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">1,500/day</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">100k/month</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Fan Zone</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Email Campaigns</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Fan Import</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Monetization</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional Pricing Info */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Regional Pricing Available
          </h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              🇮🇳 India: ₹249/month
            </span>
            <span className="flex items-center gap-1">
              🇿🇦 South Africa: R79/month
            </span>
            <span className="flex items-center gap-1">
              🇹🇷 Turkey: 99.99 TRY/month
            </span>
            <span className="flex items-center gap-1">
              🌍 Other: $4.99/month
            </span>
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
