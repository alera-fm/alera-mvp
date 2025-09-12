"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, DollarSign } from "lucide-react"

interface EarningsCalculatorProps {
  initialData: {
    monthly_streams: number
    monthly_supporters: number
    stream_rate: number
    tip_rate: number
    sub_rate: number
    estimated_monthly_earnings: number
  }
}

export function EarningsCalculator({ initialData }: EarningsCalculatorProps) {
  const [monthlyStreams, setMonthlyStreams] = useState(initialData.monthly_streams || 0)
  const [monthlySupporters, setMonthlySupporters] = useState(initialData.monthly_supporters || 0)

  const streamingEarnings = monthlyStreams * initialData.stream_rate
  const tipEarnings = monthlySupporters * initialData.tip_rate
  const fanzoneEarnings = monthlySupporters * initialData.sub_rate
  const totalEstimated = streamingEarnings + tipEarnings + fanzoneEarnings

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-[#333] dark:text-white">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Potential Earnings Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="streams" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Spotify Streams
              </Label>
              <Input
                id="streams"
                type="number"
                value={monthlyStreams.toString()}
                onChange={(e) => setMonthlyStreams(Number(e.target.value) || 0)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder="Enter monthly streams"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="supporters" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Supporters
              </Label>
              <Input
                id="supporters"
                type="number"
                value={monthlySupporters.toString()}
                onChange={(e) => setMonthlySupporters(Number(e.target.value) || 0)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder="Enter monthly supporters"
              />
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333] dark:text-white">Estimated Monthly Earnings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Streaming</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">$0.003/stream</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-lg font-bold text-[#333] dark:text-white">
                    {streamingEarnings.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tips</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">$2.50/supporter</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-lg font-bold text-[#333] dark:text-white">
                    {tipEarnings.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fanzone</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">$5.00/supporter</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-lg font-bold text-[#333] dark:text-white">
                    {fanzoneEarnings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#333] dark:text-white">Total Estimated Earnings</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalEstimated.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
