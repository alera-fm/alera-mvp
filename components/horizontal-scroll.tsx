"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

interface HorizontalScrollProps {
  children: React.ReactNode[]
  itemWidth?: number
  gap?: number
  className?: string
  showArrows?: boolean
}

export default function HorizontalScroll({
  children,
  itemWidth = 280,
  gap = 16,
  className = "",
  showArrows = true,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const updateArrows = () => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", updateArrows)
      // Initial check
      updateArrows()

      // Check if scrolling is needed at all
      setShowRightArrow(scrollElement.scrollWidth > scrollElement.clientWidth)
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", updateArrows)
      }
    }
  }, [children])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return

    const scrollAmount = direction === "left" ? -itemWidth - gap : itemWidth + gap
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  return (
    <div className={`relative group mx-auto ${className}`}>
      {showArrows && showLeftArrow && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-alera-purple-light/80 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-alera-purple-light transition-all"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children.map((child, index) => (
          <div key={index} className="flex-shrink-0 snap-start" style={{ width: `${itemWidth}px` }}>
            {child}
          </div>
        ))}
      </div>

      {showArrows && showRightArrow && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-alera-purple-light/80 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-alera-purple-light transition-all"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  )
}
