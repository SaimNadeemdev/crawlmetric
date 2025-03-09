"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, TrendingUp, Users, Globe, Target } from "lucide-react"

// Sample data - replace with real data in production
const growthData = [
  {
    metric: "Organic Traffic",
    value: 45872,
    change: 12.5,
    trend: [
      { date: "2024-01", value: 35000 },
      { date: "2024-02", value: 38000 },
      { date: "2024-03", value: 42000 },
      { date: "2024-04", value: 45872 },
    ],
    icon: Globe,
  },
  {
    metric: "Keyword Rankings",
    value: 156,
    change: -2.3,
    trend: [
      { date: "2024-01", value: 145 },
      { date: "2024-02", value: 160 },
      { date: "2024-03", value: 159 },
      { date: "2024-04", value: 156 },
    ],
    icon: Target,
  },
  {
    metric: "Conversion Rate",
    value: 3.8,
    change: 0.5,
    trend: [
      { date: "2024-01", value: 3.2 },
      { date: "2024-02", value: 3.4 },
      { date: "2024-03", value: 3.6 },
      { date: "2024-04", value: 3.8 },
    ],
    icon: Users,
  },
]

const MetricCard = ({ data, index }: { data: (typeof growthData)[0]; index: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const Icon = data.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">{data.metric}</CardTitle>
            </div>
            <Badge variant={data.change > 0 ? "default" : "destructive"} className="flex items-center space-x-1">
              {data.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{Math.abs(data.change)}%</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              {typeof data.value === "number" && data.metric === "Conversion Rate"
                ? `${data.value}%`
                : data.value.toLocaleString()}
            </div>
          </div>
          <div className="h-[80px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <XAxis dataKey="date" hide padding={{ left: 10, right: 10 }} />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Value</span>
                              <span className="font-bold text-sm">{payload[0].value}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                              <span className="font-bold text-sm">{payload[0].payload.date}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function GrowthMetrics() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-2xl font-bold">Growth Metrics</h2>
            <p className="text-muted-foreground">Track your key performance indicators</p>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Last 30 Days
          </Badge>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {growthData.map((metric, index) => (
            <MetricCard key={index} data={metric} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

