"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Calendar, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Play, Eye } from "lucide-react"
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
  secondaryGenre?: string
  label: string
  copyright: string
  upcEan?: string
  upc?: string
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

interface ReleasesTableProps {
  releases: Release[]
  onView: (release: Release) => void
  onEdit: (release: Release) => void
  onTakedown: (release: Release) => void
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

export function ReleasesTable({ releases, onView, onEdit, onTakedown }: ReleasesTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 dark:border-gray-800">
              <TableHead className="w-[80px] pl-6">Cover</TableHead>
              <TableHead className="min-w-[200px]">Track Details</TableHead>
              <TableHead className="min-w-[120px]">Release Date</TableHead>
              <TableHead className="min-w-[120px]">Label</TableHead>
              <TableHead className="min-w-[120px]">ISRC/UPC</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {releases.map((release, index) => (
              <motion.tr
                key={release.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a2e] transition-colors"
              >
                <TableCell className="pl-6">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={release.artwork || "/placeholder.svg"}
                      alt={`${release.trackTitle} cover`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <h4 className="font-semibold text-[#333] dark:text-white">{release.trackTitle}</h4>
                    <p className="text-sm text-[#666] dark:text-gray-400">{release.artistName}</p>
                    <div className="flex items-center gap-2 mt-1">
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
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-[#666] dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : 'Date not set'}
                  </div>
                  <div className="text-xs text-[#666] dark:text-gray-400 mt-1">
                    Submitted: {new Date(release.submissionDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-[#666] dark:text-gray-400 mt-1 capitalize">
                    {release.distributionType} • {release.trackCount || 0} {release.trackCount === 1 ? 'track' : 'tracks'}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm text-[#333] dark:text-white">{release.label}</div>
                  <div className="text-xs text-[#666] dark:text-gray-400 mt-1 truncate max-w-[120px]">
                    {release.copyright}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">
                      ISRC: {release.isrcCode || "Pending"}
                    </code>
                    {release.upc && (
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">
                        UPC: {release.upc}
                      </code>
                    )}
                    {release.upcEan && (
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">
                        UPC/EAN: {release.upcEan}
                      </code>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-1">
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
                </TableCell>

                <TableCell className="text-right pr-6">
                  <div className="flex gap-2 justify-end">
                    <Button onClick={() => onView(release)} variant="outline" size="sm" className="rounded-full h-8 px-3">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button onClick={() => onEdit(release)} variant="outline" size="sm" className="rounded-full h-8 px-3">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {(release.status === 'Live' || release.status === 'Sent to Stores' || release.status === 'Under Review') && (
                      <Button 
                        onClick={() => onTakedown(release)} 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full h-8 px-3 text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/20"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Takedown
                      </Button>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}
