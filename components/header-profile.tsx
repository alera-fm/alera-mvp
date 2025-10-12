"use client"

import { useState, useEffect } from "react"
import { AccountSettingsDropdown } from "./account-settings-dropdown"

interface User {
  email: string
  artistName?: string
  artist_name?: string
  firstname?: string
  lastname?: string
}

export function HeaderProfile() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) return

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    fetchUser()
  }, [])

  if (!user) return null

  return <AccountSettingsDropdown user={user} />
}