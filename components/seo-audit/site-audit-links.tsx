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

// Define the interface for link data
interface LinkData {
  url: string;
  type: "internal" | "external";
  status_code: number;
  source_url: string;
}

export function SiteAuditLinks() {
  const { siteAuditLinks, activeSiteAuditTask, loadSiteAuditLinks } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLinks, setFilteredLinks] = useState<LinkData[]>(siteAuditLinks || [])

  // Debug the links data
  useEffect(() => {
    console.log("SiteAuditLinks component - Current links data:", siteAuditLinks)
  }, [siteAuditLinks])

  // Filter links when search term or links change
  useEffect(() => {
    if (!siteAuditLinks) {
      console.log("No links data available")
      return
    }

    console.log(`Filtering ${siteAuditLinks.length} links with search term: "${searchTerm}"`)

    if (searchTerm.trim() === "") {
      setFilteredLinks(siteAuditLinks)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredLinks(
        siteAuditLinks.filter(
          (link: LinkData) =>
            link.url.toLowerCase().includes(term) || (link.source_url && link.source_url.toLowerCase().includes(term)),
        ),
      )
    }
    
    console.log(`Filtered to ${filteredLinks.length} links`)
  }, [searchTerm, siteAuditLinks])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      console.log(`Reloading links data for task: ${activeSiteAuditTask}`)
      loadSiteAuditLinks(activeSiteAuditTask)
    }
  }

  if (!siteAuditLinks) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">No links data available</h3>
          <p className="text-sm text-muted-foreground">Run a site audit to see links data</p>
          {activeSiteAuditTask && (
            <Button onClick={handleReload} className="mt-4">
              Load Links Data
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

      <Card className="overflow-hidden">
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">URL</TableHead>
                <TableHead className="w-[40%]">Source URL</TableHead>
                <TableHead className="w-[10%]">Type</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link, index) => (
                  <TableRow key={`${link.url}-${index}`}>
                    <TableCell className="font-mono text-xs">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:underline"
                      >
                        {link.url}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {link.source_url && (
                        <a
                          href={link.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center hover:underline"
                        >
                          {link.source_url}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={link.type === "internal" ? "outline" : "secondary"}>
                        {link.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {link.status_code ? (
                        <Badge
                          variant={
                            link.status_code >= 200 && link.status_code < 300
                              ? "success"
                              : link.status_code >= 300 && link.status_code < 400
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {link.status_code}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unknown</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No links found
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
