"use client"

import type React from "react"

import { useState } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function InstantAuditForm() {
  const { runInstantAudit, instantAuditLoading } = useSeoAudit()
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [enableJavascript, setEnableJavascript] = useState(true)
  const [enableBrowserRendering, setEnableBrowserRendering] = useState(true)
  const [loadResources, setLoadResources] = useState(true)

  const validateUrl = (url: string) => {
    // Basic URL validation
    try {
      // If URL doesn't have protocol, add https://
      let testUrl = url
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        testUrl = `https://${url}`
      }

      new URL(testUrl)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Clean the URL
    let cleanUrl = url.trim()

    // Validate URL
    if (!cleanUrl) {
      setError("Please enter a URL")
      toast({
        title: "URL Required",
        description: "Please enter a URL to audit",
        variant: "destructive",
      })
      return
    }

    if (!validateUrl(cleanUrl)) {
      setError("Please enter a valid URL (e.g., example.com or https://example.com)")
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    try {
      // If URL doesn't have protocol, add https://
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl}`
      }

      await runInstantAudit([cleanUrl], {
        enable_javascript: enableJavascript,
        enable_browser_rendering: enableBrowserRendering,
        load_resources: loadResources,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred while running the audit"

      setError(errorMessage)
      toast({
        title: "Audit Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instant Page Audit</CardTitle>
        <CardDescription>Analyze a single page for SEO issues and performance metrics</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL to Audit</Label>
            <Input
              id="url"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={instantAuditLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter a domain or full URL. If protocol is omitted, https:// will be used.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Label>Audit Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableJavascript"
                checked={enableJavascript}
                onCheckedChange={(checked) => setEnableJavascript(checked === true)}
                disabled={instantAuditLoading}
              />
              <Label htmlFor="enableJavascript" className="text-sm font-normal">
                Enable JavaScript
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableBrowserRendering"
                checked={enableBrowserRendering}
                onCheckedChange={(checked) => setEnableBrowserRendering(checked === true)}
                disabled={instantAuditLoading}
              />
              <Label htmlFor="enableBrowserRendering" className="text-sm font-normal">
                Enable Browser Rendering
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="loadResources"
                checked={loadResources}
                onCheckedChange={(checked) => setLoadResources(checked === true)}
                disabled={instantAuditLoading}
              />
              <Label htmlFor="loadResources" className="text-sm font-normal">
                Load Resources
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={instantAuditLoading}>
            {instantAuditLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              "Run Audit"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

