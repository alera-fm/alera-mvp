"use client"

import { Button } from "@/components/ui/button"

export function AnalyticsHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#333] dark:text-white">Analytics</h1>

        <Button variant="outline" className="rounded-full border-gray-300 dark:border-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 14.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 19.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ml-2">Filters</span>
        </Button>
      </div>

      <div className="flex items-center">
        <Button variant="outline" className="rounded-full border-gray-300 dark:border-gray-700 text-sm">
          Compared to last month
        </Button>
      </div>
    </div>
  )
}
