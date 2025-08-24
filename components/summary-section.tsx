"use client"

import { motion } from "framer-motion"
import { Headphones, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const streamValues = [30, 50, 40, 60, 25, 80, 45]

export function SummarySection() {
  const buttonHoverEffect = "hover:scale-105 transform transition-transform duration-200 ease-out hover:shadow-md"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {" "}
      {/* Increased gap slightly */}
      {/* Streams Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl overflow-hidden h-full" // Added h-full
      >
        <div className="bg-[#BFFF00] p-6 rounded-3xl h-full flex flex-col justify-between">
          {" "}
          {/* Increased padding slightly */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-black/10 p-2.5 rounded-full">
                {" "}
                {/* Slightly larger icon bg */}
                <Headphones className="h-6 w-6 text-black" /> {/* Slightly larger icon */}
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Streams</h3> {/* Larger text */}
                <p className="text-sm text-black/70">Last week</p>
              </div>
            </div>

            <div className="flex justify-between items-start mb-5">
              <div className="text-4xl font-bold text-black">123.4K</div> {/* Larger text */}
              <div className="flex items-center text-sm bg-black/10 px-2.5 py-1.5 rounded-full mt-1">
                {" "}
                {/* Slightly larger pill */}
                <span>%14</span>
                <span className="ml-1">↗</span>
              </div>
            </div>

            <div className="flex items-end justify-between h-28 mb-5 px-1">
              {" "}
              {/* Increased height */}
              {daysOfWeek.map((day, index) => (
                <div key={day} className="flex flex-col items-center justify-end gap-2 flex-1 h-full relative">
                  {day === "Sat" && (
                    <div className="absolute inset-x-0 top-0 bottom-0 mx-auto w-9 h-full bg-black/10 rounded-full z-0"></div> /* Adjusted highlight */
                  )}
                  <div
                    className="w-2.5 bg-black/20 rounded-t-md relative z-10" /* Adjusted track */
                    style={{ height: "100%" }}
                  >
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-black rounded-t-md"
                      style={{ height: `${streamValues[index]}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${streamValues[index]}%` }}
                      transition={{ duration: 0.6, delay: index * 0.07 + 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-black/70 font-medium z-10">{day}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            className={`w-full bg-black text-white hover:bg-black/90 rounded-full h-12 text-base font-semibold ${buttonHoverEffect}`}
            asChild
          >
            <Link href="/dashboard/analytics">Go to Dashboard</Link>
          </Button>
        </div>
      </motion.div>
      {/* Earnings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl overflow-hidden h-full" // Added h-full
      >
        <div className="bg-[#2D1B69] p-6 rounded-3xl h-full flex flex-col justify-between">
          {" "}
          {/* Increased padding slightly */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/10 p-2.5 rounded-full">
                {" "}
                {/* Slightly larger icon bg */}
                <CreditCard className="h-6 w-6 text-white" /> {/* Slightly larger icon */}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Earnings</h3> {/* Larger text */}
                <p className="text-sm text-white/70">Last week</p>
              </div>
            </div>
            <div className="text-right mb-1">
              {" "}
              {/* Adjusted margin */}
              <h2 className="text-4xl font-bold text-white">2123,44$</h2> {/* Larger text */}
            </div>
            <div className="h-32 mb-5 relative">
              {" "}
              {/* Increased height and margin */}
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <motion.path
                  d="M0,70 C20,60 40,80 60,50 C80,20 100,40 120,30 C140,20 160,40 180,30 C200,20 220,40 240,30 C260,20 280,40 300,50"
                  stroke="#BFFF00"
                  strokeWidth="3.5" /* Thicker line */
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                />
              </svg>
            </div>
          </div>
          <Button
            className={`w-full bg-white text-[#2D1B69] hover:bg-white/90 rounded-full h-12 text-base font-semibold ${buttonHoverEffect}`}
            asChild
          >
            <Link href="/dashboard/wallet">Go to Wallet</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
