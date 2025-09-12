"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Clock } from "lucide-react"
import { motion } from "framer-motion"

const progressData = [
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false },
]

export function CampaignSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="p-6 bg-white dark:bg-[#0f0f1a] border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Music className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Campaign</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Currently at Poster design</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Clock className="h-4 w-4" />
            <span className="text-lg font-bold">01:21:32</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Music className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Album Name/ EP Title</span>
        </div>

        {/* Progress bars */}
        <div className="flex items-end gap-1 h-12 mb-6">
          {progressData.map((item, index) => (
            <motion.div
              key={index}
              className={`flex-1 rounded-sm ${
                item.completed ? (index < 5 ? "bg-red-500" : "bg-orange-500") : "bg-gray-200 dark:bg-gray-700"
              }`}
              style={{ height: `${Math.random() * 60 + 40}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 60 + 40}%` }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            />
          ))}
        </div>

        <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 font-semibold">
          Track Your Campaign
        </Button>
      </Card>
    </motion.div>
  )
}
