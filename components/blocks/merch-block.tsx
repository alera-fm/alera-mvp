"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"

interface MerchItem {
  name: string
  image_url: string
  price: string
  product_link: string
}

interface MerchBlockProps {
  item: MerchItem
  themeColor?: string
}

export default function MerchBlock({ item, themeColor = "#E1FF3F" }: MerchBlockProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Use placeholder image if image_url is from example.com
  const imageUrl = item.image_url.includes("example.com")
    ? `/placeholder.svg?height=500&width=500&query=music merchandise ${item.name}`
    : item.image_url

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={item.product_link}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 h-full"
      >
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={item.name}
            fill
            className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : ""}`}
            unoptimized
          />

          {/* Overlay gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          ></div>

          {/* Buy button overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <motion.div
              className="px-4 py-2 rounded-full flex items-center gap-1.5 text-sm font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ backgroundColor: themeColor, color: 'white' }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Now</span>
            </motion.div>
          </div>
        </div>

        <div className="p-3">
          <h4
            className={`font-medium text-sm line-clamp-1 transition-colors ${isHovered ? "text-white" : "text-white/80"}`}
          >
            {item.name}
          </h4>
          <p className="text-base mt-1 font-bold" style={{ color: themeColor }}>{item.price}</p>
        </div>
      </a>
    </motion.div>
  )
}
