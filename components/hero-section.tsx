"use client"

import { motion } from "framer-motion"

interface HeroSectionProps {
  artistName: string
  themeColor: string
  showMusic?: boolean
  showTour?: boolean
  showMerch?: boolean
  showSubscribe?: boolean
  showAbout?: boolean
  showVideo?: boolean
  showWelcome?: boolean
  showTip?: boolean
  labelMusic?: string
  labelVideo?: string
  labelTip?: string
  labelTour?: string
  labelMerch?: string
  labelSubscribe?: string
  labelAbout?: string
  labelWelcome?: string
}

export default function HeroSection({ artistName, themeColor, showMusic = false, showTour = false, showMerch = false, showSubscribe = false, showAbout = false, showVideo = false, showTip = false, showWelcome = false, labelMusic = 'Music', labelVideo = 'Videos', labelTip = 'Tip Jar', labelTour = 'Tour', labelMerch = 'Merch', labelSubscribe = 'Gated', labelAbout = 'About', labelWelcome = 'Welcome' }: HeroSectionProps) {
  // Enforce order: Welcome -> Music -> Videos -> Tip Jar -> Tours -> Merch -> Gated -> About
  const menuItems = [
    showWelcome && { name: labelWelcome, href: "#welcome" },
    showMusic && { name: labelMusic, href: "#music" },
    showVideo && { name: labelVideo, href: "#video" },
    showTip && { name: labelTip, href: "#tip" },
    showTour && { name: labelTour, href: "#tour" },
    showMerch && { name: labelMerch, href: "#merch" },
    showSubscribe && { name: labelSubscribe, href: "#subscribe" },
    showAbout && { name: labelAbout, href: "#about" },
  ].filter(Boolean) as { name: string; href: string }[]

  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20 bg-alera-purple-light"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: themeColor }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></div>
              <span className="text-sm font-medium">Official Artist Page</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: 'inherit' }}>{artistName}</h1>
        </motion.div>


        {/* New horizontal menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center items-center gap-6 sm:gap-10 flex-wrap"
        >
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="transition-colors text-base sm:text-lg font-medium relative group"
              style={{ color: 'inherit', opacity: 0.85 }}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: themeColor }} />
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
