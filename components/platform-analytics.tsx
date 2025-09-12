"use client"

import { motion } from "framer-motion"

export function PlatformAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#4CAF50" />
              <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#333] dark:text-white">Spotify Overall</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold text-[#333] dark:text-white">434,54K</div>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            -45%
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">Past month</div>
        </div>
      </div>

      {/* Area chart visualization */}
      <div className="h-64 relative mb-4">
        <div className="h-full">
          <svg className="w-full h-full" viewBox="0 0 600 300">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={`v-line-${i}`}
                x1={i * 120 + 120}
                y1="0"
                x2={i * 120 + 120}
                y2="300"
                stroke="#E5E5E5"
                strokeWidth="1"
              />
            ))}

            {/* Area chart */}
            <defs>
              <linearGradient id="spotifyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#BFFF00" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#4CAF50" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1DB954" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            <path
              d="M0,100 C50,80 100,90 150,120 C200,150 250,170 300,180 C350,190 400,200 450,220 C500,240 550,250 600,260 L600,300 L0,300 Z"
              fill="url(#spotifyGradient)"
            />

            <path
              d="M0,100 C50,80 100,90 150,120 C200,150 250,170 300,180 C350,190 400,200 450,220 C500,240 550,250 600,260"
              stroke="#4CAF50"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>2 Feb</div>
          <div>12 Feb</div>
          <div>22 Feb</div>
          <div>2 Mars</div>
          <div>12 Mars</div>
        </div>
      </div>
    </motion.div>
  )
}
