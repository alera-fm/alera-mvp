"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock, ExternalLink } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { mockData } from "@/lib/mock-analytics-data"
import Image from "next/image"

const spotifyData = mockData.spotify_connected_account

export function SpotifySection() {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Platform Header */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs md:text-sm">S</span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-[#333] dark:text-white">Spotify</h3>
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs"
        >
          Connected
        </Badge>
      </div>

      {/* Main Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Followers</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
            {formatNumber(spotifyData.followers)}
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Top Track</div>
          <div className="text-sm md:text-lg font-semibold text-[#333] dark:text-white truncate">
            {spotifyData.top_track}
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Avg Popularity</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">{spotifyData.avg_popularity}</div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Recent Release</div>
          <div className="text-sm md:text-lg font-semibold text-[#333] dark:text-white truncate">
            {spotifyData.recent_release}
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Top Genre</div>
          <div className="text-sm md:text-lg font-semibold text-[#333] dark:text-white">{spotifyData.top_genre}</div>
        </Card>
      </div>

      {/* Top 10 Tracks Chart - Mobile Responsive */}
      <Card className="p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white mb-3 md:mb-4">
          Top 10 Tracks by Popularity
        </h4>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spotifyData.top_tracks_chart} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
              <YAxis dataKey="name" type="category" width={80} stroke="#9CA3AF" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="popularity" fill="#1DB954" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top 10 Tracks Table - Mobile Responsive */}
      <Card className="p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white mb-3 md:mb-4">Top 10 Tracks</h4>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {spotifyData.top_tracks.map((track, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={track.cover || "/placeholder.svg"}
                      alt={track.title}
                      width={40}
                      height={40}
                      className="rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{track.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {track.album} • {track.duration}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {track.popularity}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                          <a href={track.spotify_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Cover</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Track Name</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Album</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Duration</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Popularity</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Link</th>
                </tr>
              </thead>
              <tbody>
                {spotifyData.top_tracks.map((track, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <Image
                        src={track.cover || "/placeholder.svg"}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    </td>
                    <td className="p-2 font-medium">{track.title}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{track.album}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{track.duration}</td>
                    <td className="p-2">
                      <Badge variant="secondary">{track.popularity}</Badge>
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={track.spotify_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Audio Features - Mobile Responsive */}
      <div className="space-y-3 md:space-y-4">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white">Audio Features</h4>
        {Object.entries(spotifyData.audio_features).map(([trackName, features]) => (
          <Card key={trackName} className="p-4 md:p-6">
            <h5 className="font-semibold text-[#333] dark:text-white mb-3 md:mb-4 text-sm md:text-base">{trackName}</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">{features.tempo}</div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tempo</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
                  {Math.round(features.energy * 100)}%
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Energy</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
                  {Math.round(features.valence * 100)}%
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Valence</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
                  {Math.round(features.acousticness * 100)}%
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Acousticness</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
                  {Math.round(features.instrumentalness * 100)}%
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Instrumentalness</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
                  {Math.round(features.danceability * 100)}%
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Danceability</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Locked Features - Mobile Responsive */}
      <div className="space-y-3 md:space-y-4">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white flex items-center gap-2">
          Premium Analytics
          <Lock className="h-4 w-4 text-gray-400" />
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {["Playlist Adds", "Monthly Listeners", "Save Rate", "Streams Over Time", "Demographics"].map((feature) => (
            <Card key={feature} className="p-3 md:p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center">
                <Lock className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{feature}</div>
              <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">---</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
