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
  secondaryGenre?: string | null
  label: string
  copyright: string
  upcEan?: string
  explicitContent: boolean
  credits: {
    producers: string[]
    writers: string[]
    composers: string[]
    engineers?: string[]
    mixedBy?: string[]
    masteredBy?: string[]
    featuredArtists?: string[]
  }
  lyrics?: string
  isrcCode?: string
  trackCount?: number
  distributionType?: string
  language?: string
  instrumental?: boolean
  versionInfo?: string
  versionOther?: string
  originalReleaseDate?: string
  previouslyReleased?: boolean
  albumCoverUrl?: string
  selectedStores?: string[]
  trackPrice?: number
  termsAgreed?: boolean
  fakeStreamingAgreement?: boolean
  distributionAgreement?: boolean
  artistNamesAgreement?: boolean
  snapchatTerms?: boolean
  youtubeMusicAgreement?: boolean
}

interface ReleasesGridProps {
  releases: Release[]
  onView: (release: Release) => void
  onEdit: (release: Release) => void
  onTakedown: (release: Release) => void
}

export function ReleasesGrid({ releases, onView, onEdit, onTakedown }: ReleasesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {releases.map((release, index) => (
        <motion.div
          key={release.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ReleaseCard release={release} onView={onView} onEdit={onEdit} onTakedown={onTakedown} />
        </motion.div>
      ))}
    </div>
  )
}
