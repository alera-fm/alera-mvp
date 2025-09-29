"use client"

import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CheckCircle, Mail, ArrowRight, Music, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function WelcomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userEmail = searchParams.get('email') || 'your email address'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="border-0 shadow-xl bg-white dark:bg-[#0f0f1a] overflow-hidden">
        {/* Success Header with Animation */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="flex justify-center pt-8 pb-4"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            {/* Sparkle animations */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>

        <CardHeader className="text-center pb-6">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl font-bold text-[#333] dark:text-white mb-2"
          >
            Welcome to ALERA! Your account has been created successfully.
          </motion.h1>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Verification Notice */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex-shrink-0 mt-0.5">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Check Your Email
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We've sent a verification email to <strong>{userEmail}</strong>. Please click the link in the email to activate your account and start your music journey.
              </p>
            </div>
          </motion.div>

          {/* What's Next Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-[#333] dark:text-white flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              What's Next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">1</span>
                </div>
                <span className="text-[#666] dark:text-gray-400">Click the link we sent to verify your email</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">2</span>
                </div>
                <span className="text-[#666] dark:text-gray-400">Sign in to your account</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <span className="text-[#666] dark:text-gray-400">Start building your music career</span>
              </div>
            </div>
          </motion.div>

          {/* Spam Folder Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-sm text-[#666] dark:text-gray-400">
              Didn't receive it? Be sure to check your spam or junk folder.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
