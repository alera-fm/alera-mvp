"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ProgressChecklist } from "@/components/progress-checklist"
import { ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

export function CampaignBlock() {
  const [isOpen, setIsOpen] = useState(true)
  const [campaign] = useState({
    title: "Summer Single Release",
    type: "Single Release",
    startDate: "May 1, 2025",
    endDate: "June 15, 2025",
    tasks: [
      { id: 1, title: "Finalize master recording", status: "done" },
      { id: 2, title: "Submit to distributors", status: "done" },
      { id: 3, title: "Prepare social media assets", status: "in-progress" },
      { id: 4, title: "Schedule release announcement", status: "in-progress" },
      { id: 5, title: "Plan release party", status: "waiting" },
    ],
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="overflow-hidden border-0 dark:border-0 shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-[#0f0f1a]">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">Current Campaign</CardTitle>
              <CollapsibleTrigger className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-[#2d2d44] transition-colors">
                <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </motion.div>
              </CollapsibleTrigger>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Track your active campaign progress
            </CardDescription>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/50 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-300">
                    {campaign.type}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {campaign.startDate} - {campaign.endDate}
                  </span>
                </div>
              </div>

              <ProgressChecklist tasks={campaign.tasks} />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  )
}
