"use client"

import * as React from "react"
import { Tooltip, type TooltipProps } from "recharts"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

type ChartTooltipProps = TooltipProps<number, string>

const ChartTooltip = Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Card> &
    React.ComponentProps<typeof Tooltip> & {
      label?: string
      labelClassName?: string
      formatter?: (value: number, name: string) => React.ReactNode
    }
>(({ active, payload, label, labelClassName, className, formatter, ...props }, ref) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const [item] = payload
  const { name, value } = item

  return (
    <Card ref={ref} className={cn("min-w-[8rem] border-transparent shadow-lg", className)} {...props}>
      <CardContent className="p-2 text-sm">
        <div className="grid grid-cols-1 gap-1.5">
          {label && <div className={cn("font-semibold", labelClassName)}>{label}</div>}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{name}</span>
            <span className="font-semibold">{formatter ? formatter(value as number, name as string) : value}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartTooltip, ChartTooltipContent }
