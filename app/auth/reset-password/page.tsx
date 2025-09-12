"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { AuthLayout } from "@/components/auth/auth-layout"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#333] dark:text-white mb-4">Invalid Reset Link</h2>
          <p className="text-[#666] dark:text-gray-400">This password reset link is invalid or has expired.</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-[#666] dark:text-gray-400 mt-2">Loading...</p>
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
