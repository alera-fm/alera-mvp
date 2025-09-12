"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Rocket, PlusCircle } from "lucide-react"

export function DistributeCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }} // Adjusted delay as it's now at the top
    >
      <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 border-0 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0 md:max-w-[60%]">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Distribute Your Music Now</h2>
            <p className="text-white/90 text-sm lg:text-base mb-6">
              Release your tracks to all major platforms and reach a global audience effortlessly.
            </p>
            <Button className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90 font-semibold px-6 py-3 text-base lg:px-8 lg:py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Release
            </Button>
          </div>
          <div className="hidden md:block absolute right-0 bottom-0 top-0 items-center justify-center pr-6 opacity-30 md:opacity-100 md:relative md:flex">
            <Rocket className="w-24 h-24 lg:w-32 lg:h-32 text-[#BFFF00] opacity-70 md:opacity-100" />
          </div>
          {/* Mobile visible icon, less prominent */}
          <div className="md:hidden absolute right-4 top-4">
            <Rocket className="w-12 h-12 text-[#BFFF00] opacity-30" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
