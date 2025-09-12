"use client"

import { motion } from "framer-motion"
import { Music, Play, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"


export function MyMusicCard( { tracks = [], loading = false}: { tracks?: any[], loading?: boolean } ) {
  const formatStatus = (status?: string) => {
    if (!status) return "Unknown"
    const s = status.toLowerCase().replace(/\s+/g, "_")
    switch (s) {
      case "under_review":
        return "Under Review"
      case "sent_to_stores":
        return "Sent to Stores"
      case "live":
        return "Live"
      case "rejected":
        return "Rejected"
      default:
        return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    }
  }

  const statusColor = (status?: string) => {
    const s = (status || "").toLowerCase().replace(/\s+/g, "_")
    if (s === "live") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    if (s === "sent_to_stores") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    if (s === "under_review") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    if (s === "rejected") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    return "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-200"
  }
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
          {loading ? (
            <Skeleton className="h-6 w-24 rounded-full" />
          ) : (
            <span className="text-xl font-bold">{tracks.length} tracks</span>
          )}
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-3 mb-6">
        {loading && tracks.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a2e]">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))
        ) : (
        tracks?.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1a1a2e] hover:bg-gray-100 dark:hover:bg-[#2a2a3e] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-white ml-0.5" />
              </div>
              <div>
                <h4 className="font-medium text-[#333] dark:text-white">{track.release_title}</h4>
                <p className="text-sm text-[#666] dark:text-gray-400">{formatStatus(track.status)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor(track.status)}`}>
                {formatStatus(track.status)}
              </span>
     
            </div>
          </div>
        ))
        )}
      </div>

      <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full h-12">
    <Link className="flex items-center justify-center gap-2" href="/dashboard/my-music">
       View All Music
      </Link>
     
      </Button>
    </motion.div>
  )
}


