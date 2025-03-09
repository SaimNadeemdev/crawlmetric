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

export function SiteAuditNonIndexable() {
  const { siteAuditNonIndexable, activeSiteAuditTask, loadSiteAuditNonIndexable } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPages, setFilteredPages] = useState(siteAuditNonIndexable || [])

  // Filter pages when search term or pages change
  useEffect(() => {
    if (!siteAuditNonIndexable) return

    if (searchTerm.trim() === "") {
      setFilteredPages(siteAuditNonIndexable)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredPages(
        siteAuditNonIndexable.filter(
          (page) => page.url.toLowerCase().includes(term) || (page.reason && page.reason.toLowerCase().includes(term)),
        ),
      )
    }
  }, [searchTerm, siteAuditNonIndexable])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      loadSiteAuditNonIndexable(activeSiteAuditTask)
    }
  }

  if (!siteAuditNonIndexable) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-center text-muted-foreground">No non-indexable pages found</p>
          <Button onClick={handleReload}>Load Non-Indexable Pages</Button>
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
        <p className="mt-2 text-sm text-muted-foreground">
          Showing {filteredPages.length} of {siteAuditNonIndexable.length} non-indexable pages
        </p>
      </div>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.length > 0 ? (
              filteredPages.map((page, index) => (
                <TableRow key={index}>
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
                  <TableCell>{page.reason}</TableCell>
                  <TableCell>
                    <Badge variant={page.status_code === 200 ? "default" : "destructive"}>{page.status_code}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
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

