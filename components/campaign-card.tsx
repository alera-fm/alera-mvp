"use client"

import { motion } from "framer-motion"
import { Clock, Music } from "lucide-react"
import { Button } from "@/components/ui/button"

// Progress bars data - first 10 are completed (red/orange), rest are incomplete (gray)
const progressBars = Array(40)
  .fill(null)
  .map((_, i) => ({
    completed: i < 10,
    color: i < 5 ? "#FF5757" : i < 10 ? "#FF8C42" : "#E5E5E5",
  }))

export function CampaignCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <Music className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#333] dark:text-white">Campaign</h3>
            <p className="text-sm text-[#666] dark:text-gray-400">Currently at Poster design</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-orange-500">
          <Clock className="h-5 w-5" />
          <span className="text-xl font-bold">01:21:32</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Music className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-[#555] dark:text-gray-300">Album Name/ EP Title</span>
      </div>

      {/* Progress bars visualization */}
      <div className="flex items-end gap-[2px] h-16 mb-6">
        {progressBars.map((bar, index) => (
          <motion.div
            key={index}
            className="flex-1 rounded-sm"
            style={{
              backgroundColor: bar.color,
              height: `${Math.random() * 60 + 40}%`,
              opacity: bar.completed ? 1 : index < 20 ? 0.7 : 0.5,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.random() * 60 + 40}%` }}
            transition={{ duration: 0.5, delay: index * 0.01 }}
          />
        ))}
      </div>

      <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full h-12">
        Track Your Campaign
      </Button>
    </motion.div>
  )
}
