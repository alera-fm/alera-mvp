"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Music } from "lucide-react"
import { motion } from "framer-motion"

export function CTACard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="overflow-hidden border-0 dark:border-0 shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-[#0f0f1a]">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900 dark:text-white text-xl flex items-center gap-2">
            <Music className="h-5 w-5 text-yellow-500" />
            Ready for a New Release?
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Start planning your next music release with ALERA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="max-w-[60%]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Launch Your Next Hit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create a new release campaign and let ALERA help you reach more fans and maximize your impact.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }} className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-yellow-500 blur-xl opacity-30 dark:opacity-40" />
              <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-purple-600 to-yellow-500 dark:from-purple-600 dark:to-yellow-500">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path d="M9 18V6L21 12L9 18Z" fill="currentColor" />
                  <path d="M3 6H7V18H3V6Z" fill="currentColor" />
                </svg>
              </div>
            </motion.div>
          </div>
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            className="w-full bg-gradient-to-r from-yellow-500 to-purple-600 hover:from-yellow-600 hover:to-purple-700 text-white"
            onClick={() => alert("New release modal would open here")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Release
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
