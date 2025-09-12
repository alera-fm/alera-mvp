"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SpotifySection } from "./spotify-section"
import { YouTubeSection } from "./youtube-section"
import { InstagramSection } from "./instagram-section"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Music } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ConnectedAccountsSection() {
  return (
    <div className="space-y-6 opacity-50 pointer-events-none">
      <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Connected Accounts - Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground">
            This feature will be available after MVP launch. For now, view your ALERA releases data in the section below.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Spotify */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-green-500" />
              Spotify for Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-500 hover:bg-green-600" disabled>
              Connect Account
            </Button>
          </CardContent>
        </Card>
        {/* Youtube */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              YouTube Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-red-500 hover:bg-red-600" disabled>
              Connect Account
            </Button>
          </CardContent>
        </Card>
        {/* Instagram */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-purple-500" />
              Instagram Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-500 hover:bg-purple-600" disabled>
              Connect Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Youtube(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2z" />
      <path d="m9 12 7 4-7 4V8z" />
    </svg>
  )
}

function Instagram(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}