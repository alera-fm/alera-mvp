"use client"

import { Instagram, Twitter } from "lucide-react"
import { motion } from "framer-motion"

interface SocialLinksProps {
  links: {
    instagram?: string
    tiktok?: string
    twitter?: string
    [key: string]: string | undefined
  }
  themeColor?: string
}

export default function SocialLinks({ links, themeColor = "#E1FF3F" }: SocialLinksProps) {
  const socialVariants = {
    hover: {
      scale: 1.2,
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.9,
      transition: { duration: 0.1 },
    },
  }

  return (
    <div className="flex justify-center gap-8">
      {links.instagram && (
        <motion.a
          whileHover="hover"
          whileTap="tap"
          variants={socialVariants}
          href={links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-colors relative group px-3 py-1 rounded-full"
          style={{ backgroundColor: `${themeColor}30` }}
          aria-label="Instagram"
          style={{ filter: `drop-shadow(0 0 8px ${themeColor}50)` }}
        >
          <Instagram className="w-7 h-7" />
          <motion.span
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300"
            style={{ backgroundColor: themeColor }}
          />
        </motion.a>
      )}

      {links.tiktok && (
        <motion.a
          whileHover="hover"
          whileTap="tap"
          variants={socialVariants}
          href={links.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-colors relative group px-3 py-1 rounded-full"
          style={{ backgroundColor: `${themeColor}30` }}
          aria-label="TikTok"
          style={{ filter: `drop-shadow(0 0 8px ${themeColor}50)` }}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"
              fill="currentColor"
            />
          </svg>
          <motion.span
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300"
            style={{ backgroundColor: themeColor }}
          />
        </motion.a>
      )}

      {links.twitter && (
        <motion.a
          whileHover="hover"
          whileTap="tap"
          variants={socialVariants}
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-colors relative group px-3 py-1 rounded-full"
          style={{ backgroundColor: `${themeColor}30` }}
          aria-label="Twitter"
          style={{ filter: `drop-shadow(0 0 8px ${themeColor}50)` }}
        >
          <Twitter className="w-7 h-7" />
          <motion.span
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300"
            style={{ backgroundColor: themeColor }}
          />
        </motion.a>
      )}
    </div>
  )
}
