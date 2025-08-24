"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { motion } from "framer-motion"
import { Headphones, DollarSign } from "lucide-react"

// Mock data for streams - using daily values
const streamData = [
  { day: "Mon", streams: 1200 },
  { day: "Tue", streams: 1800 },
  { day: "Wed", streams: 1600 },
  { day: "Thu", streams: 2200 },
  { day: "Fri", streams: 2400 },
  { day: "Sat", streams: 3000 },
  { day: "Sun", streams: 2800 },
]

// Mock data for earnings
const earningsData = [
  { day: "Mon", earnings: 120 },
  { day: "Tue", earnings: 180 },
  { day: "Wed", earnings: 160 },
  { day: "Thu", earnings: 220 },
  { day: "Fri", earnings: 240 },
  { day: "Sat", earnings: 300 },
  { day: "Sun", earnings: 280 },
]

export function CareerSnapshotCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="overflow-hidden border-0 dark:border-0 shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-[#0f0f1a]">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900 dark:text-white text-xl flex items-center">Career Snapshot</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Your performance over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="streams">
            <TabsList className="grid w-full grid-cols-2 mb-4 dark:bg-[#1a1a2e]">
              <TabsTrigger
                value="streams"
                className="dark:data-[state=active]:bg-[#2d2d44] dark:data-[state=active]:text-white flex items-center gap-2"
              >
                <Headphones className="h-4 w-4 text-purple-500" />
                Streams
              </TabsTrigger>
              <TabsTrigger
                value="earnings"
                className="dark:data-[state=active]:bg-[#2d2d44] dark:data-[state=active]:text-white flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4 text-yellow-500" />
                Earnings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="streams" className="pt-2">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streamData} barGap={4}>
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      formatter={(value) => [value, "Streams"]}
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        borderRadius: "8px",
                        border: "1px solid #2d2d44",
                        color: "#f9fafb",
                      }}
                    />
                    <Bar dataKey="streams" fill="#9333ea" radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 text-center p-4 bg-gradient-to-r from-purple-900/20 to-yellow-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Headphones className="h-5 w-5 text-purple-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Streams</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {streamData.reduce((sum, item) => sum + item.streams, 0).toLocaleString()}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="earnings" className="pt-2">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData} barGap={2}>
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Earnings"]}
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        borderRadius: "8px",
                        border: "1px solid #2d2d44",
                        color: "#f9fafb",
                      }}
                    />
                    {/* EQ-style bars with alternating colors */}
                    {earningsData.map((entry, index) => (
                      <Bar
                        key={`bar-${index}`}
                        dataKey="earnings"
                        fill={index % 2 === 0 ? "#eab308" : "#9333ea"}
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                        fillOpacity={0.8}
                        name={entry.day}
                        data={[entry]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 text-center p-4 bg-gradient-to-r from-yellow-900/20 to-purple-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${earningsData.reduce((sum, item) => sum + item.earnings, 0).toLocaleString()}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
