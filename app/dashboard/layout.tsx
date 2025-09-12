"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { FloatingAgentButton } from "@/components/floating-agent-button";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a13] transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 p-4 md:p-12 pb-20 md:pb-6 md:ml-64">
          {children}
        </main>

        <FloatingAgentButton />
      </div>
    </ProtectedRoute>
  );
}
