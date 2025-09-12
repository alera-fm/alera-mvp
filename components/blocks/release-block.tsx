"use client"

import { useState } from "react"
import Image from "next/image"
import { Music, Youtube } from "lucide-react"
import { motion } from "framer-motion"

interface ReleaseBlockProps {
  title: string
  artwork_url: string
  streaming_links: {
    spotify?: string
    apple_music?: string
    youtube?: string
    [key: string]: string | undefined
  }
  themeColor?: string
  textColor?: string
  compact?: boolean
}

export default function ReleaseBlock({
  title,
  artwork_url,
  streaming_links,
  themeColor = "#E1FF3F",
  compact = false,
}: ReleaseBlockProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Normalize artwork URL and provide safe fallback
  const safeArtwork = typeof artwork_url === "string" ? artwork_url : ""
  const imageUrl = safeArtwork
    ? (safeArtwork.includes("example.com")
        ? `/placeholder.svg?height=500&width=500&query=album cover artwork for ${title}`
        : safeArtwork)
    : "/placeholder.svg"

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : ""}`}
          unoptimized
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        ></div>

        <div
          className={`absolute bottom-0 left-0 w-full p-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex flex-wrap gap-1.5">
            {streaming_links.spotify && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={streaming_links.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#1DB954] text-white text-xs font-medium shadow-lg"
              >
                <SpotifyLogo className="w-3 h-3" />
                <span className="hidden sm:inline">Spotify</span>
              </motion.a>
            )}

            {streaming_links.apple_music && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={streaming_links.apple_music}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#FA243C] text-white text-xs font-medium shadow-lg"
              >
                <Music className="w-3 h-3" />
                <span className="hidden sm:inline">Apple</span>
              </motion.a>
            )}

            {streaming_links.youtube && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={streaming_links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#FF0000] text-white text-xs font-medium shadow-lg"
              >
                <Youtube className="w-3 h-3" />
                <span className="hidden sm:inline">YouTube</span>
              </motion.a>
            )}
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-base font-bold mb-1 truncate text-white">{title}</h3>

        <div className="flex justify-between items-center">
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: themeColor }}></div>
        </div>
      </div>
    </div>
  )
}

function SpotifyLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.26 17.478a.747.747 0 01-1.03.249c-2.826-1.727-6.38-2.119-10.57-1.167a.75.75 0 11-.33-1.463c4.543-1.027 8.456-.586 11.54 1.304a.75.75 0 01.39 1.077zm1.48-3.282a.937.937 0 01-1.286.311c-3.24-1.985-8.185-2.562-12.02-1.41a.938.938 0 01-1.149-.64.937.937 0 01.64-1.148c4.358-1.273 9.83-.62 13.5 1.572.444.272.586.86.315 1.315zm.128-3.364a1.123 1.123 0 01-1.54.374c-3.703-2.258-9.348-2.766-13.721-1.521a1.125 1.125 0 01-.588-2.167c4.91-1.334 11.135-.754 15.3 1.83.53.323.698 1.02.35 1.484z" />
    </svg>
  )
}
