"use client"

import { motion } from "framer-motion"
import { DollarSign, Clock, CreditCard, Calendar } from "lucide-react"

interface WalletSummaryCardsProps {
  data?: {
    all_time_earnings?: number
    period_earnings?: number
    total_withdrawn?: number
    period_withdrawn?: number
    available_balance?: number
    last_payout_date?: string
  }
  selectedRange?: string
}

export function WalletSummaryCards({ data, selectedRange }: WalletSummaryCardsProps) {
  // Provide default values to prevent undefined errors
  const safeData = {
    all_time_earnings: data?.all_time_earnings ?? 0,
    period_earnings: data?.period_earnings ?? 0,
    total_withdrawn: data?.total_withdrawn ?? 0,
    period_withdrawn: data?.period_withdrawn ?? 0,
    available_balance: data?.available_balance ?? 0,
    last_payout_date: data?.last_payout_date ?? new Date().toISOString(),
  }

  const cards = [
    {
      title: "Total Earnings",
      value: `$${safeData.all_time_earnings.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      delay: 0,
    },
    {
      title: `Earnings This Period (${selectedRange || 'Current'})`,
      value: `$${safeData.period_earnings.toFixed(2)}`,
      icon: Clock,
      color: "bg-yellow-500",
      delay: 0.1,
    },
    {
      title: "Total Withdrawn",
      value: `$${safeData.total_withdrawn.toFixed(2)}`,
      icon: CreditCard,
      color: "bg-blue-500",
      delay: 0.2,
    },
    {
      title: "Last Payout Date",
      value: safeData.last_payout_date ? new Date(safeData.last_payout_date).toLocaleDateString() : 'No payouts yet',
      icon: Calendar,
      color: "bg-purple-500",
      delay: 0.3,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: card.delay }}
          className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-4 md:p-5 shadow-sm relative overflow-hidden min-h-[120px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-full ${card.color} bg-opacity-20 flex-shrink-0`}>
              <card.icon className={`h-4 w-4 md:h-5 md:w-5 text-white`} style={{ color: card.color.replace('bg-', '').replace('-500', '') }} />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 leading-tight line-clamp-2">{card.title}</p>
            <p className="text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white break-words">{card.value}</p>
          </div>

          {/* Subtle background pattern */}
          <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 opacity-5">
            <card.icon className="w-full h-full" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
