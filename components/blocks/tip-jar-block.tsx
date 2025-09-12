"use client"

import { useState } from "react"
import { Heart, DollarSign } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TipJarBlockProps {
  title: string
  description: string
  currency: string
  preset_amounts: number[]
  custom_amount_enabled: boolean
  thank_you_message: string
  payment_link: string
  themeColor?: string
  background?: string
  textColor?: string
}

export default function TipJarBlock({
  title,
  description,
  currency,
  preset_amounts,
  custom_amount_enabled,
  thank_you_message,
  payment_link,
  themeColor = "#E1FF3F",
  background = "#0B0B0F",
  textColor = "#0B0B0F"
}: TipJarBlockProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [showThankYou, setShowThankYou] = useState(false)

  const handleTip = () => {
    // In a real implementation, this would redirect to the payment processor
    // For now, just show the thank you message
    setShowThankYou(true)
    setTimeout(() => setShowThankYou(false), 3000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden shadow-xl w-full max-w-6xl mx-auto"
    >
      {/* Header with gradient background */}
      <div className="p-6 text-center relative overflow-hidden bg-alera-purple-ligh rounded-2xl" style={{ backgroundColor: background, border:`1px solid ${themeColor}` }}>

        <h3 className="text-2xl font-bold relative z-10">{title}</h3>
        <p className="text-white/80 text-sm mt-2 relative z-10 max-w-xs mx-auto">{description}</p>
      </div>

      <div className="p-6 pace-y-5">
        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <Heart className="w-16 h-16 mx-auto mb-4" fill={themeColor} stroke={themeColor} />
              </motion.div>
              <p className="font-medium text-lg">{thank_you_message}</p>
            </motion.div>
          ) : (
            <motion.div
              key="tip-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Simplified Tip Jar - direct CTA only */}

              <div>
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleTip}
                  className="block w-full py-3 rounded-full text-center font-medium shadow-lg"
                  style={{ backgroundColor: themeColor, color: textColor }}
                >
                  Support Now
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
