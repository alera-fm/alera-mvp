"use client"

import React from "react"
import { motion } from "framer-motion"

interface GridLayoutProps {
  children: React.ReactNode[]
  className?: string
  columns?: number
}

export default function GridLayout({ children, className = "", columns = 3 }: GridLayoutProps) {
  // If we have fewer items than columns, center them
  const itemCount = React.Children.count(children)
  const shouldCenter = itemCount < columns && itemCount > 0

  // Determine grid columns based on screen size and item count
  const getGridCols = () => {
    if (shouldCenter) {
      // For 1 item, use 1 column on all screens
      if (itemCount === 1) return "grid-cols-1"

      // For 2 items, use 2 columns on all screens
      return "grid-cols-2"
    }

    // Default responsive grid based on columns prop
    if (columns === 2) {
      return "grid-cols-1 sm:grid-cols-2"
    } else if (columns === 4) {
      return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    }

    // Default 3-column grid
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  }

  return (
    <div
      className={`grid ${getGridCols()} gap-6 ${shouldCenter ? "justify-center max-w-2xl mx-auto" : ""} ${className}`}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="w-full"
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
