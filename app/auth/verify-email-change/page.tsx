"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailChangeContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    verifyEmailChange(token)
  }, [searchParams])

  const verifyEmailChange = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        setUserInfo(data.user)
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error occurred. Please try again.')
    }
  }

  const handleContinue = () => {
    router.push('/dashboard/settings')
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-[#BFFF00]" />
              <p className="text-gray-600 dark:text-gray-400">
                Verifying your email change...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">{message}</p>
                {userInfo && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your email has been updated to: <strong>{userInfo.email}</strong>
                  </p>
                )}
              </div>
              <Button 
                onClick={handleContinue}
                className="w-full bg-[#BFFF00] text-black hover:bg-[#a8e600]"
              >
                Continue to Settings
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 mx-auto text-red-500" />
              <div className="space-y-4">
                <p className="text-red-600 font-semibold">{message}</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/dashboard/settings')}
                    className="w-full bg-[#BFFF00] text-black hover:bg-[#a8e600]"
                  >
                    Go to Settings
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-[#BFFF00]" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  )
}
