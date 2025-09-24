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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#333] dark:text-white">
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse min-h-[120px] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "New Users (Today)",
      shortTitle: "New Users",
      value: data.newUsersToday,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "New Subscriptions (Today)",
      shortTitle: "Subscriptions",
      value: data.newSubscriptionsToday,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "New Releases (Today)",
      shortTitle: "New Releases",
      value: data.newReleasesToday,
      icon: Music,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#333] dark:text-white">
          Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg ${item.bgColor} border border-gray-200 dark:border-gray-700 min-h-[120px] flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-3xl font-bold text-[#333] dark:text-white mb-2">
                    {item.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
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
