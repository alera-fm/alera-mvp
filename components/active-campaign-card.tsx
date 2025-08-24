"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, ArrowRight, Megaphone } from "lucide-react"

export function ActiveCampaignCard() {
  const router = useRouter()
  const [campaign] = useState({
    title: "Summer Single Release",
    status: "In Progress",
    progress: 65,
    startDate: "May 1, 2025",
    endDate: "June 15, 2025",
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-0 dark:border-0 shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-[#0f0f1a]">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900 dark:text-white text-xl flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-purple-500" />
            Active Campaign
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Your current release campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/50 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-300">
                {campaign.status}
              </span>
              <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="mr-1 h-4 w-4 text-yellow-500" />
                {campaign.startDate} - {campaign.endDate}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">{campaign.progress}%</span>
            </div>
            <div className="relative pt-1">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-[#2d2d44]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-yellow-500 dark:from-purple-500 dark:to-yellow-500"
                  style={{ width: `${campaign.progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${campaign.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white"
            onClick={() => router.push("/dashboard/campaigns")}
          >
            View Campaign
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
