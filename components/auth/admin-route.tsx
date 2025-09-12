"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated === true && !user?.isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, user, router])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  return <>{children}</>
}
