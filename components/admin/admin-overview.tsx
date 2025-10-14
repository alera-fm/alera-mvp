"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, CreditCard, Music } from "lucide-react";

interface OverviewData {
  onlineUsers: number;
  newUsersToday: number;
  newSubscriptionsToday: number;
  newReleasesToday: number;
}

export function AdminOverview() {
  const [data, setData] = useState<OverviewData>({
    onlineUsers: 0,
    newUsersToday: 0,
    newSubscriptionsToday: 0,
    newReleasesToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch("/api/admin/overview", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse min-h-[140px] p-6 rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/30"
              >
                <div className="h-10 w-10 bg-muted rounded-lg mb-4"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overviewItems = [
    {
      title: "Online Users",
      shortTitle: "Online",
      value: data.onlineUsers,
      icon: Users,
      gradient: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "New Users (Today)",
      shortTitle: "New Users",
      value: data.newUsersToday,
      icon: UserPlus,
      gradient: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
    },
    {
      title: "New Subscriptions (Today)",
      shortTitle: "Subscriptions",
      value: data.newSubscriptionsToday,
      icon: CreditCard,
      gradient: "from-success/10 to-success/5",
      iconColor: "text-success",
    },
    {
      title: "New Releases (Today)",
      shortTitle: "New Releases",
      value: data.newReleasesToday,
      icon: Music,
      gradient: "from-info/10 to-info/5",
      iconColor: "text-info",
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Platform Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`group p-6 rounded-xl border border-border bg-gradient-to-br ${item.gradient} hover:shadow-lg hover:scale-[1.02] transition-all duration-300 min-h-[140px] flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {item.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground leading-tight font-medium">
                    <span className="hidden sm:inline">{item.title}</span>
                    <span className="sm:hidden">{item.shortTitle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
