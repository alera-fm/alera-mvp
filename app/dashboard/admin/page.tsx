"use client";

import { RevenueUpload } from "@/components/admin/revenue-upload";
import { WithdrawalManagement } from "@/components/admin/withdrawal-management";
import { ReleaseManagement } from "@/components/admin/release-management";
import { PayoutMethodsViewer } from "@/components/admin/payout-methods-viewer";
import { AdminRoute } from "@/components/auth/admin-route";
import AnalyticsUpload from "@/components/admin/analytics-upload";
import { MobileNavigation } from "@/components/mobile-navigation";
import { HeaderSection } from "@/components/header-section";

export default function AdminPage() {
  return (
    <AdminRoute>
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        <HeaderSection/>
        <h1 className="text-2xl md:text-3xl font-bold text-[#333] dark:text-white">
          Admin Dashboard
        </h1>

        <div className="grid gap-4 md:gap-6">
          <ReleaseManagement />
          <WithdrawalManagement />
          <PayoutMethodsViewer />
          <RevenueUpload />
          <AnalyticsUpload />
        </div>
        <MobileNavigation />
      </div>
    </AdminRoute>
  );
}
