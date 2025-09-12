"use client"

import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WalletHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        <h2 className="text-2xl font-bold text-[#333] dark:text-white">Wallet</h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="rounded-full border-gray-300 dark:border-gray-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 14.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 19.5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ml-2">Filtres</span>
        </Button>

        <Button className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90 rounded-full">
          <span className="mr-2">Withdraw</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
