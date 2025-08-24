"use client"

import { motion } from "framer-motion"

// Platform data
const platforms = [
  { name: "Apple Music", color: "#FF5757" },
  { name: "Spotify", color: "#4CAF50" },
  { name: "Deezer", color: "#E040FB" },
  { name: "Pandora", color: "#2196F3" },
  { name: "Other", color: "#E0E0E0" },
]

// Monthly data
const months = ["May", "June", "July", "Aug", "Sept", "Oct"]
const maxValue = 60000

export function RoyaltiesOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm"
    >
      <div className="flex flex-wrap gap-4 mb-6">
        {platforms.map((platform) => (
          <div key={platform.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }}></div>
            <span className="text-sm text-[#555] dark:text-gray-300">{platform.name}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 mb-4">
        {[60, 50, 40, 30, 20, 10].map((value) => (
          <div key={value} className="flex items-center">
            <div className="w-12 text-right pr-2 text-sm text-[#555] dark:text-gray-400">$ {value}k</div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
          </div>
        ))}
      </div>

      <div className="flex justify-between h-60 relative">
        {months.map((month, index) => {
          // Generate random heights for each platform in each month
          const heights = [
            Math.random() * 0.2 + 0.1, // Apple Music (10-30%)
            Math.random() * 0.2 + 0.2, // Spotify (20-40%)
            Math.random() * 0.2 + 0.2, // Deezer (20-40%)
            Math.random() * 0.1 + 0.05, // Pandora (5-15%)
            Math.random() * 0.1 + 0.05, // Other (5-15%)
          ]

          // Calculate total height (should be <= 1)
          const totalHeight = heights.reduce((sum, h) => sum + h, 0)

          return (
            <div key={month} className="flex flex-col items-center flex-1">
              <div className="flex-1 w-full flex flex-col-reverse">
                {platforms.map((platform, i) => (
                  <motion.div
                    key={`${month}-${platform.name}`}
                    className="w-full"
                    style={{
                      backgroundColor: platform.color,
                      height: `${(heights[i] / totalHeight) * 100}%`,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(heights[i] / totalHeight) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  />
                ))}
              </div>
              <div className="mt-2 text-sm text-[#555] dark:text-gray-400">{month}</div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
