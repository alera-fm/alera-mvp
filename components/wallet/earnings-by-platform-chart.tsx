"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"

import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-tooltip"

interface EarningsByPlatformChartProps {
  data: Array<{
    platform: string
    amount: number
  }>
}

const COLORS = {
  Spotify: "#1DB954",
  "Apple Music": "#FA243C",
  YouTube: "#FF0000",
  Tips: "#BFFF00",
  Fanzone: "#8B5CF6",
  Other: "#8884d8",
}

export function EarningsByPlatformChart({ data }: EarningsByPlatformChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    fill: COLORS[item.platform as keyof typeof COLORS] || COLORS.Other,
  }))

  if (!chartData || chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-4 md:p-6 shadow-sm mb-6 flex items-center justify-center h-96"
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No earnings data available for this period.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-4 md:p-6 shadow-sm mb-6"
    >
      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6">Earnings by Platform</h3>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 70 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="platform"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${value}`}
              width={60}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelClassName="font-bold text-foreground"
                  className="bg-background/90 backdrop-blur-sm border-border"
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
              }
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-x-4 gap-y-2 mt-4 md:justify-center">
        {chartData.map((item) => (
          <div key={item.platform} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.platform}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
