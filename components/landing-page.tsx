"use client"

import { useState, useEffect, type FormEvent } from "react"
import Image from "next/image"
import ReleaseBlock from "./blocks/release-block"
import VideoBlock from "./blocks/video-block"
import TourBlock from "./blocks/tour-block"
import MerchBlock from "./blocks/merch-block"
import LockedContentBlock from "./blocks/locked-content-block"
import WelcomeBlock from "./blocks/welcome-block"
import BioBlock from "./blocks/bio-block"
import TipJarBlock from "./blocks/tip-jar-block"
import SocialLinks from "./social-links"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
// Import the HorizontalScroll component
import HorizontalScroll from "./horizontal-scroll"
// Import the AnimatedBackground component
import AnimatedBackground from "./animated-background"
// Import the HeroSection component
import HeroSection from "./hero-section"

interface LandingPageProps {
  config: any
}

export default function LandingPage({ config }: LandingPageProps) {
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [email, setEmail] = useState("")
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const safeConfig: any = config || {}
  const theme = (safeConfig && safeConfig.theme) || { backgroundColor: undefined, textColor: undefined, fontFamily: undefined }
  const accent = (safeConfig && safeConfig.theme_color) || '#E1FF3F'

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault()
    window.location.href = "mailto:contact@alera.fm"
  }

  const renderBlock = (block: any, index: number) => {
    const blockProps = {
      ...block,
      themeColor: config.theme_color,
    }

    const blockVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.1,
          duration: 0.5,
        },
      }),
    }

    const BlockComponent = () => {
      switch (block.type) {
        case "welcome":
          return <WelcomeBlock {...blockProps} />
        case "video":
          return <VideoBlock {...blockProps} />
        case "locked_content":
          return <LockedContentBlock {...blockProps} />
        case "bio":
          return <BioBlock {...blockProps} />
        case "tip_jar":
          return <TipJarBlock {...blockProps} />
        default:
          return null
      }
    }

    return (
      <motion.div
        key={`${block.type}-${index}`}
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={blockVariants}
        className="w-full"
      >
        <BlockComponent />
      </motion.div>
    )
  }

  // Group blocks by type
  const groupBlocksByType = () => {
    const allBlocks: any[] = Array.isArray(safeConfig.blocks) ? safeConfig.blocks : []
    const releases = allBlocks.filter((block) => block.type === "release")
    const tours = allBlocks.filter((block) => block.type === "tour")
    const merch = allBlocks.filter((block) => block.type === "merch")
    const lockedContent = allBlocks.filter((block) => block.type === "locked_content")
    const bio = allBlocks.filter((block) => block.type === "bio")
    const tipJar = allBlocks.filter((block) => block.type === "tip_jar")
    const video = allBlocks.filter((block) => block.type === "video")
    const welcome = allBlocks.filter((block) => block.type === "welcome")

    return { releases, tours, merch, lockedContent, bio, tipJar, video, welcome }
  }

  const blocks = groupBlocksByType()

  return (
    <div className="min-h-screen flex flex-col alera-gradient" style={{ background: theme.backgroundColor || undefined, color: theme.textColor || undefined, fontFamily: theme.fontFamily || undefined }}>
      {/* Decorative elements */}
      <AnimatedBackground themeColor={accent} />

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md border-b py-4" style={{ backgroundColor: theme.backgroundColor || undefined, borderColor: accent }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          <h1 className="text-2xl font-bold relative" style={{ color: theme.textColor || undefined }}>{config.artist_name}</h1>

          <a
            href="#contact"
            className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-medium hover:bg-white/20 transition-all"
            style={{ color: theme.textColor || undefined }}
          >
            Contact Info
          </a>
        </div>
      </header>

      {/* Add the HeroSection component to the layout */}
      <HeroSection
        artistName={config.artist_name}
        themeColor={accent}
        showWelcome={(blocks.welcome || []).length > 0}
        showMusic={(blocks.releases || []).length > 0}
        showTour={(blocks.tours || []).length > 0}
        showMerch={(blocks.merch || []).length > 0}
        showVideo={(blocks.video || []).length > 0}
        showSubscribe={(blocks.lockedContent || []).length > 0}
        showAbout={(blocks.bio || []).length > 0}
        showTip={(blocks.tipJar || []).length > 0}
        labelMusic={(blocks.releases && blocks.releases.length > 0 && (blocks.releases[0].title || 'Releases')) || 'Releases'}
        labelVideo={(blocks.video && blocks.video.length > 0 && (blocks.video[0].title || 'Videos')) || 'Videos'}
        labelTip={(blocks.tipJar && blocks.tipJar.length > 0 && (blocks.tipJar[0].title || 'Tip Jar')) || 'Tip Jar'}
        labelTour={(blocks.tours && blocks.tours.length > 0 && (blocks.tours[0].title || 'Tour')) || 'Tour'}
        labelMerch={(blocks.merch && blocks.merch.length > 0 && (blocks.merch[0].title || 'Merch')) || 'Merch'}
        labelSubscribe={(blocks.lockedContent && blocks.lockedContent.length > 0 && (blocks.lockedContent[0].title || 'Gated')) || 'Gated'}
        labelWelcome={(blocks.welcome && blocks.welcome.length > 0 && (blocks.welcome[0].title || 'Welcome')) || 'Welcome'}
      />

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full space-y-16 relative z-1">
        {/* 1) Welcome */}
        {blocks.welcome && blocks.welcome.length > 0 && (
          <section id="welcome" className="w-full space-y-8 scroll-mt-24 md:scroll-mt-28">
            {blocks.welcome.map((wb: any, i: number) => (
              <WelcomeBlock
                key={`welcome-${i}`}
                {...wb}
                themeColor={accent}
                textColor={theme.textColor}
                artistName={config.artist_name}
                paymentLink={(blocks.tipJar && blocks.tipJar.length > 0 && blocks.tipJar[0].payment_link) || undefined}
              />
            ))}
          </section>
        )}

        {/* 2) Releases */}
        {blocks.releases.length > 0 && (
          <section id="music" className="w-full scroll-mt-24 md:scroll-mt-28">
            <div className="max-w-6xl mx-auto px-4 sm:px-0 lg:px-0">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.textColor || undefined }}>{blocks.releases[0].title || 'Releases'}</h2>
              <HorizontalScroll itemWidth={240} gap={16}>
                {blocks.releases.flatMap((block) => {
                  const items = Array.isArray(block.items) && block.items.length > 0
                    ? block.items.map((it: any) => ({ title: it.title, artwork_url: it.artwork_url, streaming_links: it.streaming_links || {} }))
                    : [{ title: block.title, artwork_url: block.artwork_url, streaming_links: block.streaming_links || {} }]
                  return items.map((it: any, idx: number) => (
                    <ReleaseBlock key={`${it.title || 'release'}-${idx}`} title={it.title || 'Untitled'} artwork_url={it.artwork_url || ''} streaming_links={it.streaming_links || {}} themeColor={accent} textColor={theme.textColor} compact />
                  ))
                })}
              </HorizontalScroll>
            </div>
          </section>
        )}

        {/* 3) Videos */}
        {blocks.video.length > 0 && (
          <section id="video" className="w-full space-y-8 scroll-mt-24 md:scroll-mt-28">
            <div className="max-w-6xl mx-auto px-4 sm:px-0 lg:px-0">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.textColor || undefined }}>{blocks.video[0].title || 'Videos'}</h2>
            </div>
            {(blocks.video[0].items || []).map((it: any, i: number) => (
              <VideoBlock key={`video-item-${i}`} title={it.title} video_url={it.video_url} thumbnail_url={it.thumbnail_url} themeColor={accent} />
            ))}
          </section>
        )}

        {/* 4) Tip Jar */}
        {blocks.tipJar.length > 0 && (
          <section id="tip" className="w-full scroll-mt-24 md:scroll-mt-28">
            <TipJarBlock {...blocks.tipJar[0]} themeColor={accent} background={theme.backgroundColor} textColor={theme.textColor} />
          </section>
        )}

        {/* 5) Tours */}
        {blocks.tours.length > 0 && (
          <section id="tour" className="w-full scroll-mt-24 md:scroll-mt-28">
            <div className="max-w-6xl mx-auto px-4 sm:px-0 lg:px-0">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.textColor || undefined }}>{blocks.tours[0].title}</h2>
              <HorizontalScroll itemWidth={300} gap={16}>
                {blocks.tours[0].dates.map((date:any, index:number) => (
                  <TourBlock key={index} date={date} themeColor={accent} textColor={theme.textColor} />
                ))}
              </HorizontalScroll>
            </div>
          </section>
        )}

        {/* 6) Merch */}
        {blocks.merch.length > 0 && (
          <section id="merch" className="w-full scroll-mt-24 md:scroll-mt-28">
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-0 lg:px-0">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.textColor || undefined }}>{blocks.merch[0].title}</h2>
              <HorizontalScroll itemWidth={240} gap={16}>
                {blocks.merch[0].items.map((item:any, index:number) => (
                  <MerchBlock key={index} item={item} themeColor={accent} />
                ))}
              </HorizontalScroll>
            </div>
          </section>
        )}

        {/* 7) Gated Content */}
        {blocks.lockedContent.length > 0 && (
          <section id="subscribe" className="w-full space-y-8 max-w-6xl mx-auto px-4 sm:px-0 lg:px-0 scroll-mt-24 md:scroll-mt-28">
            <div className="max-w-6xl mx-auto px-0">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.textColor || undefined }}>{blocks.lockedContent[0].title || 'Subscribers Only'}</h2>
            </div>
            {(blocks.lockedContent[0].items || []).map((it: any, i: number) => (
              <LockedContentBlock key={`locked-item-${i}`} title={it.title} media_url={it.media_url} locked={it.locked !== false} unlock_method={it.unlock_method || 'subscription'} themeColor={accent} textColor={theme.textColor} subscription_link={blocks.lockedContent[0].subscription_link || ''} />
            ))}
          </section>
        )}

        {/* 8) About */}
        {blocks.bio.length > 0 && (
          <section id="about" className="w-full max-w-6xl mx-auto px-4 sm:px-0 lg:px-0 scroll-mt-24 md:scroll-mt-28">
            <BioBlock {...blocks.bio[0]} themeColor={accent} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="mt-12 border-t py-8 px-4 sm:px-6 lg:px-8 backdrop-blur-sm"
        style={{ backgroundColor: theme.backgroundColor || undefined, borderColor: accent }}
      >
        <SocialLinks links={config.social_links} themeColor={accent} />

        <div className="mt-8 text-center">
          <button onClick={() => setShowContactInfo(!showContactInfo)} className="alera-button-outline">
            {showContactInfo ? "Hide Contact Info" : "Contact Info"}
          </button>

          {showContactInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 text-sm text-white/80 space-y-3 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
            >
              <p>
                <span className="text-white/50">Email:</span> {config.contact_info.email}
              </p>
              <div>
                <p className="font-medium text-white">Management:</p>
                <p>{config.contact_info.management.name}</p>
                <p>{config.contact_info.management.email}</p>
                <p>{config.contact_info.management.phone}</p>
              </div>
            </motion.div>
          )}

          <div className="mt-8 flex flex-col items-center">
            <form onSubmit={handleSubscribe} className="w-full max-w-md">
              <div className="relative h-14 mb-4">
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
                  <input
                    type="email"
                    placeholder="What's ALERA? Drop your email"
                    className="w-full h-full bg-transparent border-none px-5 text-white placeholder:text-white/60 placeholder:sm:text-[16px]
                    placeholder:text-[11px]  focus:outline-none focus:ring-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscriptionStatus === "loading" || subscriptionStatus === "success"}
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscriptionStatus === "loading" || subscriptionStatus === "success"}
                  className="absolute right-1 top-1 bottom-1 px-6 rounded-full font-medium flex items-center justify-center min-w-[140px]"
                  style={{ backgroundColor: accent, color: 'white' }}
                >
                  {subscriptionStatus === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : subscriptionStatus === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    "Find Out More"
                  )}
                </button>
              </div>

              <AnimatePresence>
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-sm ${
                      subscriptionStatus === "success" ? "text-green-400" : "text-red-400"
                    } mb-4 flex items-center justify-center`}
                  >
                    {subscriptionStatus === "success" ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-1" />
                    )}
                    {statusMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-4 flex items-center justify-center">
              <p className="text-xs text-white/40 mr-2">Powered by</p>
              <a
                href="https://www.alera.fm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity flex items-center"
              >
                <Image src="/images/alera-logo-white.png" alt="Alera" width={40} height={40} className="h-12 w-12" />
                <span className="text-white mt-[1px] -ml-1 font-medium">Alera</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-50"
          style={{ backgroundColor: accent, color: 'white' }}
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  )
}
