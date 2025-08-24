import { HeaderSection } from "@/components/header-section"
import { CurrentCampaign } from "@/components/current-campaign"
import { PreviousCampaigns } from "@/components/previous-campaigns"
import { MobileNavigation } from "@/components/mobile-navigation"

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] pb-32 md:pb-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto p-5 space-y-6">
        <HeaderSection />

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-[#333] dark:text-[#f8f8f8]">Your Current Campaigns</h2>
          <CurrentCampaign />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-[#333] dark:text-[#f8f8f8]">Your Previous Campaigns</h2>
          <PreviousCampaigns />
        </div>
      </div>

      <MobileNavigation />
    </div>
  )
}
