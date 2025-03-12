"use client"

import { useState, useEffect } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink } from "lucide-react"

// Define the interface for non-indexable page data
interface NonIndexablePageData {
  url: string;
  reason: string;
  status_code: number;
}

export function SiteAuditNonIndexable() {
  const { siteAuditNonIndexable, activeSiteAuditTask, loadSiteAuditNonIndexable } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPages, setFilteredPages] = useState<NonIndexablePageData[]>(siteAuditNonIndexable || [])

  // Debug the non-indexable pages data
  useEffect(() => {
    console.log("SiteAuditNonIndexable component - Current non-indexable data:", siteAuditNonIndexable)
  }, [siteAuditNonIndexable])

  // Filter pages when search term or pages change
  useEffect(() => {
    if (!siteAuditNonIndexable) {
      console.log("No non-indexable pages data available")
      return
    }

    console.log(`Filtering ${siteAuditNonIndexable.length} non-indexable pages with search term: "${searchTerm}"`)

    if (searchTerm.trim() === "") {
      setFilteredPages(siteAuditNonIndexable)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredPages(
        siteAuditNonIndexable.filter(
          (page: NonIndexablePageData) =>
            page.url.toLowerCase().includes(term) || page.reason.toLowerCase().includes(term),
        ),
      )
    }
    
    console.log(`Filtered to ${filteredPages.length} non-indexable pages`)
  }, [searchTerm, siteAuditNonIndexable])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      console.log(`Reloading non-indexable pages data for task: ${activeSiteAuditTask}`)
      loadSiteAuditNonIndexable(activeSiteAuditTask)
    }
  }

  if (!siteAuditNonIndexable) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">No non-indexable pages data available</h3>
          <p className="text-sm text-muted-foreground">Run a site audit to see non-indexable pages data</p>
          {activeSiteAuditTask && (
            <Button onClick={handleReload} className="mt-4">
              Load Non-Indexable Pages Data
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search non-indexable pages..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleReload}>
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">URL</TableHead>
                <TableHead className="w-[40%]">Reason</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length > 0 ? (
                filteredPages.map((page, index) => (
                  <TableRow key={`${page.url}-${index}`}>
                    <TableCell className="font-mono text-xs">
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:underline"
                      >
                        {page.url}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{page.reason}</span>
                    </TableCell>
                    <TableCell>
                      {page.status_code ? (
                        <Badge
                          variant={
                            page.status_code >= 200 && page.status_code < 300
                              ? "success"
                              : page.status_code >= 300 && page.status_code < 400
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {page.status_code}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unknown</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No non-indexable pages found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}
