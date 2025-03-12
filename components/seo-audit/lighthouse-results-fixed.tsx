"use client"

import { Card, CardContent } from "@/components/ui/card"

interface LighthouseResultsProps {
  taskId: string
}

export function LighthouseResults({ taskId }: LighthouseResultsProps) {
  return (
    <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[22px]">
      <CardContent className="p-6">
        <div className="text-center text-gray-500">
          Lighthouse audit functionality has been removed
        </div>
      </CardContent>
    </Card>
  )
}