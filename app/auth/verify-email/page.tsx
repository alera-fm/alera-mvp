"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("No verification token provided")
      return
    }

    // Verify the email
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message && !data.error) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("An error occurred during verification")
      })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-white">Email Verification</CardTitle>
          <CardDescription className="text-gray-400">
            {status === "loading" && "Verifying your email address..."}
            {status === "success" && "Your email has been verified"}
            {status === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-500" />}
          {status === "success" && <CheckCircle className="h-12 w-12 mx-auto text-green-500" />}
          {status === "error" && <XCircle className="h-12 w-12 mx-auto text-red-500" />}

          <p
            className={`${status === "success" ? "text-green-400" : status === "error" ? "text-red-400" : "text-gray-400"}`}
          >
            {message}
          </p>

          {status !== "loading" && (
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gradient-to-r from-[#5d2c91] to-[#2d1b69] hover:from-[#6b3aa0] hover:to-[#3d2b79] text-white"
            >
              Continue to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
