"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Headphones, CreditCard } from "lucide-react"
import { motion } from "framer-motion"

// Mock data for EQ-style visualization
const streamData = [
  { day: "Mon", value: 60 },
  { day: "Tue", value: 80 },
  { day: "Wed", value: 45 },
  { day: "Thu", value: 90 },
  { day: "Fri", value: 70 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 85 },
]

const earningsData = [
  { point: 1, value: 40 },
  { point: 2, value: 60 },
  { point: 3, value: 45 },
  { point: 4, value: 80 },
  { point: 5, value: 70 },
  { point: 6, value: 90 },
  { point: 7, value: 65 },
  { point: 8, value: 85 },
  { point: 9, value: 75 },
  { point: 10, value: 95 },
]

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Streams Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-6 bg-[#BFFF00] border-0 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-black/10 rounded-full">
              <Headphones className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Streams</h3>
              <p className="text-sm text-black/70">Last week</p>
            </div>
          </div>

          <div className="flex items-end justify-between mb-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-black">123.4K</div>
              <div className="text-sm text-black/70 flex items-center gap-1">
                <span>%14</span>
                <span className="text-xs">↗</span>
              </div>
            </div>
          </div>

          {/* EQ-style bars */}
          <div className="flex items-end justify-between gap-1 h-20 mb-4">
            {streamData.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  className="bg-black/80 rounded-full w-2"
                  style={{ height: `${item.value}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${item.value}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
                <span className="text-xs text-black/70">{item.day}</span>
              </div>
            ))}
          </div>

          <Button className="w-full bg-black text-[#BFFF00] hover:bg-black/90 font-semibold">Go to Dashboard</Button>
        </Card>
      </motion.div>

      {/* Earnings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-6 bg-[#2D1B69] border-0 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/10 rounded-full">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Earnings</h3>
              <p className="text-sm text-white/70">Last week</p>
            </div>
          </div>

          {/* Line chart area */}
          <div className="h-20 mb-4 relative">
            <svg className="w-full h-full" viewBox="0 0 200 80">
              <defs>
                <linearGradient id="earningsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#BFFF00" />
                  <stop offset="100%" stopColor="#BFFF00" />
                </linearGradient>
              </defs>
              <path
                d="M 0 60 Q 20 40 40 45 T 80 30 T 120 35 T 160 25 T 200 30"
                stroke="url(#earningsGradient)"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-sm"
              />
            </svg>
          </div>

          <Button className="w-full bg-white text-[#2D1B69] hover:bg-white/90 font-semibold">Go to Dashboard</Button>
        </Card>
      </motion.div>
    </div>
  )
}
