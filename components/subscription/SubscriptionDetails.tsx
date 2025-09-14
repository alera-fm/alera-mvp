"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, Crown, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/context/SubscriptionContext";

interface Subscription {
  tier: 'trial' | 'plus' | 'pro';
  status: 'active' | 'expired' | 'cancelled' | 'cancelling';
  trialExpiresAt?: string;
  subscriptionExpiresAt?: string;
  current_period_end?: string;
  stripeCustomerId?: string;
  daysRemaining: number;
}

export function SubscriptionDetails() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const { toast } = useToast();
  const { showUpgradeDialog } = useSubscription();

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/subscription/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      } else {
        throw new Error("Failed to fetch subscription details");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setManagingSubscription(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href // Return to the current page
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        } else {
          throw new Error("No portal URL returned");
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create portal session");
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to access billing portal",
        variant: "destructive",
      });
    } finally {
      setManagingSubscription(false);
    }
  };

  const getTierDetails = (tier: string) => {
    switch (tier) {
      case 'trial':
        return {
          name: 'Trial',
          description: 'Free 3-month trial with basic features',
          icon: Zap,
          color: 'bg-blue-500',
          textColor: 'text-blue-500',
          features: [
            '1 Single release',
            '1,500 AI tokens per day',
            'Basic fan management',
          ],
        };
      case 'plus':
        return {
          name: 'Plus',
          description: 'Perfect for growing artists',
          icon: Crown,
          color: 'bg-purple-500',
          textColor: 'text-purple-500',
          price: '$4.99/month',
          features: [
            'Unlimited releases (Singles, EPs, & Albums)',
            '100,000 AI tokens per month',
            'Fan Zone Access',
            'Basic analytics',
          ],
        };
      case 'pro':
        return {
          name: 'Pro',
          description: 'For serious artists and labels',
          icon: Crown,
          color: 'bg-gradient-to-r from-purple-600 to-yellow-500',
          textColor: 'text-yellow-500',
          price: '$14.99/month',
          features: [
            'Everything in Plus',
            'Direct Fan Monetisation (Tips & Subscriptions)',
            'Unlimited AI Career Manager',
            'Advanced Fan Zone Access (Campaigns & Import)',
            'Deeper Career Analytics',
            'Priority Support',
          ],
        };
      default:
        return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'cancelling':
        return <Badge className="bg-orange-500">Cancelling</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">No Subscription Found</CardTitle>
          <CardDescription>
            There was an error loading your subscription details. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tierDetails = getTierDetails(subscription.tier);

  if (!tierDetails) return null;

  const Icon = tierDetails.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${tierDetails.textColor}`} />
              {tierDetails.name} Plan
              {getStatusBadge(subscription.status)}
            </CardTitle>
            <CardDescription>{tierDetails.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Manage Subscription Button - Shows Stripe Portal */}
            {(subscription.stripeCustomerId || subscription.tier !== 'trial') && (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={managingSubscription}
                className="flex items-center gap-2"
                title="Access Stripe Portal to manage payment methods, view invoices, and more"
              >
                {managingSubscription ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Manage Billing
              </Button>
            )}

            {/* Upgrade Button */}
            {subscription.tier !== 'pro' && subscription.status !== 'cancelled' && (
              <Button
                onClick={async () => {
                  try {
                    // For existing paid subscribers, redirect to portal
                    if (subscription.stripeCustomerId && subscription.tier !== 'trial') {
                      await handleManageSubscription();
                      return;
                    }

                    // For trial users, show upgrade dialog
                    const targetTier = subscription.tier === 'trial' ? 'plus' : 'pro';
                    showUpgradeDialog(
                      `Upgrade to ${targetTier === 'plus' ? 'Plus' : 'Pro'}`,
                      targetTier
                    );
                  } catch (error) {
                    console.error('Error handling upgrade:', error);
                    toast({
                      title: "Error",
                      description: "Failed to process upgrade request. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                className="flex items-center gap-2"
                title={`Upgrade to ${subscription.tier === 'trial' ? 'Plus ($4.99/month)' : 'Pro ($14.99/month)'}`}
              >
                <Crown className="h-4 w-4" />
                Upgrade to {subscription.tier === 'trial' ? 'Plus' : 'Pro'}
              </Button>
            )}

          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Details */}
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </h4>
              <p className="font-medium">{subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {subscription.tier === 'trial' 
                  ? 'Trial Expires' 
                  : subscription.status === 'cancelling' 
                    ? 'Active Until' 
                    : 'Next Billing Date'}
              </h4>
              <p className="font-medium">
                {subscription.tier === 'trial' ? (
                  `${formatDate(subscription.trialExpiresAt)} (${subscription.daysRemaining} days remaining)`
                ) : (
                  formatDate(subscription.current_period_end || subscription.subscriptionExpiresAt)
                )}
              </p>
            </div>
          </div>

          {/* Cancellation Notice */}
          {subscription.status === 'cancelling' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                Subscription Cancelled
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Your subscription has been cancelled but will remain active until{' '}
                <span className="font-medium">
                  {formatDate(subscription.current_period_end || subscription.subscriptionExpiresAt)}
                </span>. 
                You can continue using all {tierDetails.name} features until then.
              </p>
            </div>
          )}

          {/* Price */}
          {tierDetails.price && (
            <div className="pt-4 border-t">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{tierDetails.price}</span>
                <span className="text-gray-500">per month</span>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Included Features</h4>
            <ul className="space-y-2">
              {tierDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <svg
                    className={`h-4 w-4 ${tierDetails.textColor}`}
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
