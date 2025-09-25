"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { FloatingAgentButton } from "@/components/floating-agent-button";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { TrialCountdown } from "@/components/subscription/TrialCountdown";
import { UpgradeDialog } from "@/components/subscription/UpgradeDialog";
import { WelcomePricingDialog } from "@/components/subscription/WelcomePricingDialog";
import { useAuth } from "@/context/AuthContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { showWelcomePricingDialog, setShowWelcomePricingDialog } = useAuth();

  return (
    <>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a13] transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 p-4 md:p-12 pb-20 md:pb-6 md:ml-64">
          <div className="space-y-4">
            <TrialCountdown />
            {children}
          </div>
        </main>

        <FloatingAgentButton />
      </div>
      <UpgradeDialog />
      <WelcomePricingDialog 
        isOpen={showWelcomePricingDialog} 
        onClose={() => setShowWelcomePricingDialog(false)} 
      />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SubscriptionProvider>
        <DashboardLayoutContent>
          {children}
        </DashboardLayoutContent>
      </SubscriptionProvider>
    </ProtectedRoute>
  );
}
