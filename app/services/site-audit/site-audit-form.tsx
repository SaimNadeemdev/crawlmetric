"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { startSiteAudit } from "./actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function SiteAuditForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await startSiteAudit(url)

      if (result.success) {
        toast({
          title: "Audit Started",
          description: "Your site audit has been initiated. You'll be redirected to the results page.",
        })

        // Redirect to the results page with the task ID
        router.push(`/services/site-audit/results?taskId=${result.taskId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start site audit",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="url">Website URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-black/20 border-gray-700"
          required
        />
        <p className="text-sm text-gray-400">Enter the full URL including https:// or http://</p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting Audit...
          </>
        ) : (
          "Start Site Audit"
        )}
      </Button>
    </form>
  )
}

