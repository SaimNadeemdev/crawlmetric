"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, RefreshCw, Tag, AlertCircle, CheckCircle2, Copy, Link2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

// Define the interface for duplicate tag data
interface DuplicateTagData {
  tag_type: string
  duplicate_value: string
  pages: string[]
}

export function SiteAuditDuplicateTags() {
  const { siteAuditDuplicateTags, activeSiteAuditTask, loadSiteAuditDuplicateTags } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTags, setFilteredTags] = useState<DuplicateTagData[]>(siteAuditDuplicateTags || [])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const { toast } = useToast()

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
            tag.pages.some((page) => page.toLowerCase().includes(term)),
        ),
      )
    }

    console.log(`Filtered to ${filteredTags.length} duplicate tags`)
  }, [searchTerm, siteAuditDuplicateTags])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      setIsRefreshing(true)
      console.log(`Reloading duplicate tags data for task: ${activeSiteAuditTask}`)
      loadSiteAuditDuplicateTags(activeSiteAuditTask).finally(() => {
        setTimeout(() => setIsRefreshing(false), 600) // Add a slight delay for animation
      })
    }
  }

  // Copy URL to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast({
      title: "URL copied",
      description: "The URL has been copied to your clipboard",
    })
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // Get tag type color
  const getTagTypeColor = (tagType: string) => {
    const typeMap: Record<string, string> = {
      title: "bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20",
      description: "bg-purple-50 text-purple-600 border-purple-200",
      h1: "bg-amber-50 text-amber-600 border-amber-200",
      canonical: "bg-emerald-50 text-emerald-600 border-emerald-200",
      "og:title": "bg-rose-50 text-rose-600 border-rose-200",
      "og:description": "bg-indigo-50 text-indigo-600 border-indigo-200",
    }

    return typeMap[tagType.toLowerCase()] || "bg-gray-50 text-gray-600 border-gray-200"
  }

  if (!siteAuditDuplicateTags || siteAuditDuplicateTags.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-[500px] items-center justify-center"
      >
        <div className="text-center space-y-5 max-w-md px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-20 w-20 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4 shadow-sm"
          >
            <CheckCircle2 className="h-10 w-10 text-[#0071e3]" />
          </motion.div>
          <h3 className="text-2xl font-medium text-gray-800 tracking-tight">No duplicate tags found</h3>
          <p className="text-base text-gray-500 leading-relaxed">
            Great news! We couldn't find any duplicate tags on your website. This is good for your SEO performance and
            search engine visibility.
          </p>
          {activeSiteAuditTask && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleReload}
                className="mt-4 bg-gradient-to-r from-[#0071e3] to-[#40a9ff] hover:from-[#0077ED] hover:to-[#4DB1FF] text-white rounded-full px-8 py-6 h-auto text-base font-medium shadow-sm transition-all duration-300"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative flex-1"
        >
          <div className="absolute left-3.5 top-3.5 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            placeholder="Search by tag type, value, or URL..."
            className="pl-10 h-12 rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleReload}
                  disabled={isRefreshing}
                  className="h-12 px-5 rounded-xl border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] hover:border-[#0071e3]/30 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh Data
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reload duplicate tags data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </div>

      <div className="flex items-center justify-between">
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Tag className="h-5 w-5 text-[#0071e3]" />
          <h2 className="text-xl font-medium text-gray-800">Duplicate Tags</h2>
        </motion.div>
        <motion.div
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Badge className="bg-[#f5f5f7] text-gray-600 border-none px-3 py-1 text-xs">
            {filteredTags.length} {filteredTags.length === 1 ? "issue" : "issues"} found
          </Badge>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="overflow-hidden border-none bg-white/90 backdrop-blur-xl shadow-lg rounded-2xl">
          <ScrollArea className="h-[600px] w-full">
            {filteredTags.length > 0 ? (
              <div className="p-6 space-y-6">
                <AnimatePresence>
                  {filteredTags.map((tag, index) => (
                    <motion.div
                      key={`${tag.tag_type}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden border border-[#d2d2d7] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="p-5 bg-[#f5f5f7]">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <Badge variant="outline" className={`mb-2 font-medium ${getTagTypeColor(tag.tag_type)}`}>
                                {tag.tag_type}
                              </Badge>
                              <h3 className="text-base sm:text-lg font-medium text-gray-800 line-clamp-2">
                                {tag.duplicate_value}
                              </h3>
                            </div>
                            <Badge className="bg-[#0071e3] hover:bg-[#0077ED] text-white border-none self-start sm:self-center px-3 py-1">
                              {tag.pages.length} {tag.pages.length === 1 ? "page" : "pages"}
                            </Badge>
                          </div>
                        </div>
                        <div className="px-5 py-4">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="pages" className="border-b-0">
                              <AccordionTrigger className="text-sm font-medium text-[#0071e3] py-2 hover:no-underline">
                                <span className="flex items-center">
                                  <Link2 className="h-4 w-4 mr-2" />
                                  Pages with this duplicate tag
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3 mt-2 pl-6">
                                  {tag.pages.map((page, pageIndex) => (
                                    <motion.div
                                      key={pageIndex}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: pageIndex * 0.05, duration: 0.3 }}
                                      className="flex items-center justify-between group"
                                    >
                                      <a
                                        href={page}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-xs text-gray-600 flex items-center hover:text-[#0071e3] transition-colors truncate max-w-[calc(100%-40px)]"
                                      >
                                        {page}
                                        <ExternalLink className="ml-1.5 h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </a>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={() => copyToClipboard(page)}
                                            >
                                              {copiedUrl === page ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                              ) : (
                                                <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-[#0071e3]" />
                                              )}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent side="left">
                                            <p>{copiedUrl === page ? "Copied!" : "Copy URL"}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </motion.div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex h-[400px] items-center justify-center"
              >
                <div className="text-center space-y-3">
                  <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No matching tags found</p>
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="mt-2">
                    Clear search
                  </Button>
                </div>
              </motion.div>
            )}
          </ScrollArea>
        </Card>
      </motion.div>

      {/* Inject CSS styles */}
      <style jsx global>{`
        /* Animation keyframes */
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 113, 227, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0); }
        }
      `}</style>
    </motion.div>
  )
}

