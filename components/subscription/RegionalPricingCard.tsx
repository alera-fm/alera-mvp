"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Globe, Zap, Users, Music, Star } from 'lucide-react';
import { useRegionalPricing } from '@/hooks/use-regional-pricing';
import { useSubscription } from '@/context/SubscriptionContext';

interface RegionalPricingCardProps {
  tier: 'plus' | 'pro';
  onSelectPlan: (priceId: string, billing: 'monthly' | 'yearly') => void;
}

export function RegionalPricingCard({ tier, onSelectPlan }: RegionalPricingCardProps) {
  const { pricing, country, isLoading, isSupported, formatPrice, getYearlySavings } = useRegionalPricing();
  const { subscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
      'Unlimited releases',
      '100k AI tokens/month',
      'Fan Zone access',
      'Basic analytics',
      'Email support'
    ],
    pro: [
      'Everything in Plus',
      'Unlimited AI tokens',
      'Email campaigns',
      'Fan import tools',
      'Monetization features',
      'Priority support'
    ]
  };

  return (
    <Card className={`w-full max-w-sm mx-auto relative ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-green-500 text-white">
            <Check className="h-3 w-3 mr-1" />
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isSupported ? `Pricing for ${country}` : 'Default Pricing'}
          </span>
        </div>
        
        <CardTitle className="text-2xl font-bold">
          ALERA {tier === 'plus' ? 'Plus' : 'Pro'}
        </CardTitle>
        
        <div className="space-y-2">
          <div className="text-4xl font-bold">
            {formatPrice(currentPricing.monthly.amount, currentPricing.monthly.currency)}
            <span className="text-lg font-normal text-gray-500">/month</span>
          </div>
          
          {billingCycle === 'yearly' && (
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(currentPricing.yearly.amount, currentPricing.yearly.currency)}
              <span className="text-sm font-normal text-gray-500">/year</span>
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillingCycle('monthly')}
            className="text-xs"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillingCycle('yearly')}
            className="text-xs"
          >
            Yearly
          </Button>
          {billingCycle === 'yearly' && yearlySavings > 0 && (
            <Badge variant="secondary" className="text-xs">
              Save {yearlySavings}%
            </Badge>
          )}
        </div>
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
          onClick={() => onSelectPlan(
            billingCycle === 'monthly' ? currentPricing.monthly.priceId : currentPricing.yearly.priceId,
            billingCycle
          )}
          disabled={isCurrentPlan}
          className={`w-full ${
            tier === 'pro' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
              : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : `Get ${tier === 'plus' ? 'Plus' : 'Pro'}`}
        </Button>

        {!isSupported && (
          <p className="text-xs text-gray-500 text-center">
            Pricing in USD. Regional pricing coming soon.
        </p>
        )}
      </CardContent>
    </Card>
  );
}
