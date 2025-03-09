"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Download } from "lucide-react"

interface ContentResultCardProps {
  title: string
  content: string
  fileName?: string
  onCopy?: () => void
  onDownload?: () => void
}

export function ContentResultCard({
  title,
  content,
  fileName = "content.txt",
  onCopy,
  onDownload,
}: ContentResultCardProps) {
  // Default copy handler if none provided
  const handleCopy =
    onCopy ||
    (() => {
      navigator.clipboard.writeText(content)
    })

  // Default download handler if none provided
  const handleDownload =
    onDownload ||
    (() => {
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })

  return (
    <Card className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-gray-950 p-4 rounded-md border border-gray-200 dark:border-gray-800 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
          {content}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

