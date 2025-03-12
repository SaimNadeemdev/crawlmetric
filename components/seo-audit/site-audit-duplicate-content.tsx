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
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

// Define the interface for duplicate content data
interface DuplicateContentPage {
  similarity: number;
  page: {
    url: string;
    meta: {
      title: string;
      description: string;
    };
    content: {
      plain_text_word_count: number;
    };
  };
}

interface DuplicateContentItem {
  url: string;
  total_count: number;
  pages: DuplicateContentPage[];
}

export function SiteAuditDuplicateContent() {
  const { siteAuditDuplicateContent, activeSiteAuditTask, loadSiteAuditDuplicateContent } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredContent, setFilteredContent] = useState<any[]>([])

  // Debug the duplicate content data
  useEffect(() => {
    console.log("SiteAuditDuplicateContent component - Current duplicate content data:", siteAuditDuplicateContent)
    setFilteredContent(siteAuditDuplicateContent || [])
  }, [siteAuditDuplicateContent])

  // Filter content when search term or content change
  useEffect(() => {
    if (!siteAuditDuplicateContent) {
      console.log("No duplicate content data available")
      return
    }

    console.log(`Filtering ${siteAuditDuplicateContent.length} duplicate content items with search term: "${searchTerm}"`)

    if (searchTerm.trim() === "") {
      setFilteredContent(siteAuditDuplicateContent)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredContent(
        siteAuditDuplicateContent.filter(
          (content: any) =>
            content.url?.toLowerCase().includes(term) || 
            content.pages?.some((page: any) => 
              page.page?.url?.toLowerCase().includes(term) ||
              page.page?.meta?.title?.toLowerCase().includes(term) ||
              page.page?.meta?.description?.toLowerCase().includes(term)
            )
        ),
      )
    }
    
    console.log(`Filtered to ${filteredContent.length} duplicate content items`)
  }, [searchTerm, siteAuditDuplicateContent])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      console.log(`Reloading duplicate content data for task: ${activeSiteAuditTask}`)
      loadSiteAuditDuplicateContent(activeSiteAuditTask)
    }
  }

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  // Function to format word count
  const formatWordCount = (count: number) => {
    return count.toLocaleString() + " words";
  }

  if (!siteAuditDuplicateContent || siteAuditDuplicateContent.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">No duplicate content found</h3>
          <p className="text-sm text-gray-500 max-w-md">
            Great news! We couldn't find any duplicate content on your website. This is good for SEO.
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
            placeholder="Search duplicate content..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReload}
          className="rounded-full hover:bg-[#0071e3] hover:text-white transition-all duration-300"
        >
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        <ScrollArea className="h-[600px] w-full">
          {filteredContent.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredContent.map((content: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card key={index} className="overflow-hidden border-t-4 border-purple-500 backdrop-blur-xl bg-white/50 hover:shadow-md transition-all duration-300">
                    <div className="p-4 bg-slate-50/80">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">
                              {content.total_count || 0} Duplicate Pages
                            </Badge>
                            <a
                              href={content.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex items-center hover:underline text-blue-600"
                            >
                              {truncateText(content.url || "", 60)}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="pages">
                          <AccordionTrigger className="text-sm font-medium">
                            Pages with duplicate content
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 mt-2">
                              {content.pages && content.pages.map((page: any, pageIndex: number) => (
                                <div key={pageIndex} className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all duration-300">
                                  <div className="flex items-center justify-between mb-2">
                                    <a
                                      href={page.page?.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono text-xs flex items-center hover:underline text-blue-600"
                                    >
                                      {truncateText(page.page?.url || "", 60)}
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                    <Badge variant="outline" className="text-xs bg-purple-50">
                                      {Math.round((page.similarity || 0) * 10)}% Similar
                                    </Badge>
                                  </div>
                                  <div className="mt-2 text-sm">
                                    <h4 className="font-medium text-gray-800">{truncateText(page.page?.meta?.title || "", 80)}</h4>
                                    <p className="text-gray-600 text-xs mt-1">{truncateText(page.page?.meta?.description || "", 120)}</p>
                                  </div>
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                      <span>Content Size</span>
                                      <span>{formatWordCount(page.page?.content?.plain_text_word_count || 0)}</span>
                                    </div>
                                    <Progress 
                                      value={Math.min(100, ((page.page?.content?.plain_text_word_count || 0) / 1000) * 100)} 
                                      className="h-1.5 bg-gray-100" 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center">
              <p className="text-center text-muted-foreground">No duplicate content found</p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}
