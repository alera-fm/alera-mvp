"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Zap, BarChart3, Wallet } from "lucide-react"

export function MobileNavBar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Zap },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-black mx-4 mb-4 rounded-full px-4 py-3 shadow-lg">
        <div className="flex justify-center">
          <div className="flex items-center bg-white rounded-full px-6 py-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href

              if (index === 0) {
                return (
                  <Link key={item.name} href={item.href} className="flex items-center gap-2 px-4 py-2">
                    <item.icon className="h-5 w-5 text-black" />
                    <span className="text-sm font-medium text-black">{item.name}</span>
                  </Link>
                )
              }

              return (
                <Link key={item.name} href={item.href} className="p-3">
                  <item.icon className="h-5 w-5 text-white" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ALERA Agent Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-[#BFFF00] text-black rounded-full p-4 shadow-lg">
          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
            <span className="text-[#BFFF00] text-xs font-bold">A</span>
          </div>
        </button>
        <div className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          1
        </div>
      </div>
    </div>
  )
}
