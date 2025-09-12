"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  Upload,
  Plus,
  Search,
  Filter,
  BarChart3,
  Globe,
  Gender,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { FanDashboard } from "@/components/fanzone/fan-dashboard";
import { FanList } from "@/components/fanzone/fan-list";
import { EmailCampaigns } from "@/components/fanzone/email-campaigns";
import { ImportFans } from "@/components/fanzone/import-fans";
import { HeaderSection } from "@/components/header-section";
import { MobileNavigation } from "@/components/mobile-navigation";

interface FanInsights {
  totalFans: number;
  subscriptionStats: { free: number; paid: number };
  topCountries: Array<{ country: string; count: string }>;
  genderBreakdown: Array<{ gender: string; count: string }>;
  ageBreakdown: Array<{ age_group: string; count: string }>;
  growthOverTime: Array<{ month: string; new_fans: string }>;
  sourceBreakdown: Array<{ source: string; count: string }>;
}

export default function FanZonePage() {
  const [insights, setInsights] = useState<FanInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/fanzone/insights", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        throw new Error("Failed to fetch insights");
      }
    } catch (error) {
      console.error("Fetch insights error:", error);
      toast({
        title: "Error",
        description: "Failed to load fan insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <HeaderSection />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#333] dark:text-white">
          Fan Zone
        </h1>
        <Badge variant="secondary" className="text-sm">
          {insights?.totalFans || 0} Total Fans
        </Badge>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="fans" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Fans
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FanDashboard insights={insights} />
        </TabsContent>

        <TabsContent value="fans">
          <FanList onFanUpdate={fetchInsights} />
        </TabsContent>

        <TabsContent value="campaigns">
          <EmailCampaigns />
        </TabsContent>

        <TabsContent value="import">
          <ImportFans onImportComplete={fetchInsights} />
        </TabsContent>
      </Tabs>
      <MobileNavigation />
    </div>
  );
}
