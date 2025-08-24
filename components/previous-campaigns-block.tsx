"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Music, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function PreviousCampaignsBlock() {
  const [campaigns] = useState([
    {
      id: 1,
      title: "Spring EP Release",
      type: "EP Release",
      date: "March 15, 2025",
      status: "Completed",
    },
    {
      id: 2,
      title: "Winter Tour Promotion",
      type: "Tour",
      date: "January 10, 2025",
      status: "Completed",
    },
  ])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-0 dark:border-0 shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-[#0f0f1a]">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900 dark:text-white">Previous Campaigns</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Your past release campaigns</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {campaigns.length > 0 ? (
            <motion.ul className="space-y-4" variants={container} initial="hidden" animate="show">
              {campaigns.map((campaign) => (
                <motion.li
                  key={campaign.id}
                  className="flex items-start gap-4 rounded-lg border border-gray-200 dark:border-[#2d2d44] p-4 bg-white dark:bg-[#1a1a2e] hover:shadow-md transition-shadow duration-200"
                  variants={item}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 dark:bg-purple-600">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{campaign.title}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                        {campaign.status}
                      </span>
                      <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {campaign.date}
                      </span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Music className="h-12 w-12 text-gray-300 dark:text-gray-700" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No previous campaigns</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start your first campaign to see it here</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            variant="outline"
            className="w-full border-gray-200 dark:border-[#2d2d44] hover:bg-gray-100 dark:hover:bg-[#2d2d44] transition-colors"
          >
            View Campaign History
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
