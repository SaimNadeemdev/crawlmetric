"use client"

import * as React from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { format } from "date-fns"
import { ArrowDown, ArrowUp, Minus, BarChartIcon as ChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Keyword } from "@/types/keyword"

interface KeywordChartProps {
  keyword: Keyword
  className?: string
}

export function KeywordChart({ keyword, className }: KeywordChartProps) {
  // Transform and validate the history data
  const chartData = React.useMemo(() => {
    if (!keyword?.history || !Array.isArray(keyword.history)) {
      console.warn("Invalid or missing history data for keyword:", keyword?.keyword)
      return []
    }

    return keyword.history
      .filter((entry) => {
        // Validate each history entry
        if (!entry || typeof entry.position !== "number" || !entry.date) {
          console.warn("Invalid history entry:", entry)
          return false
        }
        return true
      })
      .map((entry) => ({
        date: new Date(entry.date),
        position: Math.round(entry.position), // Ensure integer positions
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [keyword])

  // If no valid data, show empty state
  if (chartData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex flex-col items-center justify-center h-[400px] p-6">
          <ChartIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No ranking data available</h3>
          <p className="text-sm text-muted-foreground text-center max-w-[300px]">
            Rankings for &quot;{keyword.keyword}&quot; will appear here once data is available. This usually takes 24-48
            hours after adding a keyword.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate metrics
  const currentPosition = chartData[chartData.length - 1]?.position
  const previousPosition = chartData[0]?.position
  const rankingChange = previousPosition && currentPosition ? previousPosition - currentPosition : 0

  const bestRank = Math.min(...chartData.map((d) => d.position))
  const worstRank = Math.max(...chartData.map((d) => d.position))

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-medium leading-none">Position Changes</h3>
          <p className="text-sm text-muted-foreground">
            {format(chartData[0].date, "MMM d")} - {format(chartData[chartData.length - 1].date, "MMM d, yyyy")}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center rounded-md px-2 py-1 text-sm font-medium",
            rankingChange > 0
              ? "bg-green-500/15 text-green-500"
              : rankingChange < 0
                ? "bg-red-500/15 text-red-500"
                : "bg-muted/50 text-muted-foreground",
          )}
        >
          {rankingChange !== 0 ? (
            <>
              {rankingChange > 0 ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
              {Math.abs(rankingChange)} positions
            </>
          ) : (
            <>
              <Minus className="mr-1 h-4 w-4" />
              No change
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    dataKey="position"
                    tickFormatter={(value) => `#${value}`}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    reversed
                    domain={[Math.max(1, Math.floor(bestRank * 0.8)), Math.ceil(worstRank * 1.2)]}
                    className="text-xs fill-muted-foreground"
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0].payload

                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                              <span className="font-bold text-muted-foreground">
                                {format(data.date, "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Position</span>
                              <span className="font-bold">#{data.position}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="position"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      strokeWidth: 2,
                      className: "fill-background stroke-primary",
                    }}
                    activeDot={{
                      r: 4,
                      strokeWidth: 2,
                      className: "fill-background stroke-primary",
                    }}
                    className="stroke-primary"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">Best Position</p>
              <p className="text-2xl font-bold">#{bestRank}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">Current Position</p>
              <p className="text-2xl font-bold">#{currentPosition}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

