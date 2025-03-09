"use client"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"

export function InstantAuditResults() {
  const { instantAuditResults, instantAuditLoading, clearInstantAuditResults, instantAuditError } = useSeoAudit()

  if (instantAuditLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-lg font-medium">Analyzing page...</p>
          <p className="text-sm text-muted-foreground">This may take a moment</p>
        </CardContent>
      </Card>
    )
  }

  if (instantAuditError) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-lg font-medium">Error analyzing page</p>
          <p className="text-sm text-muted-foreground mb-4">{instantAuditError}</p>
          <Button onClick={clearInstantAuditResults}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  if (!instantAuditResults) {
    return null
  }

  // Log the full response structure to help with debugging
  console.log("Full audit results:", JSON.stringify(instantAuditResults).substring(0, 1000) + "...")

  // Get the task from the response
  const task = instantAuditResults.tasks?.[0]
  if (!task?.result?.[0]) {
    console.error("Invalid audit results structure - missing task or result:", instantAuditResults)
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-lg font-medium">Invalid Results</p>
          <p className="text-sm text-muted-foreground mb-4">The audit results are not in the expected format.</p>
          <Button onClick={clearInstantAuditResults}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  // Extract the page data from the items array
  const resultData = task.result[0]
  const pageData = resultData.items?.[0]

  // Log the full page data to help with debugging
  console.log("Full page data:", JSON.stringify(pageData).substring(0, 2000) + "...")

  if (!pageData) {
    console.error("Invalid audit results structure - missing items data:", resultData)
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-lg font-medium">Missing Page Data</p>
          <p className="text-sm text-muted-foreground mb-4">The audit results do not contain page data.</p>
          <Button onClick={clearInstantAuditResults}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  // Extract key metrics with proper fallbacks
  const score = pageData.onpage_score || 0
  const scoreColor = score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : "text-red-500"

  const url = pageData.url || task.data?.url || "Unknown URL"

  // Extract meta information
  const meta = {
    title: pageData.meta?.title || "",
    description: pageData.meta?.description || "",
    canonical: pageData.meta?.canonical || "",
    robots: pageData.meta?.follow !== undefined ? (pageData.meta.follow ? "follow" : "nofollow") : "",
    viewport: "",
    h1: pageData.meta?.htags?.h1 || [],
    h2: pageData.meta?.htags?.h2 || [],
    h3: pageData.meta?.htags?.h3 || [],
    h4: pageData.meta?.htags?.h4 || [],
    h5: pageData.meta?.htags?.h5 || [],
    language: "",
    content_type: pageData.media_type || "text/html",
    generator: pageData.meta?.generator || "",
    charset: pageData.meta?.charset || "",
    internal_links_count: pageData.meta?.internal_links_count || 0,
    external_links_count: pageData.meta?.external_links_count || 0,
    images_count: pageData.meta?.images_count || 0,
  }

  // Extract content metrics
  const contentMetrics = {
    wordCount: pageData.meta?.content?.plain_text_word_count || 0,
    textRate: pageData.meta?.content?.plain_text_rate || 0,
    readabilityScore: pageData.meta?.content?.automated_readability_index || 0,
    textSize: pageData.meta?.content?.plain_text_size || 0,
  }

  // Calculate link metrics
  const linkMetrics = {
    total: meta.internal_links_count + meta.external_links_count,
    internal: meta.internal_links_count,
    external: meta.external_links_count,
    broken: pageData.broken_links === true ? 1 : 0,
  }

  // Calculate size metrics
  const sizeMetrics = {
    totalSize: pageData.size || 0,
    htmlSize: pageData.size || 0,
    transferSize: pageData.total_transfer_size || 0,
    domSize: pageData.total_dom_size || 0,
  }

  // Get page status
  const pageStatus = {
    code: pageData.status_code || 200,
    message: pageData.status_code === 200 ? "OK" : "Error",
  }

  // Get meta tags status
  const metaStatus = {
    hasTitle: !!meta.title,
    hasDescription: !!meta.description,
    hasCanonical: !!meta.canonical,
    hasRobots: !!meta.robots,
    hasViewport: !!meta.viewport,
  }

  // Calculate image metrics
  const imageMetrics = {
    total: meta.images_count,
    withoutAlt: pageData.checks?.no_image_alt === true ? "Some images" : 0,
    broken: pageData.broken_resources === true ? "Some resources" : 0,
  }

  // Get performance metrics
  const performanceMetrics = {
    timeToInteractive: pageData.page_timing?.time_to_interactive || 0,
    domComplete: pageData.page_timing?.dom_complete || 0,
    largestContentfulPaint: pageData.page_timing?.largest_contentful_paint || 0,
    firstInputDelay: pageData.page_timing?.first_input_delay || 0,
  }

  // Get screenshot data
  const screenshotData = pageData.page_screenshot_data

  // Log extracted metrics for debugging
  console.log("Extracted content metrics:", contentMetrics)
  console.log("Extracted link metrics:", linkMetrics)
  console.log("Extracted image metrics:", imageMetrics)

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Audit Results</CardTitle>
            <CardDescription>{url}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearInstantAuditResults}>
            New Audit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className={`text-4xl font-bold ${scoreColor}`}>{Math.round(score)}%</div>
                <Progress value={score} className="w-full mt-2" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold">
                  {((performanceMetrics.timeToInteractive || 0) / 1000).toFixed(2)}s
                </div>
                <div className="text-sm text-muted-foreground mt-1">Time to Interactive</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold">{contentMetrics.wordCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Words</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meta">Meta Tags</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Page Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">URL: </span>
                      <span className="text-sm">{url}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Status: </span>
                      <span className="text-sm">
                        {pageStatus.code} {pageStatus.message}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Content Type: </span>
                      <span className="text-sm">{meta.content_type || "text/html"}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Encoding: </span>
                      <span className="text-sm">{meta.charset ? `UTF-${meta.charset}` : "UTF-8"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Badge variant={metaStatus.hasTitle ? "default" : "destructive"} className="mr-2">
                        {metaStatus.hasTitle ? "✓" : "✗"}
                      </Badge>
                      <span className="text-sm">Title Tag</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant={metaStatus.hasDescription ? "default" : "destructive"} className="mr-2">
                        {metaStatus.hasDescription ? "✓" : "✗"}
                      </Badge>
                      <span className="text-sm">Meta Description</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant={metaStatus.hasCanonical ? "default" : "destructive"} className="mr-2">
                        {metaStatus.hasCanonical ? "✓" : "✗"}
                      </Badge>
                      <span className="text-sm">Canonical URL</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant={contentMetrics.wordCount >= 300 ? "default" : "destructive"} className="mr-2">
                        {contentMetrics.wordCount >= 300 ? "✓" : "✗"}
                      </Badge>
                      <span className="text-sm">Content Length</span>
                    </div>
                  </div>
                </div>
              </div>

              {screenshotData && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Page Screenshot</h3>
                  <div className="border rounded-md overflow-hidden">
                    <img src={`data:image/jpeg;base64,${screenshotData}`} alt="Page Screenshot" className="w-full" />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="meta">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Title</h3>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">{meta.title || "No title found"}</p>
                    <div className="flex items-center mt-2">
                      <Badge
                        variant={pageData.checks?.title_too_long === true ? "destructive" : "default"}
                        className="mr-2"
                      >
                        {pageData.checks?.title_too_long === true ? "Too Long" : "Good"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {pageData.checks?.title_too_long === true
                          ? "Title is too long (over 60 characters)"
                          : pageData.checks?.title_too_short === true
                            ? "Title is too short (under 30 characters)"
                            : "Title length is good"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Meta Description</h3>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">{meta.description || "No description found"}</p>
                    <div className="flex items-center mt-2">
                      <Badge
                        variant={pageData.checks?.no_description === true ? "destructive" : "default"}
                        className="mr-2"
                      >
                        {pageData.checks?.no_description === true ? "Missing" : "Good"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {pageData.checks?.no_description === true
                          ? "Description is missing"
                          : meta.description && meta.description.length > 160
                            ? "Description is too long (over 160 characters)"
                            : meta.description && meta.description.length < 50
                              ? "Description is too short (under 50 characters)"
                              : "Description length is good"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Other Meta Tags</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Canonical URL: </span>
                        <span className="text-sm">{meta.canonical || "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Robots: </span>
                        <span className="text-sm">{meta.robots || "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Viewport: </span>
                        <span className="text-sm">{meta.viewport || "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Language: </span>
                        <span className="text-sm">{meta.language || "Not set"}</span>
                      </div>
                      {meta.generator && (
                        <div>
                          <span className="text-sm font-medium">Generator: </span>
                          <span className="text-sm">{meta.generator}</span>
                        </div>
                      )}
                      {meta.charset && (
                        <div>
                          <span className="text-sm font-medium">Charset: </span>
                          <span className="text-sm">UTF-{meta.charset}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Headings</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {meta.h1 && meta.h1.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">H1: </span>
                          <span className="text-sm">{meta.h1[0]}</span>
                        </div>
                      )}
                      {meta.h2 &&
                        Array.isArray(meta.h2) &&
                        meta.h2.slice(0, 5).map((h2: string, index: number) => (
                          <div key={index}>
                            <span className="text-sm font-medium">H2: </span>
                            <span className="text-sm">{h2}</span>
                          </div>
                        ))}
                      {meta.h3 &&
                        Array.isArray(meta.h3) &&
                        meta.h3.slice(0, 5).map((h3: string, index: number) => (
                          <div key={index}>
                            <span className="text-sm font-medium">H3: </span>
                            <span className="text-sm">{h3}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Content Metrics</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium">Word Count: </span>
                        <span className="text-sm">{contentMetrics.wordCount}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Text/HTML Ratio: </span>
                        <span className="text-sm">
                          {contentMetrics.textRate ? `${(contentMetrics.textRate * 100).toFixed(2)}%` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Readability: </span>
                        <span className="text-sm">
                          {contentMetrics.readabilityScore ? contentMetrics.readabilityScore.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Images</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Total Images: </span>
                        <span className="text-sm">{imageMetrics.total}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Images Without Alt Text: </span>
                        <span className="text-sm">{imageMetrics.withoutAlt}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Broken Images: </span>
                        <span className="text-sm">{imageMetrics.broken}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Link Summary</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium">Total Links: </span>
                        <span className="text-sm">{linkMetrics.total}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">External Links: </span>
                        <span className="text-sm">{linkMetrics.external}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Internal Links: </span>
                        <span className="text-sm">{linkMetrics.internal}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {pageData.broken_links === true && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Broken Links</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="p-4 bg-destructive/10 rounded-md text-destructive">
                        <p>The page contains broken links.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Page Timing</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Time to Interactive: </span>
                        <span className="text-sm">{(performanceMetrics.timeToInteractive / 1000).toFixed(2)}s</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">DOM Complete: </span>
                        <span className="text-sm">{(performanceMetrics.domComplete / 1000).toFixed(2)}s</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Largest Contentful Paint: </span>
                        <span className="text-sm">
                          {(performanceMetrics.largestContentfulPaint / 1000).toFixed(2)}s
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">First Input Delay: </span>
                        <span className="text-sm">{(performanceMetrics.firstInputDelay / 1000).toFixed(2)}s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Page Size</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Total DOM Size: </span>
                        <span className="text-sm">{sizeMetrics.domSize || 0} elements</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">HTML Size: </span>
                        <span className="text-sm">
                          {sizeMetrics.htmlSize ? `${(sizeMetrics.htmlSize / 1024).toFixed(2)} KB` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Total Transfer Size: </span>
                        <span className="text-sm">
                          {sizeMetrics.transferSize ? `${(sizeMetrics.transferSize / 1024).toFixed(2)} KB` : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Total Size: </span>
                        <span className="text-sm">
                          {sizeMetrics.totalSize ? `${(sizeMetrics.totalSize / 1024).toFixed(2)} KB` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

