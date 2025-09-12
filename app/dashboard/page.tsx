import { HeaderSection } from "@/components/header-section";
import { SummarySection } from "@/components/summary-section";

import { DistributeCard } from "@/components/distribute-card";
import { MobileNavigation } from "@/components/mobile-navigation";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] pb-32 md:pb-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto p-5 space-y-6">
        <HeaderSection />

        {/* DistributeCard is now at the top */}
        <DistributeCard />

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-[#333] dark:text-[#f8f8f8]">
            Your Summary
          </h2>
          <SummarySection />
        </div>

     
      </div>

      <MobileNavigation />
    </div>
  );
}
