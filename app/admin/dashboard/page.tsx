"use client";

import { AdminDashboardStats } from "@/components/admin/admin-dashboard-stats";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-[hsl(var(--alera-purple))] to-[hsl(var(--alera-dark-purple))] bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-base">
          Monitor and manage your platform at a glance
        </p>
      </div>
      <AdminDashboardStats />
    </div>
  );
}
