import { AnalyticsHeader } from "@/components/analytics-header"
import ConnectedAccountsSection from "@/components/analytics/connected-accounts-section"
import MyAleraReleasesSection from "@/components/analytics/my-alera-releases-section"
import { MobileNavigation } from "@/components/mobile-navigation"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] pb-32 md:pb-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-3 md:p-5 space-y-4 md:space-y-6">
        <AnalyticsHeader />
        <div className="space-y-4 md:space-y-6">
          <ConnectedAccountsSection />
          <MyAleraReleasesSection />
        </div>
      </div>
      <MobileNavigation />
    </div>
  )
}
