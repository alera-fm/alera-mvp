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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  Users,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Topic {
  name: string;
  count: number;
  percentage: number;
  keywords: string[];
}

interface WordCloudItem {
  text: string;
  value: number;
  color: string;
}

interface AnalysisData {
  id: number;
  analysisDate: string;
  userTier: string;
  timeRangeDays: number;
  totalQueries: number;
  totalUsers: number;
  topics: Topic[];
  wordcloudData: WordCloudItem[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function TopAITopics() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [userTier, setUserTier] = useState("all");
  const [needsAnalysis, setNeedsAnalysis] = useState(false);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchTopicAnalysis();
  }, [timeRange, userTier]);

  const fetchTopicAnalysis = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setLoading(true);
      const response = await fetch(
        `/api/admin/ai-topic-analysis?tier=${userTier}&range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result.analysis);
        setNeedsAnalysis(result.needsAnalysis);
      }
    } catch (error) {
      console.error("Error fetching topic analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      setAnalyzing(true);
      const response = await fetch("/api/admin/ai-topic-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userTier,
          timeRangeDays: parseInt(timeRange),
        }),
      });

      if (response.ok) {
        // Refresh data after triggering analysis
        setTimeout(() => {
          fetchTopicAnalysis();
        }, 2000);
      }
    } catch (error) {
      console.error("Error triggering analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-info animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success";
      case "processing":
        return "bg-info/10 text-info";
      case "failed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Top AI Topics
            </CardTitle>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Top AI Topics
          </CardTitle>
          <div className="flex gap-2">
            <Select value={userTier} onValueChange={setUserTier}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="plus">Plus</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </CardHeader>
      <CardContent>
        {needsAnalysis || !data ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Analysis Available
            </h3>
            <p className="text-muted-foreground mb-4">
              Start an AI analysis to discover the most common topics users are
              asking about.
            </p>
            <Button
              onClick={triggerAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2"
            >
              {analyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {analyzing ? "Analyzing..." : "Start Analysis"}
            </Button>
          </div>
        ) : data.status === "processing" ? (
          <div className="text-center py-8">
            <RefreshCw className="h-12 w-12 text-info animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Analysis in Progress
            </h3>
            <p className="text-muted-foreground mb-4">
              AI is analyzing {data.totalQueries} queries from {data.totalUsers}{" "}
              users...
            </p>
            <div className="w-full max-w-xs mx-auto">
              <Progress value={66} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                This may take a few minutes
              </p>
            </div>
          </div>
        ) : data.status === "failed" ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Analysis Failed
            </h3>
            <p className="text-muted-foreground mb-4">
              There was an error processing the analysis. Please try again.
            </p>
            <Button
              onClick={triggerAnalysis}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analysis Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(data.status)}
                <div>
                  <h4 className="font-semibold text-foreground">
                    Analysis Complete
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {data.totalQueries} queries from {data.totalUsers} users
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(data.status)}>
                  {data.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerAnalysis}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topics List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Top Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topics.map((topic, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {index + 1}. {topic.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {topic.count} queries
                            </span>
                            <Badge variant="secondary">
                              {topic.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={topic.percentage} className="h-2" />
                        <div className="flex flex-wrap gap-1">
                          {topic.keywords.map((keyword, keyIndex) => (
                            <Badge
                              key={keyIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Word Cloud */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Word Cloud
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 justify-center items-center min-h-[300px]">
                    {data.wordcloudData.map((word, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 rounded-md font-medium transition-all hover:scale-105"
                        style={{
                          fontSize: `${Math.max(
                            12,
                            Math.min(24, word.value / 2)
                          )}px`,
                          color: word.color,
                          backgroundColor: `${word.color}20`,
                        }}
                      >
                        {word.text}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {data.topics.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Topics Identified
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info">
                  {data.totalQueries.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Queries
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {data.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
