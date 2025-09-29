"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Calendar, Clock, Hash, Building, Copyright, TrendingUp, Users, Play, FileText, CheckCircle, XCircle, AlertTriangle, Eye, Trash2 } from "lucide-react"
import Image from "next/image"

interface Release {
  id: string
  trackTitle: string
  artistName: string
  releaseDate: string | null
  submissionDate: string
  status: string
  updateStatus?: string
  streams: number
  revenue: number
  platforms: string[]
  artwork: string | null
  genre: string
  secondaryGenre: string | null
  label: string | null
  copyright: string
  upcEan: string | null
  upc?: string
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

interface ReleaseCardProps {
  release: Release
  onView: (release: Release) => void
  onEdit: (release: Release) => void
  onTakedown: (release: Release) => void
  onDelete: (release: Release) => void
}

const getStatusColor = (status: Release["status"]) => {
  switch (status) {
    case "Live":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    case "Sent to Stores":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    case "Under Review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "Pending":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
    case "Draft":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
    case "Rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    case "Takedown Requested":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
    case "Takedown":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
  }
}

const getUpdateStatusColor = (updateStatus?: string) => {
  switch (updateStatus) {
    case 'Changes Submitted':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'Up-to-Date':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

export function ReleaseCard({ release, onView, onEdit, onTakedown, onDelete }: ReleaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.4)] transition-all duration-300"
    >
      {/* Cover Art - Prominent */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
        <Image
          src={release.artwork || "/placeholder.svg"}
          alt={`${release.trackTitle} cover`}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <Badge className={`text-xs font-medium ${getStatusColor(release.status)} flex items-center gap-1`}>
            {release.status === 'Draft' && <FileText className="h-3 w-3" />}
            {release.status === 'Pending' && <Clock className="h-3 w-3" />}
            {release.status === 'Under Review' && <Clock className="h-3 w-3" />}
            {release.status === 'Sent to Stores' && <CheckCircle className="h-3 w-3" />}
            {release.status === 'Live' && <Play className="h-3 w-3" />}
            {release.status === 'Rejected' && <XCircle className="h-3 w-3" />}
            {release.status === 'Takedown Requested' && <AlertTriangle className="h-3 w-3" />}
            {release.status === 'Takedown' && <XCircle className="h-3 w-3" />}
            {release.status}
          </Badge>
          {release.updateStatus && release.updateStatus !== 'Up-to-Date' && (
            <Badge className={`text-xs font-medium ${getUpdateStatusColor(release.updateStatus)}`}>
              Update Status: {release.updateStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* Title & Artist - Heading/Subheading */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#333] dark:text-white truncate mb-1">{release.trackTitle}</h3>
        <p className="text-sm text-[#666] dark:text-gray-400 truncate">{release.artistName}</p>
      </div>

      {/* Release Date - Prominent */}
      <div className="flex items-center gap-2 mb-4 text-sm text-[#666] dark:text-gray-400">
        <Calendar className="h-4 w-4" />
        <span>
          {release.releaseDate 
            ? `Released ${new Date(release.releaseDate).toLocaleDateString()}`
            : 'Release date not set'
          }
        </span>
      </div>

      {/* Metadata Stack */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs text-[#666] dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{release.status === 'Draft' ? 'Created' : 'Submitted'} {new Date(release.submissionDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#666] dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            <span>ISRC: {release.isrcCode || "Pending"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#666] dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            <span>Label: {release.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#666] dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Copyright className="h-3 w-3" />
            <span className="truncate">{release.copyright}</span>
          </div>
        </div>

        {release.upcEan && (
          <div className="flex items-center justify-between text-xs text-[#666] dark:text-gray-400">
            <span>UPC/EAN: {release.upcEan}</span>
          </div>
        )}

        {release.upc && (
          <div className="flex items-center justify-between text-xs text-[#666] dark:text-gray-400">
            <span>UPC: {release.upc}</span>
          </div>
        )}

        
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[#666] dark:text-gray-400">{release.genre}</span>
                    {release.secondaryGenre && (
                      <span className="text-xs text-[#666] dark:text-gray-400">• {release.secondaryGenre}</span>
                    )}
                    {release.explicitContent && (
                      <Badge variant="outline" className="text-xs">
                        Explicit
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#666] dark:text-gray-400 capitalize">
                      {release.distributionType}
                    </span>
                    {release.trackCount > 0 && (
                      <span className="text-xs text-[#666] dark:text-gray-400">
                        • {release.trackCount} {release.trackCount === 1 ? 'track' : 'tracks'}
                      </span>
                    )}
                  </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => onView(release)}
          variant="outline"
          size="sm"
          className="flex-1 rounded-full h-9 text-sm font-medium"
        >
          <Eye className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">View</span>
        </Button>
        <Button
          onClick={() => onEdit(release)}
          variant="outline"
          size="sm"
          className="flex-1 rounded-full h-9 text-sm font-medium"
        >
          <Edit className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        {(release.status === 'Live' || release.status === 'Sent to Stores' || release.status === 'Under Review') && (
          <Button
            onClick={() => onTakedown(release)}
            variant="outline"
            size="sm"
            className="flex-1 rounded-full h-9 text-sm font-medium text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
          >
            <AlertTriangle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Takedown</span>
          </Button>
        )}
        {release.status === 'Draft' && (
          <Button
            onClick={() => onDelete(release)}
            variant="outline"
            size="sm"
            className="flex-1 rounded-full h-9 text-sm font-medium text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}
      </div>
    </motion.div>
  )
}