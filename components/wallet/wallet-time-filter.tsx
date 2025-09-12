"use client"

import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays } from "lucide-react"

interface WalletTimeFilterProps {
  value: string
  onValueChange: (value: string) => void
}

export function WalletTimeFilter({ value, onValueChange }: WalletTimeFilterProps) {
  const timeRanges = ["7 Days", "30 Days", "90 Days", "All Time"]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center gap-3 mb-6"
    >
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Range:</span>
      </div>
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
          {timeRanges.map((range) => (
            <SelectItem 
              key={range} 
              value={range}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              {range}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  )
}
