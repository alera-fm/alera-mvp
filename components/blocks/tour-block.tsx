"use client"

import { Calendar, MapPin, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface TourDate {
  city: string
  date: string
  venue: string
  ticket_link: string
}

interface TourBlockProps {
  date: TourDate
  themeColor?: string
  textColor?: string
}

export default function TourBlock({ date, themeColor = "#E1FF3F", textColor = "#0B0B0F" }: TourBlockProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full"
    >
      <div className="flex flex-col h-full">
        {/* Date header */}
        <div
          className="w-full flex-shrink-0 flex items-center justify-center p-3 text-alera-purple-dark font-bold"
          style={{
            background: themeColor,
            color: textColor
          }}
        >
          <span className="text-2xl mr-2">{new Date(date.date).getDate()}</span>
          <span className="uppercase text-xs tracking-wider">
            {new Date(date.date).toLocaleDateString("en-US", { month: "short" })}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 p-4">
          <h4 className="font-bold text-lg">{date.city}</h4>
          <div className="flex items-center gap-1 text-white/70 text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{date.venue}</span>
          </div>
          <div className="flex items-center gap-1 text-white/70 text-sm mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(date.date)}</span>
          </div>
        </div>

        {/* Ticket button */}
        <div className="p-3 border-t border-white/10">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={date.ticket_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-1.5 shadow-lg"
            style={{ backgroundColor: themeColor, color: textColor }} >
            <span>Tickets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
}
