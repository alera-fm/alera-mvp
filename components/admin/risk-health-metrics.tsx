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
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface RiskHealthData {
  releaseRejectionRate: number;
  userEngagementRate: number;
  previousPeriod: {
    releaseRejectionRate: number;
    userEngagementRate: number;
  };
  engagementTrendData: Array<{
    date: string;
    engagementRate: number;
    movingAverage: number;
  }>;
  totalReleases: number;
  rejectedReleases: number;
  totalUsers: number;
  activeUsers: number;
}

export function RiskHealthMetrics() {
  const [data, setData] = useState<RiskHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchRiskHealthData();
  }, [timeRange]);

  const fetchRiskHealthData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setLoading(true);
      const response = await fetch(
        `/api/admin/risk-health-metrics?range=${timeRange}`,
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
      console.error("Error fetching risk health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const change = calculatePercentageChange(current, previous);
    const isPositive = change >= 0;
    const isSignificant = Math.abs(change) >= 1;

    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      isSignificant,
      color: isPositive ? "text-success" : "text-destructive",
      bgColor: isPositive ? "bg-success/10" : "bg-destructive/10",
      icon: isPositive ? TrendingUp : TrendingDown,
    };
  };

  const getRejectionRateColor = (rate: number) => {
    if (rate <= 5) return "text-success";
    if (rate <= 15) return "text-warning";
    return "text-destructive";
  };

  const getRejectionRateBgColor = (rate: number) => {
    if (rate <= 5) return "bg-success/10";
    if (rate <= 15) return "bg-warning/10";
    return "bg-destructive/10";
  };

  const getRejectionRateStatus = (rate: number) => {
    if (rate <= 5) return "Excellent";
    if (rate <= 15) return "Good";
    if (rate <= 25) return "Fair";
    return "Poor";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Risk & Health Metrics
            </CardTitle>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded animate-pulse"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
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
            <AlertTriangle className="h-5 w-5 text-primary" />
            Risk & Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Failed to load risk health data
          </p>
        </CardContent>
      </Card>
    );
  }

  const rejectionChange = getChangeIndicator(
    data.releaseRejectionRate,
    data.previousPeriod.releaseRejectionRate
  );
  const engagementChange = getChangeIndicator(
    data.userEngagementRate,
    data.previousPeriod.userEngagementRate
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Risk & Health Metrics
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Release Rejection Rate - Gauge */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getRejectionRateBgColor(
                      data.releaseRejectionRate
                    )}`}
                  >
                    <XCircle
                      className={`h-5 w-5 ${getRejectionRateColor(
                        data.releaseRejectionRate
                      )}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Release Rejection Rate
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data.rejectedReleases} of {data.totalReleases} releases
                      rejected
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-3xl font-bold ${getRejectionRateColor(
                      data.releaseRejectionRate
                    )}`}
                  >
                    {data.releaseRejectionRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {rejectionChange.icon && (
                      <rejectionChange.icon
                        className={`h-3 w-3 ${rejectionChange.color}`}
                      />
                    )}
                    <span className={rejectionChange.color}>
                      {rejectionChange.value}%
                    </span>
                    <span className="text-muted-foreground">
                      vs last period
                    </span>
                  </div>
                </div>
              </div>

              {/* Gauge Visualization */}
              <div className="relative w-full h-32 mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    {/* Background Circle */}
                    <div className="absolute inset-0 rounded-full border-8 border-muted"></div>

                    {/* Progress Circle */}
                    <div
                      className={`absolute inset-0 rounded-full border-8 border-t-8 transition-all duration-1000 ${
                        data.releaseRejectionRate <= 5
                          ? "border-success"
                          : data.releaseRejectionRate <= 15
                          ? "border-warning"
                          : "border-destructive"
                      }`}
                      style={{
                        transform: `rotate(${
                          (data.releaseRejectionRate / 100) * 360 - 90
                        }deg)`,
                      }}
                    ></div>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold ${getRejectionRateColor(
                            data.releaseRejectionRate
                          )}`}
                        >
                          {data.releaseRejectionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getRejectionRateStatus(data.releaseRejectionRate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge
                  variant={
                    data.releaseRejectionRate <= 5
                      ? "default"
                      : data.releaseRejectionRate <= 15
                      ? "secondary"
                      : "destructive"
                  }
                  className={`${
                    data.releaseRejectionRate <= 5
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : data.releaseRejectionRate <= 15
                      ? "bg-warning/10 text-warning hover:bg-warning/20"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }`}
                >
                  {getRejectionRateStatus(data.releaseRejectionRate)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* User Engagement Rate - Line Chart */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Activity className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      User Engagement Rate
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data.activeUsers} of {data.totalUsers} users active (30d)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-info">
                    {data.userEngagementRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {engagementChange.icon && (
                      <engagementChange.icon
                        className={`h-3 w-3 ${engagementChange.color}`}
                      />
                    )}
                    <span className={engagementChange.color}>
                      {engagementChange.value}%
                    </span>
                    <span className="text-muted-foreground">
                      vs last period
                    </span>
                  </div>
                </div>
              </div>

              {/* Engagement Trend Chart */}
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.engagementTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted))"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name === "engagementRate"
                          ? "Engagement Rate"
                          : "7-Day Average",
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagementRate"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={1}
                      dot={false}
                      strokeDasharray="2 2"
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAverage"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "hsl(var(--info))",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-muted-foreground"></div>
                  <span className="text-muted-foreground">Daily Rate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-info"></div>
                  <span className="text-muted-foreground">7-Day Average</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Rejection Rate
              </div>
              <div
                className={`text-lg font-semibold ${getRejectionRateColor(
                  data.releaseRejectionRate
                )}`}
              >
                {data.releaseRejectionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {getRejectionRateStatus(data.releaseRejectionRate)} Quality
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Engagement Rate
              </div>
              <div className="text-lg font-semibold text-info">
                {data.userEngagementRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {data.activeUsers} active users
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
