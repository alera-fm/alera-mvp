"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Sparkles, Music, Users, BarChart3, Zap, Crown } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/context/AuthContext";

interface SubscriptionSuccessProps {
  tier?: string;
  billingCycle?: string;
}

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tier, setTier] = useState<string>("Plus");
  const [billingCycle, setBillingCycle] = useState<string>("Monthly");

  useEffect(() => {
    // Get tier and billing cycle from URL params or Stripe session
    const tierParam = searchParams?.get('tier') || 'Plus';
    const cycleParam = searchParams?.get('cycle') || 'Monthly';
    setTier(tierParam);
    setBillingCycle(cycleParam);
  }, [searchParams]);

  const getTierFeatures = (tier: string) => {
    const features = {
      Plus: [
        { icon: Music, title: "Unlimited Releases", description: "Distribute singles, EPs, and albums without limits" },
        { icon: Zap, title: "100,000 AI Tokens", description: "Monthly AI assistance for your music career" },
        { icon: Users, title: "Fan Zone Access", description: "Build and manage your fan community" },
        { icon: BarChart3, title: "Basic Analytics", description: "Track your music performance across platforms" }
      ],
      Pro: [
        { icon: Music, title: "Everything in Plus", description: "All Plus features included" },
        { icon: Crown, title: "Direct Fan Monetization", description: "Accept tips and fan subscriptions" },
        { icon: Zap, title: "Unlimited AI Career Manager", description: "Unlimited AI assistance for your career" },
        { icon: Users, title: "Advanced Fan Zone", description: "Campaigns, imports, and advanced fan management" },
        { icon: BarChart3, title: "Deeper Career Analytics", description: "Advanced insights into your music career" },
        { icon: Sparkles, title: "Priority Support", description: "Get help when you need it most" }
      ]
    };
    return features[tier as keyof typeof features] || features.Plus;
  };

  const getTierColor = (tier: string) => {
    return tier === 'Pro' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500';
  };

  const getTierIcon = (tier: string) => {
    return tier === 'Pro' ? Crown : Zap;
  };

  const features = getTierFeatures(tier);
  const TierIcon = getTierIcon(tier);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to ALERA {tier}! 🎵
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                Your subscription is now active
              </p>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {tier} Plan • {billingCycle} Billing
              </Badge>
            </div>

            {/* Subscription Details */}
            <Card className="mb-8 border-2 border-green-200 dark:border-green-800">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <TierIcon className="w-8 h-8" />
                  ALERA {tier} Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-4">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Hi {user?.artistName || user?.email?.split('@')[0] || 'Artist'}, your {tier} subscription is now active!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    You can now access all the features below and start building your music career.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Unlocked Features */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  Features You've Unlocked
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Here's what you can now do with your {tier} subscription:
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Create Your Public Page</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Build your artist hub in the "My Page" tab</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Start Your First Release</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Distribute your music in the "New Release" tab</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Set Up Your Wallet</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Connect payout methods in the "Wallet" tab</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/my-page')}
                  className="px-6"
                >
                  Build My Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/new-release')}
                  className="px-6"
                >
                  Start a Release
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/wallet')}
                  className="px-6"
                >
                  Set Up Wallet
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
              <p>Need help? Contact our support team at contact@alera.fm</p>
              <p className="text-sm mt-2">Welcome to the ALERA community! 🎵</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
