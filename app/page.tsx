'use client'

import { useAuth } from "@/lib/auth-middleware"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated === true) {
      router.push('/dashboard')
    } else if (isAuthenticated === false) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
