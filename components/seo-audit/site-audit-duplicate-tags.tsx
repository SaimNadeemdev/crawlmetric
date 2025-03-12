"use client"

import { useState, useEffect } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Define the interface for duplicate tag data
interface DuplicateTagData {
  tag_type: string;
  duplicate_value: string;
  pages: string[];
}

export function SiteAuditDuplicateTags() {
  const { siteAuditDuplicateTags, activeSiteAuditTask, loadSiteAuditDuplicateTags } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTags, setFilteredTags] = useState<DuplicateTagData[]>(siteAuditDuplicateTags || [])

  // Debug the duplicate tags data
  useEffect(() => {
    console.log("SiteAuditDuplicateTags component - Current duplicate tags data:", siteAuditDuplicateTags)
  }, [siteAuditDuplicateTags])

  // Filter tags when search term or tags change
  useEffect(() => {
    if (!siteAuditDuplicateTags) {
      console.log("No duplicate tags data available")
      return
    }

    console.log(`Filtering ${siteAuditDuplicateTags.length} duplicate tags with search term: "${searchTerm}"`)

    if (searchTerm.trim() === "") {
      setFilteredTags(siteAuditDuplicateTags)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredTags(
        siteAuditDuplicateTags.filter(
          (tag: DuplicateTagData) =>
            tag.duplicate_value.toLowerCase().includes(term) || 
            tag.tag_type.toLowerCase().includes(term) ||
            tag.pages.some(page => page.toLowerCase().includes(term))
        ),
      )
    }
    
    console.log(`Filtered to ${filteredTags.length} duplicate tags`)
  }, [searchTerm, siteAuditDuplicateTags])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      console.log(`Reloading duplicate tags data for task: ${activeSiteAuditTask}`)
      loadSiteAuditDuplicateTags(activeSiteAuditTask)
    }
  }

  if (!siteAuditDuplicateTags || siteAuditDuplicateTags.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">No duplicate tags found</h3>
          <p className="text-sm text-gray-500 max-w-md">
            Great news! We couldn't find any duplicate tags on your website. This is good for SEO.
          </p>
          {activeSiteAuditTask && (
            <Button 
              onClick={handleReload} 
              className="mt-4 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full px-6 transition-all duration-300"
            >
              Refresh Data
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
            placeholder="Search duplicate tags..."
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
          {filteredTags.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredTags.map((tag, index) => (
                <Card key={`${tag.tag_type}-${index}`} className="overflow-hidden border-t-4 border-blue-500">
                  <div className="p-4 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="mb-2">{tag.tag_type}</Badge>
                        <h3 className="text-lg font-medium">{tag.duplicate_value}</h3>
                      </div>
                      <Badge variant="outline">{tag.pages.length} pages</Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="pages">
                        <AccordionTrigger className="text-sm font-medium">
                          Pages with this duplicate tag
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 mt-2">
                            {tag.pages.map((page, pageIndex) => (
                              <div key={pageIndex} className="flex items-center space-x-2 text-sm">
                                <a
                                  href={page}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-xs flex items-center hover:underline"
                                >
                                  {page}
                                  <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center">
              <p className="text-center text-muted-foreground">No duplicate tags found</p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}
