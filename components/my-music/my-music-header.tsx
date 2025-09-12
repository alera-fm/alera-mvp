"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, Music } from "lucide-react"
import Link from "next/link"

interface MyMusicHeaderProps {
  totalReleases: number
}

export function MyMusicHeader({ totalReleases }: MyMusicHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
          <Music className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#333] dark:text-white">My Music</h1>
          <p className="text-sm text-[#666] dark:text-gray-400">
            {totalReleases} {totalReleases === 1 ? "release" : "releases"} in your catalog
          </p>
        </div>
      </div>

      <Button asChild className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90 rounded-full h-12 px-6 font-medium">
        <Link href="/dashboard/new-release">
          <Plus className="h-4 w-4 mr-2" />
          Distribute New Release
        </Link>
      </Button>
    </motion.div>
  )
}
