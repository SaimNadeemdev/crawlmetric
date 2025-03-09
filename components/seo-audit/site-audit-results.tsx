"use client"

import { useEffect } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

// Components for each tab
import { SiteAuditPages } from "./site-audit-pages"
import { SiteAuditDuplicates } from "./site-audit-duplicates"
import { SiteAuditLinks } from "./site-audit-links"
import { SiteAuditNonIndexable } from "./site-audit-non-indexable"

export function SiteAuditResults() {
  const {
    activeSiteAuditTask,
    siteAuditTasks,
    siteAuditSummary,
    loadSiteAuditSummary,
    loadSiteAuditPages,
    loadSiteAuditDuplicateTags,
    loadSiteAuditLinks,
    loadSiteAuditNonIndexable,
    siteAuditLoading,
  } = useSeoAudit()

  // Load summary when component mounts or when active task changes
  useEffect(() => {
    if (activeSiteAuditTask) {
      loadSiteAuditSummary(activeSiteAuditTask)
    }
  }, [activeSiteAuditTask, loadSiteAuditSummary])

  // Load detailed data only when the audit is complete
  useEffect(() => {
    if (activeSiteAuditTask && siteAuditSummary && siteAuditSummary.crawl_progress === "finished") {
      // Only load detailed data when the audit is complete
      loadSiteAuditPages(activeSiteAuditTask)
      loadSiteAuditDuplicateTags(activeSiteAuditTask)
      loadSiteAuditLinks(activeSiteAuditTask)
      loadSiteAuditNonIndexable(activeSiteAuditTask)
    }
  }, [
    activeSiteAuditTask,
    siteAuditSummary,
    loadSiteAuditPages,
    loadSiteAuditDuplicateTags,
    loadSiteAuditLinks,
    loadSiteAuditNonIndexable,
  ])

  // If no active task or summary, show loading or empty state
  if (!activeSiteAuditTask || !siteAuditSummary) {
    if (siteAuditLoading) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-lg font-medium">Loading audit data...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <p className="text-lg font-medium">No audit selected</p>
          <p className="text-sm text-muted-foreground">Select an audit from the list to view results</p>
        </CardContent>
      </Card>
    )
  }

  const domainName = siteAuditSummary.domain_info.name

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site Audit Results</h1>
        <p className="text-muted-foreground">{domainName}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Crawled</CardTitle>
            <Badge variant="outline">
              {siteAuditSummary.crawl_progress === "finished" ? "Complete" : "In Progress"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{siteAuditSummary.pages_crawled}</div>
            <p className="text-xs text-muted-foreground">of {siteAuditSummary.pages_count} total pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{siteAuditSummary.page_metrics.onpage_score.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">overall score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {siteAuditSummary.page_metrics.links_internal + siteAuditSummary.page_metrics.links_external}
            </div>
            <p className="text-xs text-muted-foreground">
              {siteAuditSummary.page_metrics.links_internal} internal, {siteAuditSummary.page_metrics.links_external}{" "}
              external
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="non-indexable">Non-Indexable</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Issues Summary */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Issues Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Broken Resources</p>
                    <Badge variant="destructive">{siteAuditSummary.page_metrics.broken_resources}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Broken Links</p>
                    <Badge variant="destructive">{siteAuditSummary.page_metrics.broken_links}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Duplicate Titles</p>
                    <Badge variant="secondary">{siteAuditSummary.page_metrics.duplicate_title}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Duplicate Descriptions</p>
                    <Badge variant="secondary">{siteAuditSummary.page_metrics.duplicate_description}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Duplicate Content</p>
                    <Badge variant="secondary">{siteAuditSummary.page_metrics.duplicate_content}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Non-Indexable Pages</p>
                    <Badge variant="secondary">{siteAuditSummary.page_metrics.non_indexable}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Metrics */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>SEO Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">SEO Score</p>
                    <Badge variant="outline" className="font-bold">
                      {siteAuditSummary.page_metrics.onpage_score.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">HTTPS Pages</p>
                    <Badge variant="outline">{siteAuditSummary.page_metrics.https_pages || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Internal Links</p>
                    <Badge variant="outline">{siteAuditSummary.page_metrics.links_internal}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">External Links</p>
                    <Badge variant="outline">{siteAuditSummary.page_metrics.links_external}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Indexable Pages</p>
                    <Badge variant="outline">
                      {siteAuditSummary.pages_crawled - siteAuditSummary.page_metrics.non_indexable}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Domain Information */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Domain Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Domain</h4>
                      <p className="text-sm text-muted-foreground">{domainName}</p>
                    </div>
                    {siteAuditSummary.domain_info.ip && (
                      <div>
                        <h4 className="text-sm font-medium">IP</h4>
                        <p className="text-sm text-muted-foreground">{siteAuditSummary.domain_info.ip}</p>
                      </div>
                    )}
                    {siteAuditSummary.domain_info.server && (
                      <div>
                        <h4 className="text-sm font-medium">Server</h4>
                        <p className="text-sm text-muted-foreground">{siteAuditSummary.domain_info.server}</p>
                      </div>
                    )}
                    {siteAuditSummary.domain_info.cms && (
                      <div>
                        <h4 className="text-sm font-medium">CMS</h4>
                        <p className="text-sm text-muted-foreground">{siteAuditSummary.domain_info.cms}</p>
                      </div>
                    )}
                    {siteAuditSummary.domain_info.crawl_start && (
                      <div>
                        <h4 className="text-sm font-medium">Crawl Start</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(siteAuditSummary.domain_info.crawl_start), "MMM d, yyyy HH:mm:ss")}
                        </p>
                      </div>
                    )}
                    {siteAuditSummary.domain_info.crawl_end && (
                      <div>
                        <h4 className="text-sm font-medium">Crawl End</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(siteAuditSummary.domain_info.crawl_end), "MMM d, yyyy HH:mm:ss")}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Crawl Status */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Crawl Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 border rounded-md p-4">
                    <h3 className="text-sm font-medium">Progress</h3>
                    <p className="text-2xl font-bold">
                      {siteAuditSummary.crawl_progress === "finished"
                        ? "100%"
                        : `${Math.round((siteAuditSummary.pages_crawled / siteAuditSummary.pages_count) * 100)}%`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {siteAuditSummary.crawl_progress === "finished" ? "Crawl completed" : "Crawl in progress"}
                    </p>
                  </div>
                  <div className="space-y-2 border rounded-md p-4">
                    <h3 className="text-sm font-medium">Pages Crawled</h3>
                    <p className="text-2xl font-bold">{siteAuditSummary.pages_crawled}</p>
                    <p className="text-xs text-muted-foreground">of {siteAuditSummary.pages_count} total pages</p>
                  </div>
                  <div className="space-y-2 border rounded-md p-4">
                    <h3 className="text-sm font-medium">Status</h3>
                    <p className="text-xl font-bold">
                      <Badge variant={siteAuditSummary.crawl_progress === "finished" ? "default" : "secondary"}>
                        {siteAuditSummary.crawl_status?.status_message ||
                          (siteAuditSummary.crawl_progress === "finished" ? "Completed" : "In Progress")}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Code: {siteAuditSummary.crawl_status?.status_code || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <SiteAuditPages />
        </TabsContent>

        <TabsContent value="duplicates">
          <SiteAuditDuplicates />
        </TabsContent>

        <TabsContent value="links">
          <SiteAuditLinks />
        </TabsContent>

        <TabsContent value="non-indexable">
          <SiteAuditNonIndexable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

