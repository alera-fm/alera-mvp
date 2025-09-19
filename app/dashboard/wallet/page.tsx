"use client"

import { useState, useEffect } from "react"
import { HeaderSection } from "@/components/header-section"
import { MobileNavigation } from "@/components/mobile-navigation"
import { WalletTimeFilter } from "@/components/wallet/wallet-time-filter"
import { WalletSummaryCards } from "@/components/wallet/wallet-summary-cards"
import { EarningsByPlatformChart } from "@/components/wallet/earnings-by-platform-chart"
import { WithdrawalSection } from "@/components/wallet/withdrawal-section"
import { TransactionHistory } from "@/components/wallet/transaction-history"
import { getWalletSummary, getWalletHistory } from "@/lib/wallet-api"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function WalletPage() {
  const { user } = useAuth()
  const [selectedRange, setSelectedRange] = useState("30 Days")
  const [walletData, setWalletData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const rangeMapping = {
    "7 Days": "7days",
    "30 Days": "30days", 
    "90 Days": "90days",
    "All Time": "alltime"
  }

  useEffect(() => {
    if (user?.id) {
      fetchWalletData()
    }
  }, [user?.id, selectedRange])

  const fetchWalletData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const range = rangeMapping[selectedRange as keyof typeof rangeMapping]

      // Fetch withdrawals data
      const withdrawalsResponse = await fetch(`/api/wallet/withdrawals?artist_id=${user.id}`)
      const withdrawalsData = withdrawalsResponse.ok ? await withdrawalsResponse.json() : { withdrawals: [] }

      const [summaryData, historyData] = await Promise.all([
        getWalletSummary(user.id, range),
        getWalletHistory(user.id)
      ])

      setWalletData({
        summary_cards: summaryData,
        earnings_by_platform: summaryData.earnings_by_platform || [],
        transactions: historyData.transactions || [],
        withdrawals: withdrawalsData.withdrawals || []
      })
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !walletData) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#BFFF00]"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wallet data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] pb-32 md:pb-6">
      <div className="max-w-6xl mx-auto p-3 md:p-5 space-y-4 md:space-y-6">
        <HeaderSection />

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#333] dark:text-white">Wallet</h1>
        </div>

        <WalletTimeFilter value={selectedRange} onValueChange={setSelectedRange} />

        <WalletSummaryCards data={walletData?.summary_cards} selectedRange={selectedRange} />

        <EarningsByPlatformChart data={walletData.earnings_by_platform} />

        <WithdrawalSection 
          pendingEarnings={walletData.summary_cards.available_balance || 0} 
          threshold={10}
          artistId={user?.id || ''} 
          onWithdrawalRequest={fetchWalletData}
        />

        <TransactionHistory transactions={walletData.transactions} withdrawals={walletData.withdrawals} />
      </div>

      <MobileNavigation />
    </div>
  )
}
