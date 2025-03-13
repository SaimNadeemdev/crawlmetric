"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  ExternalLink,
  Loader2,
  RefreshCw,
  Filter,
  ArrowDown,
  ArrowUp,
  Info,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type PageData = {
  url: string
  status_code: number
  meta?: {
    title?: string
    description?: string
    h1?: string[]
    canonical?: string
    content?: {
      plain_text_word_count?: number
      size?: number
    }
  }
  onpage_score?: number
  checks?: {
    canonical?: {
      status: string
      value?: string
    }
    meta_robots?: {
      status: string
      value?: string
    }
    h1?: {
      status: string
      count?: number
    }
    title?: {
      status: string
      length?: number
    }
    description?: {
      status: string
      length?: number
    }
    is_https?: boolean
    is_4xx_code?: boolean
    is_5xx_code?: boolean
    is_broken?: boolean
    is_redirect?: boolean
  }
  fetch_time?: string
  internal_links_count?: number
  external_links_count?: number
  images_count?: number
  images_size?: number
  scripts_count?: number
  scripts_size?: number
  stylesheets_count?: number
  stylesheets_size?: number
  total_transfer_size?: number
  page_timing?: {
    time_to_interactive?: number
    dom_complete?: number
    largest_contentful_paint?: number
  }
}

export function SiteAuditPages() {
  const { siteAuditPages, activeSiteAuditTask, loadSiteAuditPages, siteAuditLoading } = useSeoAudit()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPages, setFilteredPages] = useState<PageData[]>(siteAuditPages || [])
  const [sortField, setSortField] = useState<string>("onpage_score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Toggle row expansion
  const toggleRowExpansion = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Filter and sort pages when search term, pages, sort field, or sort direction changes
  useEffect(() => {
    if (!siteAuditPages) return

    let filtered = [...siteAuditPages] as PageData[]

    // Apply status filter
    if (filterStatus !== "all") {
      if (filterStatus === "200") {
        filtered = filtered.filter((page) => page.status_code === 200)
      } else if (filterStatus === "3xx") {
        filtered = filtered.filter((page) => page.status_code >= 300 && page.status_code < 400)
      } else if (filterStatus === "4xx") {
        filtered = filtered.filter((page) => page.status_code >= 400 && page.status_code < 500)
      } else if (filterStatus === "5xx") {
        filtered = filtered.filter((page) => page.status_code >= 500)
      }
    }

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (page) =>
          page.url.toLowerCase().includes(term) ||
          (page.meta?.title && page.meta.title.toLowerCase().includes(term)) ||
          (page.meta?.description && page.meta.description.toLowerCase().includes(term)),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any = null
      let valueB: any = null

      // Handle nested properties
      if (sortField === "onpage_score") {
        valueA = a.onpage_score || 0
        valueB = b.onpage_score || 0
      } else if (sortField === "word_count") {
        valueA = a.meta?.content?.plain_text_word_count || 0
        valueB = b.meta?.content?.plain_text_word_count || 0
      } else if (sortField === "title_length") {
        valueA = a.meta?.title?.length || 0
        valueB = b.meta?.title?.length || 0
      } else if (sortField === "description_length") {
        valueA = a.meta?.description?.length || 0
        valueB = b.meta?.description?.length || 0
      } else if (sortField === "status_code") {
        valueA = a.status_code || 0
        valueB = b.status_code || 0
      } else {
        // Default to URL if sort field is not recognized
        valueA = a.url || ""
        valueB = b.url || ""
      }

      // Compare values based on sort direction
      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredPages(filtered)
  }, [searchTerm, siteAuditPages, sortField, sortDirection, filterStatus])

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

  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new field and default to descending
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredPages.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentPageData = filteredPages.slice(startIndex, endIndex)

  // Generate pagination items
  const paginationItems = []
  const maxPagesToShow = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationItems.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={currentPage === i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? "bg-[#0071e3] text-white hover:bg-[#0077ed]" : "hover:bg-[#f5f5f7]"}
        >
          {i}
        </PaginationLink>
      </PaginationItem>,
    )
  }

  // Get status badge variant
  const getStatusBadgeVariant = (statusCode: number) => {
    if (statusCode === 200) return "success"
    if (statusCode >= 300 && statusCode < 400) return "warning"
    return "destructive"
  }

  // Get score badge variant
  const getScoreBadgeVariant = (score?: number) => {
    if (!score) return "outline"
    if (score > 80) return "success"
    if (score > 60) return "warning"
    return "destructive"
  }

  // Get score badge color
  const getScoreBadgeColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-500"
    if (score > 80) return "bg-[#e3f1ff] text-[#0071e3]"
    if (score > 60) return "bg-amber-50 text-amber-600"
    return "bg-red-50 text-red-600"
  }

  // Get status badge color
  const getStatusBadgeColor = (statusCode: number) => {
    if (statusCode === 200) return "bg-[#e3f1ff] text-[#0071e3]"
    if (statusCode >= 300 && statusCode < 400) return "bg-amber-50 text-amber-600"
    return "bg-red-50 text-red-600"
  }

  if (siteAuditLoading) {
    return (
      <Card className="overflow-hidden border-none shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center space-y-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0071e3]/20 via-[#40a9ff]/20 to-[#0071e3]/20 rounded-full blur-xl opacity-70 h-20 w-20 animate-pulse" />
            <div className="relative z-10 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-[#0071e3] animate-spin" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-gray-500 text-lg"
          >
            Loading pages data...
          </motion.p>
        </div>
      </Card>
    )
  }

  if (!siteAuditPages || siteAuditPages.length === 0) {
    return (
      <Card className="overflow-hidden border-none shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center space-y-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center h-20 w-20 rounded-full bg-[#f5f5f7]"
          >
            <Info className="h-10 w-10 text-[#0071e3]" />
          </motion.div>
          <div className="space-y-4 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-gray-700 text-lg font-medium"
            >
              No pages data available
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                onClick={handleReload}
                className="bg-[#0071e3] hover:bg-[#0077ed] transition-all rounded-full px-6 h-11 text-white font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Pages Data
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="overflow-hidden border-none shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
        <div className="p-6 border-b border-[#f0f0f0]">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <motion.div
                animate={{
                  scale: isSearchFocused ? 1.02 : 1,
                  boxShadow: isSearchFocused ? "0 4px 12px rgba(0, 113, 227, 0.1)" : "0 0 0 rgba(0, 0, 0, 0)",
                }}
                transition={{ duration: 0.2 }}
                className="relative rounded-full overflow-hidden"
              >
                <Search
                  className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${isSearchFocused ? "text-[#0071e3]" : "text-gray-400"}`}
                />
                <Input
                  type="search"
                  placeholder="Search pages by URL, title, or description..."
                  className="pl-10 h-11 rounded-full border-[#e5e5e5] bg-[#f5f5f7] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </motion.div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-11 rounded-full border-[#e5e5e5] bg-[#f5f5f7] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-[#0071e3]" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#e5e5e5] shadow-lg">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="200">200 OK</SelectItem>
                  <SelectItem value="3xx">3xx Redirect</SelectItem>
                  <SelectItem value="4xx">4xx Error</SelectItem>
                  <SelectItem value="5xx">5xx Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
                <SelectTrigger className="w-[80px] h-11 rounded-full border-[#e5e5e5] bg-[#f5f5f7] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#e5e5e5] shadow-lg">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                <Button
                  variant="outline"
                  onClick={handleReload}
                  className="h-11 rounded-full border-[#e5e5e5] bg-[#f5f5f7] hover:bg-[#e5e5e5] hover:text-[#0071e3] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </motion.div>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPages.length)} of {filteredPages.length} pages
            (filtered from {siteAuditPages.length} total)
          </p>
        </div>

        <div className="relative">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#f0f0f0] bg-[#f9f9f9]">
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead
                    className="cursor-pointer w-[300px] font-medium text-gray-700"
                    onClick={() => handleSort("url")}
                  >
                    <div className="flex items-center">
                      URL
                      {sortField === "url" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-[#0071e3]" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-[#0071e3]" />
                          )}
                        </motion.div>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer w-[100px] font-medium text-gray-700"
                    onClick={() => handleSort("status_code")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "status_code" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-[#0071e3]" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-[#0071e3]" />
                          )}
                        </motion.div>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer w-[100px] font-medium text-gray-700"
                    onClick={() => handleSort("onpage_score")}
                  >
                    <div className="flex items-center justify-end">
                      Score
                      {sortField === "onpage_score" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4 text-[#0071e3]" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4 text-[#0071e3]" />
                          )}
                        </motion.div>
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {currentPageData.length > 0 ? (
                    currentPageData.map((page, index) => (
                      <React.Fragment key={`fragment-${index}`}>
                        <motion.tr
                          key={`row-${index}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="group border-b border-[#f0f0f0] hover:bg-[#f9f9fb] transition-colors"
                        >
                          <TableCell className="w-[40px] p-0 pl-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                              className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0071e3] hover:bg-[#e3f1ff] transition-colors"
                              onClick={(e) => toggleRowExpansion(index, e)}
                            >
                              {expandedRows[index] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </motion.button>
                          </TableCell>
                          <TableCell className="font-medium max-w-[300px] w-[300px] py-4">
                            <div className="flex items-center space-x-2 overflow-hidden">
                              <span className="truncate text-gray-700">{page.url}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a
                                      href={page.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#0071e3] hover:text-[#0077ed] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>Open in new tab</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px] py-4">
                            <div
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(page.status_code)}`}
                            >
                              {page.status_code}
                            </div>
                          </TableCell>
                          <TableCell className="text-right w-[100px] py-4">
                            <div
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-auto ${getScoreBadgeColor(page.onpage_score)}`}
                            >
                              {page.onpage_score ? page.onpage_score.toFixed(1) : "N/A"}
                            </div>
                          </TableCell>
                        </motion.tr>

                        <AnimatePresence>
                          {expandedRows[index] && (
                            <motion.tr
                              key={`expanded-${index}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-[#f9f9fb]"
                            >
                              <TableCell colSpan={4} className="p-0">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3, delay: 0.1 }}
                                  className="p-6"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f0f0f0]">
                                      <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                                        <Sparkles className="h-4 w-4 text-[#0071e3] mr-2" />
                                        Page Details
                                      </h4>
                                      <div className="space-y-4">
                                        <div className="bg-[#f9f9fb] rounded-lg p-3">
                                          <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-medium text-gray-700">Title</span>
                                            <span
                                              className={`text-xs px-2 py-0.5 rounded-full ${
                                                !page.meta?.title
                                                  ? "bg-red-50 text-red-600"
                                                  : (page.meta.title.length < 30 || page.meta.title.length > 60)
                                                    ? "bg-amber-50 text-amber-600"
                                                    : "bg-[#e3f1ff] text-[#0071e3]"
                                              }`}
                                            >
                                              {page.meta?.title ? `${page.meta.title.length} chars` : "Missing"}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 break-words">
                                            {page.meta?.title || "No title found"}
                                          </p>
                                        </div>

                                        <div className="bg-[#f9f9fb] rounded-lg p-3">
                                          <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-medium text-gray-700">Description</span>
                                            <span
                                              className={`text-xs px-2 py-0.5 rounded-full ${
                                                !page.meta?.description
                                                  ? "bg-red-50 text-red-600"
                                                  : (
                                                        page.meta.description.length < 120 ||
                                                          page.meta.description.length > 160
                                                      )
                                                    ? "bg-amber-50 text-amber-600"
                                                    : "bg-[#e3f1ff] text-[#0071e3]"
                                              }`}
                                            >
                                              {page.meta?.description
                                                ? `${page.meta.description.length} chars`
                                                : "Missing"}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 break-words">
                                            {page.meta?.description || "No description found"}
                                          </p>
                                        </div>

                                        {page.checks?.canonical?.value && (
                                          <div className="bg-[#f9f9fb] rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-1">
                                              <span className="text-sm font-medium text-gray-700">Canonical URL</span>
                                              <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                  page.checks.canonical.status === "warning"
                                                    ? "bg-amber-50 text-amber-600"
                                                    : "bg-[#e3f1ff] text-[#0071e3]"
                                                }`}
                                              >
                                                {page.checks.canonical.status === "warning" ? "Warning" : "OK"}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-600 break-words">
                                              {page.checks.canonical.value}
                                            </p>
                                          </div>
                                        )}

                                        {page.checks?.meta_robots?.value && (
                                          <div className="bg-[#f9f9fb] rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-1">
                                              <span className="text-sm font-medium text-gray-700">Meta Robots</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{page.checks.meta_robots.value}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f0f0f0]">
                                      <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                                        <CheckCircle2 className="h-4 w-4 text-[#0071e3] mr-2" />
                                        Content Metrics
                                      </h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#f9f9fb] rounded-lg p-3">
                                          <span className="text-sm font-medium text-gray-700 block mb-1">
                                            Word Count
                                          </span>
                                          <p className="text-2xl font-semibold text-gray-800">
                                            {page.meta?.content?.plain_text_word_count?.toLocaleString() || "N/A"}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {page.meta?.content?.plain_text_word_count &&
                                            page.meta.content.plain_text_word_count < 300
                                              ? "Consider adding more content"
                                              : ""}
                                          </p>
                                        </div>

                                        <div className="bg-[#f9f9fb] rounded-lg p-3">
                                          <span className="text-sm font-medium text-gray-700 block mb-1">H1 Tags</span>
                                          <p className="text-2xl font-semibold text-gray-800">
                                            {page.meta?.h1?.length || 0}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {!page.meta?.h1 || page.meta.h1.length === 0
                                              ? "Missing H1 tag"
                                              : page.meta.h1.length > 1
                                                ? "Multiple H1 tags found"
                                                : ""}
                                          </p>
                                        </div>

                                        <div className="bg-[#f9f9fb] rounded-lg p-3">
                                          <span className="text-sm font-medium text-gray-700 block mb-1">
                                            Internal Links
                                          </span>
                                          <p className="text-2xl font-semibold text-gray-800">
                                            {page.internal_links_count || 0}
                                          </p>
                                        </div>

                                        <div className="bg-[#f9f9fb] rounded-lg p-3">
                                          <span className="text-sm font-medium text-gray-700 block mb-1">
                                            External Links
                                          </span>
                                          <p className="text-2xl font-semibold text-gray-800">
                                            {page.external_links_count || 0}
                                          </p>
                                        </div>

                                        {page.page_timing?.time_to_interactive && (
                                          <div className="bg-[#f9f9fb] rounded-lg p-3 col-span-2">
                                            <span className="text-sm font-medium text-gray-700 block mb-1">
                                              Page Speed
                                            </span>
                                            <div className="flex items-center space-x-2">
                                              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                  className={`h-full ${
                                                    page.page_timing.time_to_interactive < 2000
                                                      ? "bg-green-500"
                                                      : page.page_timing.time_to_interactive < 4000
                                                        ? "bg-amber-500"
                                                        : "bg-red-500"
                                                  }`}
                                                  style={{
                                                    width: `${Math.min(100, (page.page_timing.time_to_interactive / 5000) * 100)}%`,
                                                  }}
                                                />
                                              </div>
                                              <span className="text-sm font-medium">
                                                {(page.page_timing.time_to_interactive / 1000).toFixed(1)}s
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        {page.checks?.is_redirect && (
                                          <div className="col-span-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                                            <div className="flex items-center">
                                              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                                              <span className="text-sm font-medium text-amber-700">
                                                This page is a redirect
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        {page.checks?.is_broken && (
                                          <div className="col-span-2 bg-red-50 rounded-lg p-3 border border-red-100">
                                            <div className="flex items-center">
                                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                              <span className="text-sm font-medium text-red-700">
                                                This page is broken
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </TableCell>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500 text-lg">No pages match your search criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-[#f0f0f0]">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={`rounded-full transition-colors ${currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-[#f5f5f7]"}`}
                  />
                </PaginationItem>

                {startPage > 1 && (
                  <>
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(1)} className="rounded-full hover:bg-[#f5f5f7]">
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {startPage > 2 && <PaginationEllipsis />}
                  </>
                )}

                {paginationItems}

                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && <PaginationEllipsis />}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        className="rounded-full hover:bg-[#f5f5f7]"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={`rounded-full transition-colors ${currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-[#f5f5f7]"}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export default SiteAuditPages

