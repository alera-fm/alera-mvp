"use client"

import { motion } from "framer-motion"
import { CreditCard } from "lucide-react"

export function EarningsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#2D1B69] rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-full">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Earnings</h3>
            <p className="text-sm text-white/70">Last month</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#3D2B79] px-2 py-1 rounded-full">
          <span className="text-sm text-white">%14</span>
          <span className="text-white">↗</span>
        </div>
      </div>

      <div className="text-right mb-4">
        <h2 className="text-4xl font-bold text-white">2123,44$</h2>
      </div>

      {/* Line chart visualization */}
      <div className="h-24 relative">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          <path
            d="M0,70 C20,60 40,80 60,50 C80,20 100,40 120,30 C140,20 160,40 180,30 C200,20 220,40 240,30 C260,20 280,40 300,50"
            stroke="#BFFF00"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>
    </motion.div>
  )
}
