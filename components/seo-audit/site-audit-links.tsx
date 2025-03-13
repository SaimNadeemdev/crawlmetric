"use client"

import { useState, useEffect } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, RefreshCw, Link2, AlertCircle, CheckCircle2, ArrowUpRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Define the interface for link data
interface LinkData {
  url: string
  type: "internal" | "external"
  status_code: number
  source_url: string
}

export function SiteAuditLinks() {
  const { siteAuditLinks, activeSiteAuditTask, loadSiteAuditLinks } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLinks, setFilteredLinks] = useState<LinkData[]>(siteAuditLinks || [])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

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
    setIsSearching(true)

    const filterTimeout = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredLinks(siteAuditLinks)
      } else {
        const term = searchTerm.toLowerCase()
        setFilteredLinks(
          siteAuditLinks.filter(
            (link: LinkData) =>
              link.url.toLowerCase().includes(term) ||
              (link.source_url && link.source_url.toLowerCase().includes(term)),
          ),
        )
      }

      console.log(`Filtered to ${filteredLinks.length} links`)
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(filterTimeout)
  }, [searchTerm, siteAuditLinks])

  // Reload data if needed
  const handleReload = () => {
    if (activeSiteAuditTask) {
      setIsRefreshing(true)
      console.log(`Reloading links data for task: ${activeSiteAuditTask}`)
      loadSiteAuditLinks(activeSiteAuditTask)

      // Simulate loading state for better UX
      setTimeout(() => {
        setIsRefreshing(false)
      }, 800)
    }
  }

  // Get status badge variant and label
  const getStatusBadge = (statusCode: number | undefined) => {
    if (!statusCode) {
      return {
        variant: "outline" as const,
        label: "Unknown",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        color: "bg-gray-50 text-gray-700 border-gray-200"
      }
    }

    if (statusCode >= 200 && statusCode < 300) {
      return {
        variant: "success" as const,
        label: statusCode.toString(),
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        color: "bg-green-50 text-green-700 border-green-200"
      }
    }

    if (statusCode >= 300 && statusCode < 400) {
      return {
        variant: "warning" as const,
        label: statusCode.toString(),
        icon: <ArrowUpRight className="h-3 w-3 mr-1" />,
        color: "bg-amber-50 text-amber-700 border-amber-200"
      }
    }

    return {
      variant: "destructive" as const,
      label: statusCode.toString(),
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
      color: "bg-red-50 text-red-700 border-red-200"
    }
  }

  if (!siteAuditLinks) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-[500px] items-center justify-center"
      >
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#d2d2d7] shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-[#f5f5f7] flex items-center justify-center">
              <Link2 className="h-8 w-8 text-[#0071e3]" />
            </div>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Links Data Available</h3>
          <p className="text-sm text-gray-500 mb-6">
            Run a site audit to analyze your website's links and discover potential issues with your internal and
            external links.
          </p>
          {activeSiteAuditTask && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleReload}
                className="h-11 px-6 rounded-full bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white font-medium shadow-sm hover:shadow-md transition-all"
              >
                Load Links Data
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            placeholder="Search by URL or source..."
            className="h-11 pl-10 pr-4 rounded-full border-[#d2d2d7] bg-white/90 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                <div className="h-4 w-4 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReload}
            disabled={isRefreshing}
            className="h-11 px-5 rounded-full border-[#d2d2d7] hover:bg-[#0071e3]/5 hover:text-[#0071e3] hover:border-[#0071e3] transition-colors"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Links
              </>
            )}
          </Button>
        </motion.div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <div>
          {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"} found
          {searchTerm && ` for "${searchTerm}"`}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-1.5"></span>
            200-299
          </div>
          <div className="flex items-center">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500 mr-1.5"></span>
            300-399
          </div>
          <div className="flex items-center">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-1.5"></span>
            400+
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-[#d2d2d7] bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm">
        <ScrollArea className="h-[600px] w-full">
          <div className="min-w-full table-fixed">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#d2d2d7]">
                  <TableHead className="w-[35%] text-gray-900 font-medium">URL</TableHead>
                  <TableHead className="w-[35%] text-gray-900 font-medium">Source URL</TableHead>
                  <TableHead className="w-[15%] text-gray-900 font-medium">Type</TableHead>
                  <TableHead className="w-[15%] text-gray-900 font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="wait">
                  {filteredLinks.length > 0 ? (
                    filteredLinks.map((link, index) => (
                      <motion.tr
                        key={`${link.url}-${index}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.01 }}
                        className="group border-b border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors"
                      >
                        <TableCell className="font-mono text-xs py-4 max-w-0 w-[35%] overflow-hidden">
                          <motion.a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-[#0071e3] hover:text-[#0077ED] group-hover:underline transition-colors"
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <span className="truncate max-w-[calc(100%-20px)] inline-block">{link.url}</span>
                            <ExternalLink className="ml-1 h-3 w-3 opacity-70 flex-shrink-0" />
                          </motion.a>
                        </TableCell>
                        <TableCell className="font-mono text-xs py-4 max-w-0 w-[35%] overflow-hidden">
                          {link.source_url && (
                            <motion.a
                              href={link.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-600 hover:text-gray-900 group-hover:underline transition-colors"
                              whileHover={{ x: 2 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <span className="truncate max-w-[calc(100%-20px)] inline-block">{link.source_url}</span>
                              <ExternalLink className="ml-1 h-3 w-3 opacity-70 flex-shrink-0" />
                            </motion.a>
                          )}
                        </TableCell>
                        <TableCell className="py-4 w-[15%]">
                          <Badge
                            variant={link.type === "internal" ? "outline" : "secondary"}
                            className={`
                              rounded-full px-3 py-0.5 font-medium text-xs
                              ${
                                link.type === "internal"
                                  ? "bg-[#f5f5f7] text-gray-700 border-[#d2d2d7]"
                                  : "bg-[#e6f7ff] text-[#0071e3] border-[#b3e0ff]"
                              }
                            `}
                          >
                            {link.type === "internal" ? (
                              <span className="flex items-center">
                                <Link2 className="h-3 w-3 mr-1" />
                                internal
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                external
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 w-[15%]">
                          {(() => {
                            const { variant, label, icon, color } = getStatusBadge(link.status_code);
                            return (
                              <Badge
                                variant={variant}
                                className={`
                                  rounded-full px-3 py-0.5 font-medium text-xs
                                  ${color}
                                `}
                              >
                                <span className="flex items-center">
                                  {icon}
                                  {label}
                                </span>
                              </Badge>
                            )
                          })()}
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <TableCell colSpan={4} className="h-60 text-center">
                        <div className="flex flex-col items-center justify-center p-8">
                          <div className="h-12 w-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 mb-1">No links found</p>
                          <p className="text-sm text-gray-500">
                            {searchTerm
                              ? `No links match your search for "${searchTerm}"`
                              : "There are no links available in this audit"}
                          </p>
                          {searchTerm && (
                            <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-[#0071e3]">
                              Clear search
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>
    </motion.div>
  )
}
