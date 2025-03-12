"use client"

import { useState, useEffect } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, Loader2 } from "lucide-react"

export function SiteAuditPages() {
  const { siteAuditPages, activeSiteAuditTask, loadSiteAuditPages, siteAuditLoading } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPages, setFilteredPages] = useState(siteAuditPages || [])

  // Filter pages when search term or pages change
  useEffect(() => {
    if (!siteAuditPages) return

    if (searchTerm.trim() === "") {
      setFilteredPages(siteAuditPages)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredPages(
        siteAuditPages.filter(
          (page: any) =>
            page.url.toLowerCase().includes(term) ||
            (page.meta?.title && page.meta.title.toLowerCase().includes(term)) ||
            (page.meta?.description && page.meta.description.toLowerCase().includes(term)),
        ),
      )
    }
  }, [searchTerm, siteAuditPages])

  // Load data when component mounts
  useEffect(() => {
    if (activeSiteAuditTask && !siteAuditPages) {
      loadSiteAuditPages(activeSiteAuditTask)
    }
  }, [activeSiteAuditTask, siteAuditPages, loadSiteAuditPages])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      loadSiteAuditPages(activeSiteAuditTask)
    }
  }

  if (siteAuditLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-xl opacity-70 h-16 w-16 animate-pulse" />
            <div className="relative z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#0071e3] animate-spin" />
            </div>
          </div>
          <p className="text-center text-muted-foreground">Loading pages data...</p>
        </div>
      </Card>
    )
  }

  if (!siteAuditPages || siteAuditPages.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <p className="text-center text-muted-foreground">No pages data available</p>
          <Button onClick={handleReload} className="bg-[#0071e3] hover:bg-[#0077ed] transition-colors">
            Load Pages Data
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search pages..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleReload}>
            Refresh
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Showing {filteredPages.length} of {siteAuditPages.length} pages
        </p>
      </div>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.length > 0 ? (
              filteredPages.map((page: any, index: number) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium max-w-[300px] truncate">
                    <div className="flex items-center space-x-2">
                      <span className="truncate">{page.url}</span>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={page.status_code === 200 ? "default" : 
                             page.status_code >= 300 && page.status_code < 400 ? "outline" :
                             "destructive"}
                    >
                      {page.status_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {page.meta?.title || "No title"}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {page.meta?.description || "No description"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {page.onpage_score ? page.onpage_score.toFixed(1) : "N/A"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No pages match your search criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  )
}
