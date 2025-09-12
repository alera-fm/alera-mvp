"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Heart, MessageCircle, ExternalLink } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { mockData } from "@/lib/mock-analytics-data"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const instagramData = mockData.instagram_connected_account

export function InstagramSection() {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Platform Header */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs md:text-sm">IG</span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-[#333] dark:text-white">Instagram</h3>
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs"
        >
          Connected
        </Badge>
      </div>

      {/* Main Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Followers</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
            {formatNumber(instagramData.followers)}
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Posts (30 days)</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">
            {instagramData.posts_last_30_days}
          </div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Avg Likes</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">{instagramData.avg_likes}</div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Avg Comments</div>
          <div className="text-lg md:text-2xl font-bold text-[#333] dark:text-white">{instagramData.avg_comments}</div>
        </Card>
        <Card className="p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Most Engaged</div>
          <div className="text-sm md:text-lg font-semibold text-[#333] dark:text-white truncate">
            {instagramData.most_engaged_post.caption}
          </div>
        </Card>
      </div>

      {/* Charts - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white mb-3 md:mb-4">
            Engagement Over Time
          </h4>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={instagramData.engagement_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
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
                <Line type="monotone" dataKey="engagement" stroke="#E4405F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white mb-3 md:mb-4">
            Top 5 Posts by Engagement
          </h4>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={instagramData.top_posts_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="caption" stroke="#9CA3AF" fontSize={10} />
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
                <Bar dataKey="engagement" fill="#E4405F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Latest Posts Grid - Mobile Responsive */}
      <Card className="p-4 md:p-6">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white mb-3 md:mb-4">Latest Posts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {instagramData.top_posts.map((post, index) => (
            <Card key={index} className="p-3 md:p-4">
              <div className="space-y-2 md:space-y-3">
                <Image
                  src={post.thumbnail || "/placeholder.svg"}
                  alt={post.caption}
                  width={200}
                  height={200}
                  className="w-full h-32 md:h-48 object-cover rounded"
                />
                <p className="text-xs md:text-sm font-medium line-clamp-2">{post.caption}</p>
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {post.posted}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                  <a href={post.link} target="_blank" rel="noopener noreferrer">
                    View Post <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Locked Features - Mobile Responsive */}
      <div className="space-y-3 md:space-y-4">
        <h4 className="text-base md:text-lg font-semibold text-[#333] dark:text-white flex items-center gap-2">
          Premium Analytics
          <Lock className="h-4 w-4 text-gray-400" />
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {["Reach/Impressions", "Profile Visits", "Audience Demographics", "Story Analytics"].map((feature) => (
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
