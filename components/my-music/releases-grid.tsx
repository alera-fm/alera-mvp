"use client"

import { motion } from "framer-motion"
import { ReleaseCard } from "./release-card"

interface Release {
  id: string
  trackTitle: string
  artistName: string
  releaseDate: string | null
  submissionDate: string
  status: string
  streams: number
  revenue: number
  platforms: string[]
  artwork: string | null
  genre: string
  secondaryGenre: string | null
  label: string | null
  copyright: string
  upcEan: string | null
  explicitContent: boolean
  credits: {
    producers: string[]
    writers: string[]
    composers: string[]
    engineers: string[]
    mixedBy: string[]
    masteredBy: string[]
    featuredArtists: string[]
  }
  lyrics: string | null
  isrcCode: string | null
  trackCount: number
  distributionType: string
}

interface ReleasesGridProps {
  releases: Release[]
  onEdit: (release: Release) => void
}

export function ReleasesGrid({ releases, onEdit }: ReleasesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {releases.map((release, index) => (
        <motion.div
          key={release.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ReleaseCard release={release} onEdit={onEdit} />
        </motion.div>
      ))}
    </div>
  )
}
