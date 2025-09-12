"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Rocket, PlusCircle } from "lucide-react"
import Link from "next/link"

export function DistributeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }} // Removed delay to appear first
      className="w-full"
    >
      <div className="bg-gradient-to-br from-[#E2D4F7] to-[#D0BBE8] dark:from-[#5d2c91] dark:to-[#4a2375] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="md:max-w-[60%] text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#333] dark:text-white mb-2">
              Distribute Your Music Now
            </h2>
            <p className="text-[#555] dark:text-white/80 text-sm lg:text-base mb-6">
              Release your tracks to all major platforms and reach a global audience effortlessly.
            </p>
            <Button className="bg-[#BFFF00] text-black hover:bg-[#a8e000] dark:hover:bg-[#caff00] font-semibold px-6 py-3 lg:px-8 lg:py-3.5 rounded-full text-base shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 group">
              <Link className="flex items-center justify-center gap-2" href="/dashboard/new-release">
                <PlusCircle className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                New Release
              </Link>
            </Button>
          </div>
          <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 text-[#BFFF00] opacity-80 dark:opacity-70 flex-shrink-0">
            {/* Rocket Icon as placeholder graphic */}
            <Rocket className="w-full h-full transform -rotate-45" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
