"use client"

import { motion } from "framer-motion"
import { Check, Music } from "lucide-react"
import { Button } from "@/components/ui/button"

// Progress bars data - all are completed (purple)
const progressBars = Array(40)
  .fill(null)
  .map(() => ({
    color: "#9333EA",
  }))

export function PreviousCampaigns() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#333] dark:text-white">Campaign</h3>
          <p className="text-sm text-[#666] dark:text-gray-400">Currently at Poster design</p>
        </div>

        <div className="flex items-center gap-2 text-purple-500">
          <Check className="h-5 w-5" />
          <span className="text-xl font-bold text-purple-500">Released</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Music className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-medium text-[#555] dark:text-gray-300">Album Name/ EP Title</span>
      </div>

      {/* Progress bars visualization */}
      <div className="flex items-end gap-[2px] h-12 mb-6">
        {progressBars.map((bar, index) => (
          <motion.div
            key={index}
            className="flex-1 rounded-sm"
            style={{
              backgroundColor: bar.color,
              height: `${Math.random() * 60 + 40}%`,
              opacity: 0.8,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.random() * 60 + 40}%` }}
            transition={{ duration: 0.5, delay: index * 0.01 }}
          />
        ))}
      </div>

      <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full h-12">
        View Campaign History
      </Button>
    </motion.div>
  )
}
