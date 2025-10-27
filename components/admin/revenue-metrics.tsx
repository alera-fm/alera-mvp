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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
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

interface RevenueData {
  trialToPaidConversionRate: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  previousPeriod: {
    trialToPaidConversionRate: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
  };
  trendData: Array<{
    period: string;
    conversionRate: number;
    mrr: number;
    arpu: number;
  }>;
}

export function RevenueMetrics() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setLoading(true);
      const response = await fetch(
        `/api/admin/revenue-metrics?range=${timeRange}`,
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
      console.error("Error fetching revenue data:", error);
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
      icon: isPositive ? ArrowUpRight : ArrowDownRight,
    };
  };

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue Metrics
            </CardTitle>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-muted rounded animate-pulse"
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
            <DollarSign className="h-5 w-5 text-primary" />
            Revenue Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Failed to load revenue data
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      title: "Trial-to-Paid Conversion Rate",
      value: data.trialToPaidConversionRate,
      previousValue: data.previousPeriod.trialToPaidConversionRate,
      format: formatPercentage,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Percentage of trial users who convert to paid",
      trendData: data.trendData.map((d) => ({
        period: d.period,
        value: d.conversionRate,
      })),
    },
    {
      title: "Monthly Recurring Revenue",
      value: data.monthlyRecurringRevenue,
      previousValue: data.previousPeriod.monthlyRecurringRevenue,
      format: (value: number) => formatCurrency(value),
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Total monthly recurring revenue",
      trendData: data.trendData.map((d) => ({
        period: d.period,
        value: d.mrr,
      })),
    },
    {
      title: "Average Revenue Per User",
      value: data.averageRevenuePerUser,
      previousValue: data.previousPeriod.averageRevenuePerUser,
      format: (value: number) => formatCurrency(value),
      icon: Calculator,
      color: "text-info",
      bgColor: "bg-info/10",
      description: "MRR divided by total paid users",
      trendData: data.trendData.map((d) => ({
        period: d.period,
        value: d.arpu,
      })),
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Revenue Metrics
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const change = getChangeIndicator(
              metric.value,
              metric.previousValue
            );
            const ChangeIcon = change.icon;

            return (
              <Card key={metric.title} className="relative overflow-hidden">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {metric.format(metric.value)}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ChangeIcon className={`h-3 w-3 ${change.color}`} />
                        <span className={change.color}>{change.value}%</span>
                        <span className="text-muted-foreground">
                          vs last period
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-foreground mb-1">
                      {metric.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>

                  {/* Trend Chart */}
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metric.trendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted))"
                        />
                        <XAxis
                          dataKey="period"
                          hide
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis hide stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number) => [
                            metric.format(value),
                            metric.title,
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={
                            metric.color === "text-primary"
                              ? "hsl(var(--primary))"
                              : metric.color === "text-success"
                              ? "hsl(var(--success))"
                              : "hsl(var(--info))"
                          }
                          strokeWidth={2}
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill:
                              metric.color === "text-primary"
                                ? "hsl(var(--primary))"
                                : metric.color === "text-success"
                                ? "hsl(var(--success))"
                                : "hsl(var(--info))",
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Change Badge */}
                  <div className="mt-3">
                    <Badge
                      variant={change.isPositive ? "default" : "destructive"}
                      className={`${
                        change.isPositive
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      }`}
                    >
                      {change.isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {change.value}% change
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Conversion Rate
              </div>
              <div className="text-lg font-semibold text-foreground">
                {formatPercentage(data.trialToPaidConversionRate)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Total MRR
              </div>
              <div className="text-lg font-semibold text-foreground">
                {formatCurrency(data.monthlyRecurringRevenue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">ARPU</div>
              <div className="text-lg font-semibold text-foreground">
                {formatCurrency(data.averageRevenuePerUser)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
