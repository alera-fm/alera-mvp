"use client"

import { useMemo, useState } from "react"
import { Lock, Star, Unlock, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LockedContentBlockProps {
  title: string
  media_url: string
  locked: boolean
  unlock_method: string
  themeColor?: string
  textColor?: string
  subscription_link?: string
}

export default function LockedContentBlock({
  title,
  media_url,
  locked: initialLocked,
  unlock_method,
  themeColor = "#E1FF3F",
  textColor = "#0B0B0F",
  subscription_link = ''
}: LockedContentBlockProps) {
  const [locked, setLocked] = useState(initialLocked)
  const [unlocking, setUnlocking] = useState(false)
  const [email, setEmail] = useState("")
  const [showSubscribeForm, setShowSubscribeForm] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [isPaidFan, setIsPaidFan] = useState(false)

  const toEmbedUrl = useMemo(() => {
    const toSeconds = (t: string) => {
      if (!t) return 0
      // supports 1h2m3s or 90s or 120
      const h = /([0-9]+)h/.exec(t)?.[1]
      const m = /([0-9]+)m/.exec(t)?.[1]
      const s = /([0-9]+)s/.exec(t)?.[1]
      if (h || m || s) return (parseInt(h||'0')*3600)+(parseInt(m||'0')*60)+parseInt(s||'0')
      if (/^\d+$/.test(t)) return parseInt(t)
      return 0
    }
    try {
      const u = new URL(media_url || '', typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
      const host = u.hostname.replace('www.', '')
      if (host.includes('youtube.com')) {
        // watch?v=ID or shorts/ID
        let id = u.searchParams.get('v') || ''
        if (!id && u.pathname.includes('/shorts/')) id = u.pathname.split('/shorts/')[1]?.split('/')[0] || ''
        const start = toSeconds(u.searchParams.get('t') || '')
        if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${start?`&start=${start}`:''}`
      }
      if (host.includes('youtu.be')) {
        const id = u.pathname.slice(1)
        const start = toSeconds(u.searchParams.get('t') || '')
        if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${start?`&start=${start}`:''}`
      }
      if (host.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean)[0]
        if (id) return `https://player.vimeo.com/video/${id}`
      }
      return media_url
    } catch {
      return media_url
    }
  }, [media_url])

  // Deterministic PRNG to avoid hydration mismatches (no Math.random in render)
  const hashString = (str: string): number => {
    let h = 2166136261
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
    }
    return h >>> 0
  }
  const mulberry32 = (a: number) => {
    return () => {
      let t = (a += 0x6d2b79f5)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  const starParams = useMemo(() => {
    const seed = hashString(`${title}-${unlock_method}`)
    return Array.from({ length: 20 }).map((_, i) => {
      const rnd = mulberry32(seed + i * 9973)
      const rand = () => rnd()
      const pct = (n: number) => `${n.toFixed(3)}%`
      const x = pct(rand() * 100)
      const y = pct(rand() * 100)
      const op1 = rand() * 0.7 + 0.3
      const sc = rand() * 0.5 + 0.5
      const oAnim = [rand() * 0.7 + 0.3, rand() * 0.9 + 0.1, rand() * 0.7 + 0.3]
      const dur = rand() * 3 + 2
      return { x, y, opacity: op1, scale: sc, opacityAnim: oAnim, duration: dur }
    })
  }, [title, unlock_method])

  const handleUnlock = async () => {
    if (!showSubscribeForm) {
      setShowSubscribeForm(true)
      return
    }

    if (!email || !email.includes("@")) {
      setSubscriptionStatus("error")
      setStatusMessage("Please enter a valid email address")
      return
    }

    setSubscriptionStatus("loading")
    setUnlocking(true)

    try {
      const url = typeof window !== 'undefined' ? window.location.pathname : ''
      const slugMatch = url.match(/\/p\/(.+)$/)
      const slug = slugMatch ? slugMatch[1] : ''
      const res = await fetch('/api/public/verify-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, slug })
      })
      const data = await res.json()
      if (data?.paid) {
        setIsPaidFan(true)
        setLocked(false)
        setStatusMessage('Access granted.')
        setSubscriptionStatus('success')
      } else {
        setIsPaidFan(false)
        setSubscriptionStatus('error')
        setStatusMessage('This email is not a paid subscriber yet.')
      }
    } catch (e) {
      setSubscriptionStatus('error')
      setStatusMessage('Could not verify subscriber.')
    } finally {
      setUnlocking(false)
    }
  }

  return (
    <div className="space-y-4 w-full h-auto">
      <h3 className="text-2xl font-bold text-white" style={{color: textColor}}>{title}</h3>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden border border-white/20 shadow-xl"
        style={{ boxShadow: `0 0 30px ${themeColor}10` }}
      >
        {locked ? (
          <div className="aspect-[16/10] h-[300px] sm:h-auto sm:aspect-video bg-gradient-to-br from-alera-purple-dark/80 via-alera-purple/60 to-alera-purple-dark/80 w-full relative overflow-hidden">
            {/* Animated stars background - deterministic values to prevent hydration mismatch */}
            <div className="absolute inset-0 overflow-hidden">
              {starParams.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{
                    x: p.x,
                    y: p.y,
                    opacity: p.opacity,
                    scale: p.scale,
                  }}
                  animate={{
                    opacity: p.opacityAnim,
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Star className="w-3 h-3 text-white/30" fill="white" />
                </motion.div>
              ))}
            </div>

            {/* Content overlay */}
            <div className={`absolute inset-0 backdrop-blur-sm bg-black/40 flex flex-col ${locked ? 'items-center p-4 sm:p-6 text-center' : 'items-stretch p-0'} justify-center`}>
              <AnimatePresence mode="wait">
                {unlocking ? (
                  <motion.div
                    key="unlocking"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto"
                      style={{
                        backgroundColor: themeColor,
                      }}
                    >
                      <Unlock className="w-10 h-10 text-alera-purple-dark" />
                    </motion.div>
                    <h4 className="text-xl font-bold mb-2">Unlocking Content...</h4>
                    <p className="text-white/70 mb-4">Please wait while we prepare your exclusive content.</p>
                  </motion.div>
                ) : showSubscribeForm ? (
                  <motion.div
                    key="subscribe-form"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full max-w-md"
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto"
                      style={{
                        backgroundColor: themeColor,
                      }}
                    >
                      <Lock className="w-10 h-10 text-alera-purple-dark" />
                    </div>

                    <h4 className="text-xl font-bold mb-2">Subscribe to Unlock</h4>
                    <p className="text-white/70 mb-4">Enter your email to access exclusive content.</p>

                    <div className="relative mb-4">
                      <input
                        type="email"
                        placeholder="Your email address"
                        className="w-full px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-alera-yellow/50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={subscriptionStatus === "loading"}
                      />
                    </div>

                    {statusMessage && (
                      <div
                        className={`text-sm ${
                          subscriptionStatus === "success" ? "text-green-400" : "text-red-400"
                        } mb-4 flex items-center justify-center`}
                      >
                        {subscriptionStatus === "success" ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-1" />
                        )}
                        <span>
                          {statusMessage}
                          {subscriptionStatus === 'error' && (
                            <>
                              {' '}
                              <a href="#welcome" className="underline" style={{ color: themeColor }}>Join now</a>
                              {' '}to become a paid subscriber.
                            </>
                          )}
                        </span>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUnlock}
                      disabled={subscriptionStatus === "loading"}
                      className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-medium shadow-lg mb-2 flex items-center justify-center mx-auto"
                      style={{ backgroundColor: themeColor, color: 'white' }}
                    >
                      {subscriptionStatus === "loading" ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <>Access Now</>
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative"
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto"
                      style={{
                        backgroundColor: themeColor,
                      }}
                    >
                      <Lock className="w-10 h-10 text-alera-purple-dark" />
                    </div>

                    <h4 className="text-xl font-bold mb-2">Exclusive Content</h4>
                    <p className="text-white/70 mb-4 sm:mb-6 max-w-xs text-sm sm:text-base">
                      {unlock_method === "subscription"
                        ? "Subscribe to unlock behind-the-scenes footage, unreleased tracks, and more exclusive content."
                        : "Sign up to unlock this exclusive content and get early access to future releases."}
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUnlock}
                      className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-medium shadow-lg mb-2 bg-alera-yellow text-alera-purple-dark"
                      style={{ backgroundColor: themeColor, color: 'white' }}
                    >
                      Access Now
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="aspect-[16/10] h-[300px] sm:h-auto sm:aspect-video bg-black w-full relative overflow-hidden">
            <div className="absolute w-full h-full inset-0 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className=" w-full h-full"
              >
                {media_url ? (
                  <div className="w-full h-full aspect-video">
                    <iframe className="w-full h-full" src={toEmbedUrl || media_url} referrerPolicy="no-referrer-when-downgrade" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                  </div>
                ) : (
                  <div className="text-white/80">Exclusive content is ready.</div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
      <div className="text-xs mt-2" style={{ color: textColor }}>
        Not a subscriber yet?{' '}
        <a href={subscription_link} target="_blank" rel="noreferrer" className="underline" style={{ color: themeColor }}>
          Join now
        </a>
        .
      </div>
    </div>
  )
}
