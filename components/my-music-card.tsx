"use client"

import { motion } from "framer-motion"
import { Music, Play, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock music data
const tracks = [
  {
    id: 1,
    title: "Summer Vibes",
    artist: "Nova Sage",
    duration: "3:24",
    plays: "12.4K",
    status: "Released",
  },
  {
    id: 2,
    title: "Midnight Dreams",
    artist: "Nova Sage",
    duration: "4:12",
    plays: "8.7K",
    status: "Released",
  },
  {
    id: 3,
    title: "Electric Soul",
    artist: "Nova Sage",
    duration: "3:45",
    plays: "15.2K",
    status: "Released",
  },
]

export function MyMusicCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Music className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#333] dark:text-white">My Music</h3>
            <p className="text-sm text-[#666] dark:text-gray-400">Your latest releases</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-purple-500">
          <span className="text-xl font-bold">{tracks.length} tracks</span>
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-3 mb-6">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a2e] hover:bg-gray-100 dark:hover:bg-[#2a2a3e] transition-colors"
          >
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                <Play className="h-4 w-4 text-white ml-0.5" />
              </button>
              <div>
                <h4 className="font-medium text-[#333] dark:text-white">{track.title}</h4>
                <p className="text-sm text-[#666] dark:text-gray-400">
                  {track.duration} • {track.plays} plays
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {track.status}
              </span>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a4e] rounded-full transition-colors">
                <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full h-12">
    <Link className="flex items-center justify-center gap-2" href="/dashboard/my-music">
       View All Music
      </Link>
     
      </Button>
    </motion.div>
  )
}
