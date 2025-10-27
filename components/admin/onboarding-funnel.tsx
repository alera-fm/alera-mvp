"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  FileUp,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FunnelData {
  totalTrialSignups: number;
  trialUsersAttemptingIdCheck: number;
  trialUsersPassingIdCheck: number;
  trialUsersSubmittingFirstRelease: number;
  trialUsersFirstReleaseApproved: number;
}

export function OnboardingFunnel() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchFunnelData();
  }, [timeRange]);

  const fetchFunnelData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setLoading(true);
      const response = await fetch(
        `/api/admin/onboarding-funnel?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching funnel data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  const getConversionRate = (current: number, previous: number) => {
    const rate = calculateConversionRate(current, previous);
    const isIncrease = current > previous;
    return {
      rate: `${rate}%`,
      isIncrease,
      color: isIncrease ? "text-success" : "text-destructive",
      icon: isIncrease ? TrendingUp : TrendingDown,
    };
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Onboarding Funnel
            </CardTitle>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-muted rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Onboarding Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Failed to load funnel data
          </p>
        </CardContent>
      </Card>
    );
  }

  const funnelSteps = [
    {
      title: "Total Trial Sign-ups",
      value: data.totalTrialSignups,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Users with trial subscription",
    },
    {
      title: "Trial Users Attempting ID Check",
      value: data.trialUsersAttemptingIdCheck,
      icon: UserCheck,
      color: "text-warning",
      bgColor: "bg-warning/10",
      description: "Trial users with pending ID verification",
      conversion: getConversionRate(
        data.trialUsersAttemptingIdCheck,
        data.totalTrialSignups
      ),
    },
    {
      title: "Trial Users Passing ID Check",
      value: data.trialUsersPassingIdCheck,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Trial users with approved ID verification",
      conversion: getConversionRate(
        data.trialUsersPassingIdCheck,
        data.trialUsersAttemptingIdCheck
      ),
    },
    {
      title: "Trial Users Submitting First Release",
      value: data.trialUsersSubmittingFirstRelease,
      icon: FileUp,
      color: "text-info",
      bgColor: "bg-info/10",
      description: "Trial users who submitted their first release",
      conversion: getConversionRate(
        data.trialUsersSubmittingFirstRelease,
        data.trialUsersPassingIdCheck
      ),
    },
    {
      title: "Trial Users First Release Approved",
      value: data.trialUsersFirstReleaseApproved,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Trial users with approved/completed releases",
      conversion: getConversionRate(
        data.trialUsersFirstReleaseApproved,
        data.trialUsersSubmittingFirstRelease
      ),
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Onboarding Funnel
          </CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelSteps.map((step, index) => {
            const Icon = step.icon;
            const ConversionIcon = step.conversion?.icon;

            return (
              <div
                key={step.title}
                className={`relative p-4 rounded-lg border-2 ${
                  index === 0 ? "border-primary" : "border-border"
                }`}
              >
                {/* Funnel Arrow */}
                {index < funnelSteps.length - 1 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${step.bgColor}`}>
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {step.value.toLocaleString()}
                    </div>
                    {step.conversion && (
                      <div className="flex items-center gap-1 text-sm">
                        <ConversionIcon
                          className={`h-3 w-3 ${step.conversion.color}`}
                        />
                        <span className={step.conversion.color}>
                          {step.conversion.rate} conversion
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {index > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          step.color === "text-primary"
                            ? "bg-primary"
                            : step.color === "text-warning"
                            ? "bg-warning"
                            : step.color === "text-success"
                            ? "bg-success"
                            : "bg-info"
                        }`}
                        style={{
                          width: `${Math.min(
                            (step.value / funnelSteps[0].value) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Conversion Rate */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">
                Overall Conversion Rate
              </h4>
              <p className="text-sm text-muted-foreground">
                Trial sign-ups to approved releases
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {calculateConversionRate(
                  data.trialUsersFirstReleaseApproved,
                  data.totalTrialSignups
                )}
                %
              </div>
              <Badge variant="outline" className="mt-1">
                {data.trialUsersFirstReleaseApproved} of{" "}
                {data.totalTrialSignups}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
