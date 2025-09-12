
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Music, TrendingUp, Users, Globe, MapPin, Heart, Eye, Hash } from 'lucide-react'

interface Release {
  id: string
  title: string
}

interface AnalyticsData {
  totalStreams: number
  streamsByPlatform: Array<{ platform: string; streams: number }>
  topCountries: Array<{ country: string; streams: number }>
  deviceTypes: Array<{ device_type: string; streams: number }>
  dailyStreams: Array<{ reporting_date: string; streams: number }>
  totalSaves: number
  
  // Shazam data
  shazamRecognitions: number
  shazamCountries: Array<{ country: string; count: number }>
  shazamCities: Array<{ city: string; count: number }>
  
  // TikTok data
  tiktokUsage: number
  tiktokViews: number
  tiktokTerritories: Array<{ territory: string; views: number }>
  
  // Meta data
  metaViews: number
  metaTerritories: Array<{ territory: string; events: number }>
}

const PLATFORMS = ['Spotify', 'Apple Music', 'Deezer', 'Meta', 'TikTok', 'Shazam']

export default function MyAleraReleasesSection() {
  const [releases, setReleases] = useState<Release[]>([])
  const [selectedRelease, setSelectedRelease] = useState<string>('total')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(PLATFORMS)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<number>(30)

  const fetchReleases = async () => {
    try {
      const response = await fetch('/api/analytics/user-releases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReleases(data.releases)
      }
    } catch (error) {
      console.error('Error fetching releases:', error)
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const platformsParam = selectedPlatforms.join(',')
      const params = new URLSearchParams({
        release_id: selectedRelease,
        platforms: platformsParam,
        days: timeRange.toString()
      })

      const response = await fetch(`/api/analytics/releases?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Convert string values to numbers for charts
        const processedData = {
          ...data,
          totalStreams: parseInt(data.totalStreams) || 0,
          streamsByPlatform: data.streamsByPlatform?.map((item: any) => ({
            ...item,
            streams: parseInt(item.streams) || 0
          })) || [],
          topCountries: data.topCountries?.map((item: any) => ({
            ...item,
            streams: parseInt(item.streams) || 0
          })) || [],
          deviceTypes: data.deviceTypes?.map((item: any) => ({
            ...item,
            streams: parseInt(item.streams) || 0
          })) || [],
          dailyStreams: data.dailyStreams?.map((item: any) => ({
            ...item,
            streams: parseInt(item.streams) || 0
          })) || [],
          shazamRecognitions: parseInt(data.shazamRecognitions) || 0,
          shazamCountries: data.shazamCountries?.map((item: any) => ({
            ...item,
            count: parseInt(item.count) || 0
          })) || [],
          shazamCities: data.shazamCities?.map((item: any) => ({
            ...item,
            count: parseInt(item.count) || 0
          })) || [],
          tiktokUsage: parseInt(data.tiktokUsage) || 0,
          tiktokViews: parseInt(data.tiktokViews) || 0,
          tiktokTerritories: data.tiktokTerritories?.map((item: any) => ({
            ...item,
            views: parseInt(item.views) || 0
          })) || [],
          metaViews: parseInt(data.metaViews) || 0,
          metaTerritories: data.metaTerritories?.map((item: any) => ({
            ...item,
            events: parseInt(item.events) || 0
          })) || []
        }
        
        setAnalyticsData(processedData)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReleases()
  }, [])

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedRelease, selectedPlatforms, timeRange])



  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Release</label>
          <Select value={selectedRelease} onValueChange={setSelectedRelease}>
            <SelectTrigger>
              <SelectValue placeholder="Select release" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">(Total) - All Releases</SelectItem>
              {releases.map((release) => (
                <SelectItem key={release.id} value={release.id}>
                  {release.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Time Range</label>
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-2">
          <label className="text-sm font-medium mb-2 block">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <Badge
                key={platform}
                variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => togglePlatform(platform)}
              >
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analyticsData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Streaming</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.totalStreams)}</div>
                <p className="text-xs text-muted-foreground">
                  Total Streams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shazams</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.shazamRecognitions)}</div>
                <p className="text-xs text-muted-foreground">
                  Total Shazams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiktok</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.tiktokViews)}</div>
                <p className="text-xs text-muted-foreground">
                  Total Views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meta</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.metaViews)}</div>
                <p className="text-xs text-muted-foreground">
                  Total Views
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Streams over time (Line Graph) */}
            <Card>
              <CardHeader>
                <CardTitle>Streams over time</CardTitle>
                <CardDescription>
                  Daily stream count over the last {timeRange} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.dailyStreams.length > 1 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.dailyStreams}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="reporting_date" 
                        tickFormatter={formatDate}
                        type="category"
                      />
                      <YAxis tickFormatter={formatNumber} />
                      <Tooltip 
                        labelFormatter={(value) => formatDate(value as string)}
                        formatter={(value) => [formatNumber(value as number), 'Streams']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="streams" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#8884d8', strokeWidth: 2 }}
                        connectNulls={true}
                      />

                    </LineChart>
                  </ResponsiveContainer>
                ) : analyticsData.dailyStreams.length === 1 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {formatNumber(analyticsData.dailyStreams[0].streams)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Streams on {formatDate(analyticsData.dailyStreams[0].reporting_date)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Only one data point available
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No daily stream data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platform breakdown (Pie Chart) */}
            <Card>
              <CardHeader>
                <CardTitle>Platform breakdown</CardTitle>
                <CardDescription>
                  Distribution across streaming platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.streamsByPlatform.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.streamsByPlatform}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ platform, percent }) => `${platform} ${((percent || 0) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="streams"
                      >
                        {analyticsData.streamsByPlatform.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000', '#00ff00'][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(value as number), 'Streams']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No platform data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Streams by country (Pie Chart) */}
            <Card>
              <CardHeader>
                <CardTitle>Streams by country</CardTitle>
                <CardDescription>
                  Geographic distribution of streams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.topCountries.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.topCountries}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ country, percent }) => `${country} ${((percent || 0) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="streams"
                      >
                        {analyticsData.topCountries.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.country === 'Other' ? '#999999' : ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'][index % 5]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(value as number), 'Streams']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No country data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device type (Pie Chart) */}
            <Card>
              <CardHeader>
                <CardTitle>Device type</CardTitle>
                <CardDescription>
                  Streams by device type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.deviceTypes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.deviceTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device_type, percent }) => `${device_type} ${((percent || 0) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="streams"
                      >
                        {analyticsData.deviceTypes.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.device_type === 'Other' ? '#999999' : ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'][index % 5]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(value as number), 'Streams']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No device type data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Social Media Analytics Sections */}
          
          {/* TikTok Analytics */}
          {(analyticsData.tiktokUsage > 0 || analyticsData.tiktokViews > 0) && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">TikTok Analytics</h3>
                <Badge variant="outline">Social Media</Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TikTok Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>TikTok Usage</CardTitle>
                    <CardDescription>Total creations count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center py-8">
                      {formatNumber(analyticsData.tiktokUsage)}
                    </div>
                  </CardContent>
                </Card>

                {/* TikTok Territory Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>TikTok Territory Distribution</CardTitle>
                    <CardDescription>Video views by territory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.tiktokTerritories && analyticsData.tiktokTerritories.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.tiktokTerritories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ territory, percent }) => `${territory} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="views"
                          >
                            {analyticsData.tiktokTerritories.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.territory === 'Other' ? '#999999' : ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'][index % 5]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatNumber(value as number), 'Views']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No territory data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Meta Analytics */}
          {analyticsData.metaViews > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Meta Analytics</h3>
                <Badge variant="outline">Social Media</Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meta Views */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meta Views</CardTitle>
                    <CardDescription>Total event count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center py-8">
                      {formatNumber(analyticsData.metaViews)}
                    </div>
                  </CardContent>
                </Card>

                {/* Meta Territory Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meta Territory Distribution</CardTitle>
                    <CardDescription>Event count by territory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.metaTerritories && analyticsData.metaTerritories.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.metaTerritories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ territory, percent }) => `${territory} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="events"
                          >
                            {analyticsData.metaTerritories.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.territory === 'Other' ? '#999999' : ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'][index % 5]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatNumber(value as number), 'Events']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No territory data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Shazam Analytics */}
          {analyticsData.shazamRecognitions > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Shazam Analytics</h3>
                <Badge variant="outline">Social Media</Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shazam Recognitions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shazam Recognitions</CardTitle>
                    <CardDescription>Total recognition count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center py-8">
                      {formatNumber(analyticsData.shazamRecognitions)}
                    </div>
                  </CardContent>
                </Card>

                {/* Shazam Country Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shazam Country Distribution</CardTitle>
                    <CardDescription>Recognitions by country</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.shazamCountries && analyticsData.shazamCountries.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.shazamCountries}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ country, percent }) => `${country} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analyticsData.shazamCountries.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.country === 'Other' ? '#999999' : ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'][index % 5]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatNumber(value as number), 'Recognitions']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No country data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Shazam City Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shazam City Distribution</CardTitle>
                    <CardDescription>Recognitions by city</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.shazamCities && analyticsData.shazamCities.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.shazamCities}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ city, percent }) => `${city} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {analyticsData.shazamCities.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.city === 'Other' ? '#999999' : ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'][index % 5]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatNumber(value as number), 'Recognitions']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No city data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data available for this release</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Connect with admin if you think something is missing. Analytics data is updated daily.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
