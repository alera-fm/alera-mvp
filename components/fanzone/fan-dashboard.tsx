
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  CreditCard, 
  Globe, 
  TrendingUp,
  UserCheck,
  Upload as UploadIcon,
  Mail as MailIcon,
  Mouse as MouseIcon
} from "lucide-react"

interface FanInsights {
  totalFans: number
  subscriptionStats: { free: number; paid: number }
  topCountries: Array<{ country: string; count: string }>
  genderBreakdown: Array<{ gender: string; count: string }>
  ageBreakdown: Array<{ age_group: string; count: string }>
  growthOverTime: Array<{ month: string; new_fans: string }>
  sourceBreakdown: Array<{ source: string; count: string }>
}

interface FanDashboardProps {
  insights: FanInsights | null
}

export function FanDashboard({ insights }: FanDashboardProps) {
  if (!insights) return null

  const freePercent = insights.totalFans > 0 
    ? (insights.subscriptionStats.free / insights.totalFans) * 100 
    : 0
  const paidPercent = insights.totalFans > 0 
    ? (insights.subscriptionStats.paid / insights.totalFans) * 100 
    : 0

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'tip': return <CreditCard className="h-4 w-4" />
      case 'email_capture': return <MailIcon className="h-4 w-4" />
      case 'manual': return <UserCheck className="h-4 w-4" />
      case 'import': return <UploadIcon className="h-4 w-4" />
      default: return <MouseIcon className="h-4 w-4" />
    }
  }

  const formatSourceName = (source: string) => {
    switch (source) {
      case 'tip': return 'Tips'
      case 'email_capture': return 'Email Capture'
      case 'manual': return 'Manual Entry'
      case 'import': return 'CSV Import'
      default: return source
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalFans}</div>
            <p className="text-xs text-muted-foreground">
              All registered fans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Fans</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.subscriptionStats.free}</div>
            <Progress value={freePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {freePercent.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Fans</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.subscriptionStats.paid}</div>
            <Progress value={paidPercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {paidPercent.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.topCountries.length}</div>
            <p className="text-xs text-muted-foreground">
              Global reach
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.topCountries.slice(0, 5).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">
                      {country.country || 'Unknown'}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {country.count} fans
                  </Badge>
                </div>
              ))}
              {insights.topCountries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No country data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gender Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gender Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.genderBreakdown.map((gender) => {
                const percent = insights.totalFans > 0 
                  ? (parseInt(gender.count) / insights.totalFans) * 100 
                  : 0
                return (
                  <div key={gender.gender} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {gender.gender || 'Not specified'}
                      </span>
                      <Badge variant="secondary">
                        {gender.count} ({percent.toFixed(1)}%)
                      </Badge>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                )
              })}
              {insights.genderBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No gender data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Age Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Age Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.ageBreakdown.map((age) => {
                const percent = insights.totalFans > 0 
                  ? (parseInt(age.count) / insights.totalFans) * 100 
                  : 0
                return (
                  <div key={age.age_group} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {age.age_group}
                      </span>
                      <Badge variant="secondary">
                        {age.count} ({percent.toFixed(1)}%)
                      </Badge>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                )
              })}
              {insights.ageBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No age data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Fan Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.sourceBreakdown.map((source) => {
                const percent = insights.totalFans > 0 
                  ? (parseInt(source.count) / insights.totalFans) * 100 
                  : 0
                return (
                  <div key={source.source} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(source.source)}
                        <span className="text-sm font-medium">
                          {formatSourceName(source.source)}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {source.count} ({percent.toFixed(1)}%)
                      </Badge>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                )
              })}
              {insights.sourceBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No source data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
