"use client"

import type React from "react"

import { useState } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

export function FullSiteAuditForm() {
  const { startSiteAudit, siteAuditLoading, setActiveSiteAuditTask } = useSeoAudit()
  const { toast } = useToast()
  const [target, setTarget] = useState("")
  const [maxPages, setMaxPages] = useState(100)
  const [maxDepth, setMaxDepth] = useState(3)
  const [includeSubdomains, setIncludeSubdomains] = useState(false)
  const [enableJavascript, setEnableJavascript] = useState(true)
  const [enableBrowserRendering, setEnableBrowserRendering] = useState(true)
  const [loadResources, setLoadResources] = useState(true)
  const [priorityUrls, setPriorityUrls] = useState("")
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!target) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain to audit.",
        variant: "destructive",
      })
      return
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(target)) {
      toast({
        title: "Invalid Domain",
        description: "Please enter a valid domain (e.g., example.com)",
        variant: "destructive",
      })
      return
    }

    // Parse priority URLs
    const priorityUrlsArray = priorityUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    // Validate priority URLs
    for (const url of priorityUrlsArray) {
      try {
        new URL(url)
      } catch (error) {
        toast({
          title: "Invalid Priority URL",
          description: `"${url}" is not a valid URL. Please include http:// or https://`,
          variant: "destructive",
        })
        return
      }
    }

    try {
      console.log("Starting site audit for:", target)
      const options = {
        max_crawl_pages: maxPages,
        max_crawl_depth: maxDepth,
        include_subdomains: includeSubdomains,
        enable_javascript: enableJavascript,
        enable_browser_rendering: enableBrowserRendering,
        load_resources: loadResources,
        priority_urls: priorityUrlsArray.length > 0 ? priorityUrlsArray : undefined,
        respect_robots_txt: respectRobotsTxt,
        follow_redirects: followRedirects,
      }
      console.log("Options:", options)

      const taskId = await startSiteAudit(target, options)

      if (taskId) {
        console.log(`Site audit started with task ID: ${taskId}`)
        toast({
          title: "Audit Started",
          description: `Site audit for ${target} has been initiated. You can view the progress in the Recent Audits section.`,
        })

        // Set this task as the active task
        setActiveSiteAuditTask(taskId)

        // Don't check status immediately - let the polling interval handle it
      } else {
        console.error("No task ID returned from startSiteAudit")
        throw new Error("Failed to start the site audit. No task ID was returned.")
      }
    } catch (err) {
      console.error("Error starting site audit:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Audit Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Full Site Audit</CardTitle>
        <CardDescription>Crawl an entire website to identify SEO issues and opportunities</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Domain to Audit</Label>
            <Input
              id="target"
              placeholder="example.com"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={siteAuditLoading}
            />
            <p className="text-sm text-muted-foreground">Enter the domain without http:// or https://</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPages">Maximum Pages to Crawl: {maxPages}</Label>
            <Slider
              id="maxPages"
              min={10}
              max={500}
              step={10}
              value={[maxPages]}
              onValueChange={(value) => setMaxPages(value[0])}
              disabled={siteAuditLoading}
            />
            <p className="text-sm text-muted-foreground">Limit the number of pages to crawl (10-500)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxDepth">Maximum Crawl Depth: {maxDepth}</Label>
            <Slider
              id="maxDepth"
              min={1}
              max={10}
              step={1}
              value={[maxDepth]}
              onValueChange={(value) => setMaxDepth(value[0])}
              disabled={siteAuditLoading}
            />
            <p className="text-sm text-muted-foreground">Limit the depth of the crawl (1-10)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priorityUrls">Priority URLs (Optional)</Label>
            <Textarea
              id="priorityUrls"
              placeholder="https://example.com/important-page-1&#10;https://example.com/important-page-2"
              value={priorityUrls}
              onChange={(e) => setPriorityUrls(e.target.value)}
              disabled={siteAuditLoading}
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">Enter URLs (one per line) that should be crawled first</p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Label>Crawl Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeSubdomains"
                checked={includeSubdomains}
                onCheckedChange={(checked) => setIncludeSubdomains(checked === true)}
                disabled={siteAuditLoading}
              />
              <Label htmlFor="includeSubdomains" className="text-sm font-normal">
                Include Subdomains
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableJavascript"
                checked={enableJavascript}
                onCheckedChange={(checked) => setEnableJavascript(checked === true)}
                disabled={siteAuditLoading}
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
                disabled={siteAuditLoading}
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
                disabled={siteAuditLoading}
              />
              <Label htmlFor="loadResources" className="text-sm font-normal">
                Load Resources
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="respectRobotsTxt"
                checked={respectRobotsTxt}
                onCheckedChange={(checked) => setRespectRobotsTxt(checked === true)}
                disabled={siteAuditLoading}
              />
              <Label htmlFor="respectRobotsTxt" className="text-sm font-normal">
                Respect robots.txt
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followRedirects"
                checked={followRedirects}
                onCheckedChange={(checked) => setFollowRedirects(checked === true)}
                disabled={siteAuditLoading}
              />
              <Label htmlFor="followRedirects" className="text-sm font-normal">
                Follow Redirects
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={siteAuditLoading} className="w-full">
            {siteAuditLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Audit...
              </>
            ) : (
              "Start Site Audit"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

