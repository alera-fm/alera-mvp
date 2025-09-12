"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { motion } from "framer-motion"

interface VideoBlockProps {
  title: string
  video_url: string
  thumbnail_url: string
  themeColor?: string
}

export default function VideoBlock({ title, video_url, thumbnail_url, themeColor = "#E1FF3F" }: VideoBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)

  // Extract video ID and helpers
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\?v=|&v=)([^#&?\s]{11}).*/
    const match = url?.match(regExp)
    return match && match[1] && match[1].length === 11 ? match[1] : null
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const id = getYouTubeId(url)
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url
  }

  // Prefer provided thumbnail; else fall back to YouTube default thumbnail if URL is YouTube; else a generic placeholder
  const youtubeId = getYouTubeId(video_url)
  const imageUrl = (thumbnail_url && thumbnail_url.trim().length > 0)
    ? thumbnail_url
    : (youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : `/placeholder.svg?height=720&width=1280&query=${encodeURIComponent(title || 'video')}`)

  const embedUrl = getYouTubeEmbedUrl(video_url)

  return (
    <div className="space-y-4 w-full max-w-6xl mx-auto">
      <h3 className="text-2xl font-bold text-white">{title}</h3>

      <motion.div
        ref={videoRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-xl"
      >
        {isPlaying ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <motion.div
            className="relative aspect-video w-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover" unoptimized />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80"></div>

            {/* Play button */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ backgroundColor: themeColor }}
              >
                <Play className="w-10 h-10 ml-1" style={{ color: 'white' }} />
              </motion.div>
            </motion.div>

            {/* Video title overlay */}
            <div className="absolute bottom-0 left-0 w-full p-4">
              <p className="text-white/90 text-sm font-medium">Official Music Video</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
