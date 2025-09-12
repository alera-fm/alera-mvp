"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, BarChart3, Wallet, MessageSquare, Users, Rocket, Music, LogOut, Globe } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useChat } from "@/context/ChatContext"

export function MobileNavigation() {
  const pathname = usePathname()
  const { logout, isAuthenticated } = useAuth()
  const { unread } = useChat()
  const [activeTab, setActiveTab] = useState("home")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    if (pathname === "/dashboard") setActiveTab("home")
    else if (pathname.startsWith("/dashboard/my-music")) setActiveTab("my-music")
    else if (pathname.startsWith("/dashboard/my-page")) setActiveTab("my-page")
    else if (pathname.startsWith("/dashboard/analytics")) setActiveTab("analytics")
    else if (pathname.startsWith("/dashboard/wallet")) setActiveTab("wallet")
    else if (pathname.startsWith("/dashboard/fanzone")) setActiveTab("fanzone")
    else if (pathname.startsWith("/dashboard/new-release")) setActiveTab("new-release")
    else setActiveTab("home")
  }, [pathname])

  const navItems = [
    { name: "New Release", icon: Rocket, path: "/dashboard/new-release", id: "new-release" },
    { name: "Home", icon: Home, path: "/dashboard", id: "home" },
    { name: "My Music", icon: Music, path: "/dashboard/my-music", id: "my-music" },
    { name: "My Page", icon: Globe, path: "/dashboard/my-page", id: "my-page" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics", id: "analytics" },
    { name: "Wallet", icon: Wallet, path: "/dashboard/wallet", id: "wallet" },
    { name: "Fanzone", icon: Users, path: "/dashboard/fanzone", id: "fanzone" },
  ]

  const handleNavClick = (id: string) => {
    setActiveTab(id)
  }

  // Handle horizontal scroll
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 100
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : Math.min(scrollRef.current.scrollWidth - scrollRef.current.clientWidth, scrollPosition + scrollAmount)

      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })
      setScrollPosition(newPosition)
    }
  }

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center md:hidden px-4">
      <div className="bg-black/70 backdrop-blur-md rounded-full shadow-lg w-full max-w-md overflow-hidden">
        <div
          ref={scrollRef}
          className="flex items-center py-2 px-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-center rounded-full transition-all duration-200 ease-in-out shrink-0 mx-1 snap-center
                  ${
                    isActive
                      ? "bg-white text-black px-4 py-3" // Active state: white pill
                      : "text-white p-3" // Inactive state
                  }`}
              >
                <item.icon className={`h-6 w-6 ${isActive ? "text-black" : "text-white"}`} />
                {isActive && <span className="ml-2 text-sm font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            )
          })}

          {/* ALERA Agent Button - Integrated into menu */}
          <button
            onClick={() => {
              // Dispatch custom event to open ALERA chat
              window.dispatchEvent(new CustomEvent('openAleraChat'))
            }}
            className="relative flex items-center justify-center shrink-0 p-2 ml-1 snap-center"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-yellow-400 to-lime-400 rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            {unread > 0 && (
              <div className="absolute -top-1 -right-1 bg-black text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs font-bold">
                {unread}
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center justify-center shrink-0 p-3 ml-1 snap-center text-white hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}