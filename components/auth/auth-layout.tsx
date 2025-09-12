"use client"

import type React from "react"

import NextImage from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-3">
          {/* Light mode logo */}
          <div className="block dark:hidden">
            <NextImage src="/alera-logo-black.png" alt="ALERA Logo" width={32} height={32} />
          </div>
          {/* Dark mode logo */}
          <div className="hidden dark:block">
            <NextImage src="/alera-logo-white.png" alt="ALERA Logo" width={32} height={32} />
          </div>
          <span className="text-2xl font-bold text-[#333] dark:text-white">ALERA</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-[#666] dark:text-gray-400">© 2025 ALERA. All rights reserved.</p>
      </footer>
    </div>
  )
}
