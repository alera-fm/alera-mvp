'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  artistName?: string
  isVerified: boolean
  isAdmin: boolean
  welcomePricingDialogShown?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean | null
  login: (token: string) => void
  logout: () => void
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
  updateActivity: () => Promise<void>
  showWelcomePricingDialog: boolean
  setShowWelcomePricingDialog: (show: boolean) => void
  markWelcomeDialogShown: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showWelcomePricingDialog, setShowWelcomePricingDialog] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setIsAuthenticated(false)
        return
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setIsAuthenticated(true)
          
          // Check if this is a trial user who hasn't seen the welcome pricing dialog
          if (userData && !userData.welcomePricingDialogShown && userData.isVerified) {
            // Only show dialog for trial users, not existing subscribers
            try {
              const subscriptionResponse = await fetch('/api/subscription/status', {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              if (subscriptionResponse.ok) {
                const subscriptionData = await subscriptionResponse.json()
                // Only show dialog if user is on trial tier
                if (subscriptionData.subscription?.tier === 'trial') {
                  setShowWelcomePricingDialog(true)
                }
              }
            } catch (error) {
              console.error('Failed to check subscription status:', error)
            }
          }
        } else {
          localStorage.removeItem('authToken')
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken')
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    checkAuth()
  }, [])

  const login = async (token: string) => {
    localStorage.setItem('authToken', token)
    setIsAuthenticated(true)
    
    // Fetch user data immediately after login
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        
        // Check if this is a trial user who hasn't seen the welcome pricing dialog
        if (userData && !userData.welcomePricingDialogShown && userData.isVerified) {
          // Only show dialog for trial users, not existing subscribers
          try {
            const subscriptionResponse = await fetch('/api/subscription/status', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (subscriptionResponse.ok) {
              const subscriptionData = await subscriptionResponse.json()
              // Only show dialog if user is on trial tier
              if (subscriptionData.subscription?.tier === 'trial') {
                setShowWelcomePricingDialog(true)
              }
            }
          } catch (error) {
            console.error('Failed to check subscription status:', error)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data after login:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
    setUser(null)
    setShowWelcomePricingDialog(false)
    router.push('/auth/login')
  }

  const markWelcomeDialogShown = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
      const response = await fetch('/api/auth/mark-welcome-dialog-shown', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Update user state to reflect that dialog has been shown
        setUser(prev => prev ? { ...prev, welcomePricingDialogShown: true } : null)
        setShowWelcomePricingDialog(false)
      } else {
        console.error('Failed to mark welcome dialog as shown')
      }
    } catch (error) {
      console.error('Error marking welcome dialog as shown:', error)
    }
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const updateActivity = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('No auth token found for activity update')
      return
    }

    try {
      console.log('Updating user activity...')
      const response = await fetch('/api/auth/activity', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log('Activity updated successfully')
      } else {
        console.error('Activity update failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to update activity:', error)
    }
  }

  // Set up periodic activity tracking
  useEffect(() => {
    if (!isAuthenticated) return

    // Update activity immediately
    updateActivity()

    // Set up interval to update activity every 1 minutes
    const interval = setInterval(updateActivity, 1 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      setUser, 
      refreshUser, 
      updateActivity,
      showWelcomePricingDialog,
      setShowWelcomePricingDialog,
      markWelcomeDialogShown
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
