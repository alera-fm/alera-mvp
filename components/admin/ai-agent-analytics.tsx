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
  Bot,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Users,
  Activity,
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

interface AIAgentData {
  adoptionRate: number;
  totalActiveUsers: number;
  aiUsers: number;
  averageQueriesPerUser: number;
  totalQueries: number;
  previousPeriod: {
    adoptionRate: number;
    totalActiveUsers: number;
    aiUsers: number;
    averageQueriesPerUser: number;
    totalQueries: number;
  };
  trendData: Array<{
    period: string;
    adoptionRate: number;
    averageQueriesPerUser: number;
  }>;
}

export function AIAgentAnalytics() {
  const [data, setData] = useState<AIAgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchAIAgentData();
  }, [timeRange]);

  const fetchAIAgentData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setLoading(true);
      const response = await fetch(
        `/api/admin/ai-agent-analytics?range=${timeRange}`,
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
      console.error("Error fetching AI agent data:", error);
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Agent Analytics
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
            <Bot className="h-5 w-5 text-primary" />
            AI Agent Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Failed to load AI agent data
          </p>
        </CardContent>
      </Card>
    );
  }

  const adoptionChange = getChangeIndicator(
    data.adoptionRate,
    data.previousPeriod.adoptionRate
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Agent Analytics
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI Agent Adoption Rate - Main KPI */}
          <Card className="relative overflow-hidden md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      AI Agent Adoption Rate
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data.aiUsers} of {data.totalActiveUsers} active users
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {formatPercentage(data.adoptionRate)}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {adoptionChange.icon && (
                      <adoptionChange.icon
                        className={`h-3 w-3 ${adoptionChange.color}`}
                      />
                    )}
                    <span className={adoptionChange.color}>
                      {adoptionChange.value}%
                    </span>
                    <span className="text-muted-foreground">
                      vs last period
                    </span>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--muted))"
                    />
                    <XAxis
                      dataKey="period"
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
                      formatter={(value: number) => [
                        `${value.toFixed(1)}%`,
                        "Adoption Rate",
                      ]}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="adoptionRate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "hsl(var(--primary))",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Change Badge */}
              <div className="mt-4">
                <Badge
                  variant={
                    adoptionChange.isPositive ? "default" : "destructive"
                  }
                  className={`${
                    adoptionChange.isPositive
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }`}
                >
                  {adoptionChange.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {adoptionChange.value}% change
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Metrics */}
          <div className="space-y-4">
            {/* Total AI Users */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <MessageSquare className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      AI Users
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-info">
                  {data.aiUsers.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Users who used AI
                </div>
              </CardContent>
            </Card>

            {/* Total Active Users */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Users className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      Active Users
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-success">
                  {data.totalActiveUsers.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total active users
                </div>
              </CardContent>
            </Card>

            {/* Average Queries per User */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Activity className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      Avg Queries/User
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-warning">
                  {data.averageQueriesPerUser.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.totalQueries.toLocaleString()} total queries
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Adoption Rate
              </div>
              <div className="text-lg font-semibold text-primary">
                {formatPercentage(data.adoptionRate)}
              </div>
              <div className="text-xs text-muted-foreground">
                AI usage penetration
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">AI Users</div>
              <div className="text-lg font-semibold text-info">
                {data.aiUsers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Users engaged with AI
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Active Users
              </div>
              <div className="text-lg font-semibold text-success">
                {data.totalActiveUsers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Total user base
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Avg Queries/User
              </div>
              <div className="text-lg font-semibold text-warning">
                {data.averageQueriesPerUser.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.totalQueries.toLocaleString()} total queries
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
