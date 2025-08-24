"use client"

import { motion } from "framer-motion"
import { Music } from "lucide-react"

interface BioBlockProps {
  title: string
  content: string
  themeColor?: string
}

export default function BioBlock({ title, content, themeColor = "#E1FF3F" }: BioBlockProps) {
  return (
    <div className="space-y-4 w-full">
      <h3 className="text-2xl font-bold" style={{ color: 'inherit' }}>{title}</h3>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-lg relative overflow-hidden"
      >
        {/* Decorative music note */}
        <div className="absolute -right-8 -bottom-8 opacity-5">
          <Music className="w-32 h-32" />
        </div>

        {/* Decorative accent */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
          style={{
            background: `linear-gradient(to right, ${themeColor}, transparent)`,
          }}
        />

        <p className="leading-relaxed relative z-10" style={{ color: 'inherit', opacity: 0.9 }}>{content}</p>
      </motion.div>
    </div>
  )
}
