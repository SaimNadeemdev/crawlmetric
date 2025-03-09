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

export function SiteAuditLinks() {
  const { siteAuditLinks, activeSiteAuditTask, loadSiteAuditLinks } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLinks, setFilteredLinks] = useState(siteAuditLinks || [])

  // Filter links when search term or links change
  useEffect(() => {
    if (!siteAuditLinks) return

    if (searchTerm.trim() === "") {
      setFilteredLinks(siteAuditLinks)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredLinks(
        siteAuditLinks.filter(
          (link) =>
            link.url.toLowerCase().includes(term) || (link.source_url && link.source_url.toLowerCase().includes(term)),
        ),
      )
    }
  }, [searchTerm, siteAuditLinks])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      loadSiteAuditLinks(activeSiteAuditTask)
    }
  }

  if (!siteAuditLinks) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-center text-muted-foreground">No links data available</p>
          <Button onClick={handleReload}>Load Links Data</Button>
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
              placeholder="Search links..."
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
          Showing {filteredLinks.length} of {siteAuditLinks.length} links
        </p>
      </div>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Found On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.length > 0 ? (
              filteredLinks.map((link, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    <div className="flex items-center space-x-2">
                      <span className="truncate">{link.url}</span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={link.type === "internal" ? "default" : "outline"}>
                      {link.type === "internal" ? "Internal" : "External"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={link.status_code === 200 ? "default" : "destructive"}>{link.status_code}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    <div className="flex items-center space-x-2">
                      <span className="truncate">{link.source_url}</span>
                      <a
                        href={link.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No links match your search criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  )
}

