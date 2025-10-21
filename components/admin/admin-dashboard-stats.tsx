"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Music,
  UserCheck,
  DollarSign,
  CreditCard,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  FileUp,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminStatsCard } from "./admin-stats-card";
import { AdminQuickSearch } from "./admin-quick-search";
import type { DashboardStats } from "@/types/admin";

export function AdminDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setLoading(true);
      const response = await fetch(
        `/api/admin/dashboard-stats?range=${timeRange}`,
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
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[140px] bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[140px] bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `$${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Needs Your Attention */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Needs Your Attention
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatsCard
            title="Releases to Review"
            value={data.actionableItems.pendingReleases}
            icon={Music}
            variant="warning"
            onClick={() => router.push("/admin/dashboard/release-management")}
          />
          <AdminStatsCard
            title="Pending Identity Verifications"
            value={data.actionableItems.pendingIdentityVerifications}
            icon={UserCheck}
            variant="warning"
            onClick={() =>
              router.push("/admin/dashboard/identity-verification")
            }
          />
          <AdminStatsCard
            title="Pending Payout Requests"
            value={data.actionableItems.pendingPayoutRequests}
            icon={DollarSign}
            variant="warning"
            onClick={() =>
              router.push("/admin/dashboard/withdrawal-management")
            }
          />
          <AdminStatsCard
            title="Pending Payout Methods"
            value={data.actionableItems.pendingPayoutMethods}
            icon={CreditCard}
            variant="warning"
            onClick={() =>
              router.push("/admin/dashboard/withdrawal-management")
            }
          />
          <AdminStatsCard
            title="Takedown Requests"
            value={data.actionableItems.takedownRequests}
            icon={AlertTriangle}
            variant="warning"
            onClick={() => router.push("/admin/dashboard/release-management")}
          />
        </div>
      </section>

      {/* Section 2: Key Metrics Overview */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Key Metrics Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatsCard
            title="New Users (Last 7 Days)"
            value={data.keyMetrics.newUsersLast7Days}
            icon={UserPlus}
            variant="info"
          />
          <AdminStatsCard
            title="New Releases (Last 7 Days)"
            value={data.keyMetrics.newReleasesLast7Days}
            icon={Music}
            variant="info"
          />
          <AdminStatsCard
            title="New Paying Subscribers (This Month)"
            value={data.keyMetrics.newPayingSubscribersThisMonth}
            icon={CreditCard}
            variant="success"
          />
          <AdminStatsCard
            title="Monthly Recurring Revenue"
            value={data.keyMetrics.monthlyRecurringRevenue}
            icon={TrendingUp}
            variant="success"
            formatValue={formatCurrency}
          />
        </div>
      </section>

      {/* Section 3: Performance Metrics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Performance Metrics
          </h2>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Users Over Time */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                New Users Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.performanceMetrics.newUsersOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.performanceMetrics.newUsersOverTime}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--primary))" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Releases Over Time */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                New Releases Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.performanceMetrics.newReleasesOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.performanceMetrics.newReleasesOverTime}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--primary))" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trial to Paid Conversion Rate - Full Width */}
          <Card className="border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Trial-to-Paid Conversion Rate (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.performanceMetrics.trialToPaidConversion.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={data.performanceMetrics.trialToPaidConversion}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--primary))" }}
                      formatter={(value: number) => [
                        `${value}%`,
                        "Conversion Rate",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 4: Quick Access Tools */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Quick Access Tools
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {/* Search Bar */}
          {/* <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminQuickSearch />
            </CardContent>
          </Card> */}

          {/* Action Buttons */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                onClick={() => router.push("/admin/dashboard/revenue-reports")}
                className="w-full h-12 text-base bg-primary hover:bg-primary/90"
                size="lg"
              >
                <FileUp className="mr-2 h-5 w-5" />
                Upload Revenue Report
              </Button>
              <Button
                onClick={() => router.push("/admin/dashboard/analytics")}
                className="w-full h-12 text-base bg-primary hover:bg-primary/90"
                size="lg"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Upload Analytics Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
