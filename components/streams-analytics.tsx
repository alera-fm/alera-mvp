"use client"

import { motion } from "framer-motion"
import { Headphones } from "lucide-react"

export function StreamsAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
            <Headphones className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#333] dark:text-white">Streams</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold text-[#333] dark:text-white">434,54K</div>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            +45%
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">Past month</div>
        </div>
      </div>

      {/* Line chart visualization */}
      <div className="h-64 relative mb-4">
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>600k</div>
          <div>500k</div>
          <div>400k</div>
          <div>300k</div>
          <div>200k</div>
          <div>100k</div>
        </div>

        <div className="ml-12 h-full">
          <svg className="w-full h-full" viewBox="0 0 600 300">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={`h-line-${i}`} x1="0" y1={i * 60} x2="600" y2={i * 60} stroke="#E5E5E5" strokeWidth="1" />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={`v-line-${i}`} x1={i * 120} y1="0" x2={i * 120} y2="300" stroke="#E5E5E5" strokeWidth="1" />
            ))}

            {/* Current period line */}
            <path
              d="M0,250 C50,230 100,210 150,190 C200,170 250,150 300,120 C350,90 400,70 450,60 C500,50 550,70 600,90"
              stroke="#9333EA"
              strokeWidth="3"
              fill="none"
            />

            {/* Previous period line (dashed) */}
            <path
              d="M0,280 C50,260 100,240 150,230 C200,220 250,200 300,180 C350,160 400,150 450,140 C500,130 550,140 600,120"
              stroke="#D8B4FE"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
            />
          </svg>
        </div>

        <div className="absolute bottom-0 left-12 right-0 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>May</div>
          <div>June</div>
          <div>July</div>
          <div>August</div>
        </div>
      </div>
    </motion.div>
  )
}
