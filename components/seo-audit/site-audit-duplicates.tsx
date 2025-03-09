"use client"

import { useState } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

export function SiteAuditDuplicates() {
  const { siteAuditDuplicateTags, activeSiteAuditTask, loadSiteAuditDuplicateTags } = useSeoAudit()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Toggle all items
  const toggleAllItems = () => {
    if (expandedItems.length === 0 && siteAuditDuplicateTags) {
      // Expand all
      setExpandedItems(siteAuditDuplicateTags.map((_, index) => `item-${index}`))
    } else {
      // Collapse all
      setExpandedItems([])
    }
  }

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      loadSiteAuditDuplicateTags(activeSiteAuditTask)
    }
  }

  if (!siteAuditDuplicateTags) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-center text-muted-foreground">No duplicate tags found</p>
          <Button onClick={handleReload}>Load Duplicate Tags</Button>
        </div>
      </Card>
    )
  }

  if (siteAuditDuplicateTags.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No duplicate tags found on this site</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Duplicate Content Issues</h3>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={toggleAllItems}>
            {expandedItems.length === 0 ? "Expand All" : "Collapse All"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleReload}>
            Refresh
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[600px]">
        <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems} className="space-y-4">
          {siteAuditDuplicateTags.map((group, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-md p-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="px-2 py-1">
                    {group.pages.length} pages
                  </Badge>
                  <span className="font-medium">
                    {group.type === "title"
                      ? "Duplicate Title"
                      : group.type === "description"
                        ? "Duplicate Description"
                        : "Duplicate Content"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {group.type !== "content" && group.value && (
                    <div className="rounded-md bg-muted p-4 mt-2">
                      <p className="text-sm font-medium">Duplicate {group.type}:</p>
                      <p className="text-sm mt-1">{group.value}</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Affected Pages:</p>
                    <ul className="space-y-2">
                      {group.pages.map((page, pageIndex) => (
                        <li key={pageIndex} className="flex items-center space-x-2">
                          <span className="text-sm truncate max-w-[500px]">{page}</span>
                          <a
                            href={page}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </Card>
  )
}

