"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lock, ExternalLink, Play } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { mockData } from "@/lib/mock-analytics-data"
import Image from "next/image"

const youtubeData = mockData.youtube_connected_account

export function YouTubeSection() {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Platform Header */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-[#FF0000] rounded-full flex items-center justify-center">
          <Play className="h-3 w-3 md:h-4 md:w-4 text-white fill-white" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-[#333] dark:text-white">YouTube</h3>
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">
          Connected
        </Badge>
      </div>

      {/* Main Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Subscribers</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
            {formatNumber(youtubeData.subscribers)}
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
            {formatNumber(youtubeData.total_views)}
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Videos</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">{youtubeData.total_videos}</div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Most Viewed</div>
          <div className="text-sm md:text-lg font-semibold text-[#333] dark:text-white truncate">
            {youtubeData.most_viewed_video}
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Avg Views</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
            {formatNumber(youtubeData.avg_views_per_video)}
          </div>
        </Card>
      </div>

      {/* Top 5 Videos Chart - Mobile Responsive */}
      <Card className="p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white mb-3 md:mb-4">
          Top 5 Videos by Views
        </h4>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={youtubeData.top_videos_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="views" fill="#FF0000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top 10 Videos Table - Mobile Responsive */}
      <Card className="p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white mb-3 md:mb-4">Top 10 Videos</h4>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {youtubeData.top_videos.map((video, index) => (
                <Card key={index} className="p-3">
                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <Image
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        width={80}
                        height={45}
                        className="rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-2">{video.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {formatNumber(video.views)} views • {video.duration}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>👍 {formatNumber(video.likes)}</span>
                        <span>💬 {video.comments}</span>
                        <span>{video.published}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 mt-2 text-xs" asChild>
                        <a href={video.link} target="_blank" rel="noopener noreferrer">
                          Watch <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Thumbnail</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Title</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Views</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Likes</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Comments</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Duration</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600 dark:text-gray-400">Link</th>
                </tr>
              </thead>
              <tbody>
                {youtubeData.top_videos.map((video, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <div className="relative">
                        <Image
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          width={60}
                          height={40}
                          className="rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </td>
                    <td className="p-2 font-medium max-w-xs truncate">{video.title}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{formatNumber(video.views)}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{formatNumber(video.likes)}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{video.comments}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{video.duration}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{video.published}</td>
                    <td className="p-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={video.link} target="_blank" rel="noopener noreferrer">
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

      {/* Locked Features - Mobile Responsive */}
      <div className="space-y-3 md:space-y-4">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white flex items-center gap-2">
          Premium Analytics
          <Lock className="h-4 w-4 text-gray-400" />
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {["Watch Time", "Demographics", "Subscribers Gained", "Traffic Sources"].map((feature) => (
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
