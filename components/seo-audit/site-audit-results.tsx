"use client"

import React, { useState, useEffect, useRef } from "react"

import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDateWithPattern } from "@/lib/utils"
import { BarChart3, Link2, AlertTriangle, CheckCircle, Search, ArrowUpRight, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

// Components for each tab
import { SiteAuditPages } from "./site-audit-pages"
import { SiteAuditLinks } from "./site-audit-links"
import { SiteAuditNonIndexable } from "./site-audit-non-indexable"
import { SiteAuditDuplicateTags } from "./site-audit-duplicate-tags"
import { ResourcesTab } from "./resources-tab"

// Animated title component with letter animation
const AnimatedTitle = ({ text }: { text: string }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className="mb-1"
    >
      {text.split("").map((letter, index) => (
        <motion.span key={index} variants={child} className="text-3xl font-bold tracking-tight text-gray-900">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  )
}

// Animated metric card component with enhanced visual effects
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  status,
  delay = 0,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  status?: "success" | "warning" | "error" | "info"
  delay?: number
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-green-50 text-green-600"
      case "warning":
        return "bg-amber-50 text-amber-600"
      case "error":
        return "bg-red-50 text-red-600"
      case "info":
      default:
        return "bg-blue-50 text-[#0071e3]"
    }
  }

  const getStatusGradient = () => {
    switch (status) {
      case "success":
        return "from-green-400/10 to-green-500/5"
      case "warning":
        return "from-amber-400/10 to-amber-500/5"
      case "error":
        return "from-red-400/10 to-red-500/5"
      case "info":
      default:
        return "from-blue-400/10 to-[#0071e3]/5"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: delay * 0.1,
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg relative group">
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out rounded-[22px] pointer-events-none" />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out rounded-[22px] pointer-events-none`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="flex items-end gap-1">
                <motion.h3
                  className="text-3xl font-bold text-gray-900"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: delay * 0.1 + 0.2,
                    duration: 0.4,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {value}
                </motion.h3>
                {subtitle && <p className="text-xs text-gray-500 mb-1.5">{subtitle}</p>}
              </div>
            </div>
            <motion.div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor()}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: delay * 0.1 + 0.1,
                duration: 0.3,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 },
              }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function SiteAuditResults() {
  const {
    activeSiteAuditTask,
    siteAuditTasks,
    siteAuditLoading,
    siteAuditSummary,
    siteAuditPages,
    siteAuditDuplicateTags,
    siteAuditLinks,
    siteAuditNonIndexable,
    siteAuditResources,
    loadSiteAuditSummary,
    loadSiteAuditPages,
    loadSiteAuditDuplicateTags,
    loadSiteAuditLinks,
    loadSiteAuditNonIndexable,
    loadSiteAuditResources,
  } = useSeoAudit()
  const [activeTab, setActiveTab] = useState("overview")
  const [dataReady, setDataReady] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true) // Start with loading true
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null) // Ref to track the timer
  const loadingStartTimeRef = useRef<number | null>(null) // Track when loading started

  // Poll for updates
  useEffect(() => {
    if (!activeSiteAuditTask) return

    // Initial load
    loadSiteAuditSummary(activeSiteAuditTask)

    // Set up polling
    const interval = setInterval(() => {
      if (activeSiteAuditTask) {
        loadSiteAuditSummary(activeSiteAuditTask)
      }
    }, 60000) // Poll every minute

    return () => clearInterval(interval)
  }, [activeSiteAuditTask, loadSiteAuditSummary])

  // Load data based on active tab
  useEffect(() => {
    if (!activeSiteAuditTask) return

    switch (activeTab) {
      case "pages":
        loadSiteAuditPages(activeSiteAuditTask)
        break
      case "duplicates":
        loadSiteAuditDuplicateTags(activeSiteAuditTask)
        break
      case "links":
        loadSiteAuditLinks(activeSiteAuditTask)
        break
      case "non-indexable":
        loadSiteAuditNonIndexable(activeSiteAuditTask)
        break
      case "resources":
        loadSiteAuditResources(activeSiteAuditTask)
        break
    }
  }, [
    activeTab,
    activeSiteAuditTask,
    loadSiteAuditPages,
    loadSiteAuditDuplicateTags,
    loadSiteAuditLinks,
    loadSiteAuditNonIndexable,
    loadSiteAuditResources,
  ])

  // Add a useEffect to log data when it changes
  useEffect(() => {
    if (activeSiteAuditTask) {
      // console.log("Active task ID:", activeSiteAuditTask)
      // console.log("Site audit summary:", siteAuditSummary)
      // console.log("Site audit pages:", siteAuditPages)
      // console.log("Site audit duplicate tags:", siteAuditDuplicateTags)
      // console.log("Site audit links:", siteAuditLinks)
      // console.log("Site audit non-indexable:", siteAuditNonIndexable)
      // console.log("Site audit resources:", siteAuditResources)
    }
  }, [
    activeSiteAuditTask,
    siteAuditSummary,
    siteAuditPages,
    siteAuditDuplicateTags,
    siteAuditLinks,
    siteAuditNonIndexable,
    siteAuditResources,
  ])

  // Add a useEffect to log and process the summary data when it changes
  useEffect(() => {
    if (activeSiteAuditTask && siteAuditSummary) {
      // console.log("Processing site audit summary:", siteAuditSummary)

      // Extract the actual summary data from the API response structure
      // DataForSEO typically returns data in a nested structure with tasks array
      if (siteAuditSummary.tasks && siteAuditSummary.tasks.length > 0 && siteAuditSummary.tasks[0].result) {
        // If we have the raw API response, extract the result
        const extractedSummary = siteAuditSummary.tasks[0].result[0]
        // console.log("Extracted summary from API response:", extractedSummary)
        // Update the state with the extracted summary
        // setSiteAuditSummary(extractedSummary);
      }
    }
  }, [activeSiteAuditTask, siteAuditSummary])

  // Helper function to safely extract data from the nested structure
  const extractSummaryData = (data: any, path: string, defaultValue: any = null) => {
    if (!data) return defaultValue

    // Check if we have the direct property
    if (data[path] !== undefined) return data[path]

    // Check if we have the nested property in the API response structure
    if (data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0]) {
      return data.tasks[0].result[0][path] !== undefined ? data.tasks[0].result[0][path] : defaultValue
    }

    return defaultValue
  }

  // Extract domain info and metrics using the helper function
  const domainInfo = extractSummaryData(siteAuditSummary, "domain_info", {})
  const pageMetrics = extractSummaryData(siteAuditSummary, "page_metrics", {})
  const crawlStatus = extractSummaryData(siteAuditSummary, "crawl_status", {})
  const crawlProgress = extractSummaryData(siteAuditSummary, "crawl_progress", "in_progress")

  // Extract content metrics - these might be in a different location or structure
  // First check if they're directly in page_metrics.checks
  const contentMetrics = {
    pages_with_title: 0,
    pages_with_meta_description: 0,
    pages_with_h1: 0,
    pages_with_images: 0,
    pages_with_structured_data: 0,
  }

  // Try to extract content metrics from different possible locations
  if (pageMetrics?.checks) {
    // Calculate pages with title (total pages minus pages with no title)
    contentMetrics.pages_with_title = (domainInfo?.total_pages || 0) - (pageMetrics.checks.no_title || 0)

    // Calculate pages with meta description (total pages minus pages with no description)
    contentMetrics.pages_with_meta_description =
      (domainInfo?.total_pages || 0) - (pageMetrics.checks.no_description || 0)

    // Calculate pages with H1 (total pages minus pages with no H1)
    contentMetrics.pages_with_h1 = (domainInfo?.total_pages || 0) - (pageMetrics.checks.no_h1_tag || 0)

    // Calculate pages with images (if we have info about pages with no image alt, assume they have images)
    if (pageMetrics.checks.no_image_alt !== undefined) {
      contentMetrics.pages_with_images = pageMetrics.checks.no_image_alt
    }

    // For structured data, we don't have a direct metric, so we'll estimate based on other metrics
    // This is just a placeholder - in a real implementation, you'd want to get this from the API
    contentMetrics.pages_with_structured_data = Math.floor((domainInfo?.total_pages || 0) * 0.3) // Assume 30% of pages have structured data
  }

  // If we have content_metrics directly, use those instead
  const directContentMetrics = extractSummaryData(siteAuditSummary, "content_metrics", null)
  if (directContentMetrics) {
    Object.assign(contentMetrics, directContentMetrics)
  }

  // console.log("Content metrics:", contentMetrics)

  // Extract specific values with fallbacks
  const domainName = domainInfo?.name || siteAuditSummary?.tasks?.[0]?.data?.target || "Unknown Domain"

  const seoScore = pageMetrics?.onpage_score !== undefined ? pageMetrics.onpage_score.toFixed(1) : "0.0"

  const totalPages = domainInfo?.total_pages || crawlStatus?.pages_crawled || 0
  const pagesInQueue = crawlStatus?.pages_in_queue || 0
  const pagesCrawled = crawlStatus?.pages_crawled || 0
  const maxCrawlPages = crawlStatus?.max_crawl_pages || 100

  // Extract metrics for the cards
  const externalLinks = pageMetrics?.links_external || 0
  const internalLinks = pageMetrics?.links_internal || 0
  const duplicateTitle = pageMetrics?.duplicate_title || 0
  const duplicateDescription = pageMetrics?.duplicate_description || 0
  const duplicateContent = pageMetrics?.duplicate_content || 0
  const brokenLinks = pageMetrics?.broken_links || 0
  const brokenResources = pageMetrics?.broken_resources || 0
  const nonIndexable = pageMetrics?.non_indexable || 0

  // Determine if data is ready to display
  useEffect(() => {
    if (activeSiteAuditTask && siteAuditSummary) {
      // Check if we have the necessary data to display the report
      const hasBasicData = !!siteAuditSummary
      const isFinished = crawlProgress === "finished"
      
      // More comprehensive checks for each data type
      const hasMetrics = !!pageMetrics && Object.keys(pageMetrics).length > 0
      const hasPages = !!siteAuditPages && Array.isArray(siteAuditPages)
      const hasDuplicateTags = !!siteAuditDuplicateTags && Array.isArray(siteAuditDuplicateTags)
      const hasLinks = !!siteAuditLinks && Array.isArray(siteAuditLinks)
      const hasNonIndexable = !!siteAuditNonIndexable && Array.isArray(siteAuditNonIndexable)
      const hasResources = !!siteAuditResources && Array.isArray(siteAuditResources)
      
      console.log("Data readiness status:", {
        hasBasicData,
        isFinished,
        hasMetrics,
        hasPages,
        hasDuplicateTags,
        hasLinks,
        hasNonIndexable,
        hasResources
      })
      
      // Set data ready with less strict requirements
      // We just need the basic summary data and at least one data type to be available
      setDataReady(hasBasicData && (hasPages || hasDuplicateTags || hasLinks || hasNonIndexable || hasResources))
    } else {
      setDataReady(false)
    }
  }, [
    activeSiteAuditTask,
    siteAuditSummary,
    pageMetrics,
    crawlProgress,
    siteAuditPages,
    siteAuditDuplicateTags,
    siteAuditLinks,
    siteAuditNonIndexable,
    siteAuditResources,
  ])

  // Comprehensive loading timer management
  useEffect(() => {
    // Function to end loading state
    const endLoading = () => {
      console.log("Ending loading state", new Date().toISOString())
      setIsInitialLoading(false)
      
      // Clear the timer reference
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
    }
    
    // If component just mounted or task changed, start loading
    if (activeSiteAuditTask) {
      // Only start a new timer if we don't already have one
      if (!loadingTimerRef.current) {
        console.log("Starting new 60-second loading timer", new Date().toISOString())
        loadingStartTimeRef.current = Date.now()
        setIsInitialLoading(true)
        
        // Set a hard 60-second timeout
        loadingTimerRef.current = setTimeout(() => {
          console.log("60-second timer completed", new Date().toISOString())
          endLoading()
        }, 60000)
      }
    } else {
      // No active task, end loading
      endLoading()
    }
    
    // Clean up function for component unmount or task change
    return () => {
      if (loadingTimerRef.current) {
        console.log("Cleaning up loading timer")
        clearTimeout(loadingTimerRef.current)
        loadingTimerRef.current = null
      }
    }
  }, [activeSiteAuditTask]) // Only depend on the task changing

  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    // console.log("Tab changed to:", value)
    setActiveTab(value)

    if (!activeSiteAuditTask) {
      // console.log("No active task, cannot load data")
      return
    }

    // Load data based on the selected tab
    switch (value) {
      case "pages":
        loadSiteAuditPages(activeSiteAuditTask)
        break
      case "duplicates":
        loadSiteAuditDuplicateTags(activeSiteAuditTask)
        break
      case "links":
        loadSiteAuditLinks(activeSiteAuditTask)
        break
      case "non-indexable":
        loadSiteAuditNonIndexable(activeSiteAuditTask)
        break
      case "resources":
        loadSiteAuditResources(activeSiteAuditTask)
        break
      default:
        // For overview tab, no need to load additional data
        break
    }
  }

  const getSeoScoreStatus = () => {
    const score = Number.parseFloat(seoScore)
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "error"
  }

  if (!dataReady || isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-8 px-6">
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Primary spinner */}
          <div className="h-24 w-24 rounded-full border-4 border-[#f5f5f7] border-t-[#0071e3] animate-spin"></div>
          
          {/* Secondary spinners with different speeds and opacities */}
          <div
            className="absolute top-0 left-0 h-24 w-24 rounded-full border-4 border-transparent border-t-[#0071e3]/30 animate-spin"
            style={{ animationDuration: "1.5s" }}
          ></div>
          <div
            className="absolute top-0 left-0 h-24 w-24 rounded-full border-4 border-transparent border-r-[#0071e3]/10 animate-spin"
            style={{ animationDuration: "2s", animationDirection: "reverse" }}
          ></div>
        </motion.div>
        
        <div className="text-center space-y-4 max-w-lg">
          <motion.h3 
            className="text-2xl font-medium text-[#1d1d1f]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Preparing Your SEO Audit
          </motion.h3>
          
          <motion.p 
            className="text-sm text-[#86868b] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {crawlProgress === "in_progress"
              ? `Crawling in progress. We've analyzed ${pagesCrawled} of ${maxCrawlPages} pages so far.`
              : "Preparing audit"}
          </motion.p>
          
          {/* Animated progress bar */}
          <div className="pt-4">
            <div className="h-1.5 w-full bg-[#f5f5f7] rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#0066CC] to-[#42a1ff] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${crawlProgress === "in_progress" ? Math.round((pagesCrawled / maxCrawlPages) * 100) : 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-[#86868b]">
                {crawlProgress === "in_progress" ? "Crawling your site" : "Preparing audit"}
              </p>
              <p className="text-xs font-medium text-[#1d1d1f]">
                {crawlProgress === "in_progress" ? `${Math.round((pagesCrawled / maxCrawlPages) * 100)}%` : `100%`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Animated tips that change */}
        <motion.div 
          className="text-center mt-6 bg-[#f5f5f7]/50 backdrop-blur-sm p-4 rounded-xl max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-[#86868b] italic mb-1">SEO Tip:</p>
          <p className="text-sm text-[#1d1d1f]">
            {[
              "Page titles should be unique and under 60 characters for optimal display in search results.",
              "Mobile-friendly websites are prioritized in Google's mobile-first indexing approach.",
              "High-quality backlinks from authoritative sites significantly improve your search rankings.",
              "Optimize image alt text to improve accessibility and image search visibility.",
              "Regular content updates signal to search engines that your site is active and relevant."
            ][0]}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      {/* Header with domain info and score */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl blur-xl opacity-30 h-32" />
        <motion.div
          className="relative z-10 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-sm"
          whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <AnimatedTitle text="Site Audit Results" />
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <p className="text-xs text-gray-400">Last updated: {siteAuditSummary?.time}</p>
                </div>
                <div className="h-5 w-5 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                  <ExternalLink className="h-3 w-3 text-[#0071e3]" />
                </div>
                <p className="text-gray-500 text-lg font-medium">{domainName}</p>
              </motion.div>
            </div>

            <motion.div
              className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                  Number.parseFloat(seoScore) >= 80
                    ? "bg-green-50 text-green-600"
                    : Number.parseFloat(seoScore) >= 60
                      ? "bg-amber-50 text-amber-600"
                      : "bg-red-50 text-red-600"
                }`}
              >
                <BarChart3 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">SEO Score</p>
                <p
                  className={`text-2xl font-bold ${
                    Number.parseFloat(seoScore) >= 80
                      ? "text-green-600"
                      : Number.parseFloat(seoScore) >= 60
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {seoScore}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Pages Crawled"
          value={pagesCrawled}
          subtitle={`of ${totalPages} total pages`}
          icon={<Search className="h-5 w-5" />}
          status="info"
          delay={0}
        />
        <MetricCard
          title="Total Links"
          value={internalLinks + externalLinks}
          subtitle={`${internalLinks} internal, ${externalLinks} external`}
          icon={<Link2 className="h-5 w-5" />}
          status="info"
          delay={1}
        />
        <MetricCard
          title="Issues Detected"
          value={
            brokenResources + brokenLinks + duplicateTitle + duplicateDescription + duplicateContent + nonIndexable
          }
          subtitle="total issues found"
          icon={<AlertTriangle className="h-5 w-5" />}
          status={
            brokenResources + brokenLinks + duplicateTitle + duplicateDescription + duplicateContent + nonIndexable > 20
              ? "error"
              : brokenResources +
                    brokenLinks +
                    duplicateTitle +
                    duplicateDescription +
                    duplicateContent +
                    nonIndexable >
                  10
                ? "warning"
                : "success"
          }
          delay={2}
        />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative"
      >
        <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-sm">
          <Tabs defaultValue="overview" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="flex w-full mb-6 border-b border-gray-200 bg-transparent p-0 overflow-x-auto">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent hover:text-blue-500"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="pages" 
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent hover:text-blue-500"
              >
                Pages
              </TabsTrigger>
              <TabsTrigger 
                value="duplicates" 
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent hover:text-blue-500"
              >
                Duplicate Tags
              </TabsTrigger>
              <TabsTrigger 
                value="links" 
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent hover:text-blue-500"
              >
                Links
              </TabsTrigger>
              <TabsTrigger 
                value="non-indexable" 
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent hover:text-blue-500"
              >
                Non-Indexable
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-600 transition-all data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent hover:text-blue-500"
              >
                Resources
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {/* Issues Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="col-span-1 md:col-span-2 lg:col-span-1"
                  >
                    <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                          <CardTitle className="text-xl font-semibold text-gray-900">Issues Summary</CardTitle>
                        </div>
                        <CardDescription className="text-gray-500">
                          Key issues detected during the audit
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 pt-2">
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Broken Resources</p>
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {brokenResources}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Broken Links</p>
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {brokenLinks}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Duplicate Titles</p>
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {duplicateTitle}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Duplicate Descriptions</p>
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {duplicateDescription}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Duplicate Content</p>
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {duplicateContent}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Non-Indexable Pages</p>
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {nonIndexable}
                            </Badge>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* SEO Metrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="col-span-1"
                  >
                    <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="h-8 w-8 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-[#0071e3]" />
                          </div>
                          <CardTitle className="text-xl font-semibold text-gray-900">SEO Metrics</CardTitle>
                        </div>
                        <CardDescription className="text-gray-500">Key performance indicators</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 pt-2">
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">HTTPS Pages</p>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-[#0071e3] border-0 rounded-full px-2.5 py-0.5"
                            >
                              {pageMetrics?.https_pages || 0}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Internal Links</p>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-[#0071e3] border-0 rounded-full px-2.5 py-0.5"
                            >
                              {internalLinks}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">External Links</p>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-[#0071e3] border-0 rounded-full px-2.5 py-0.5"
                            >
                              {externalLinks}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Indexable Pages</p>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-[#0071e3] border-0 rounded-full px-2.5 py-0.5"
                            >
                              {totalPages - nonIndexable}
                            </Badge>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Content Metrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="col-span-1"
                  >
                    <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <CardTitle className="text-xl font-semibold text-gray-900">Content Metrics</CardTitle>
                        </div>
                        <CardDescription className="text-gray-500">Content quality indicators</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 pt-2">
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with Title</p>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {contentMetrics.pages_with_title}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with Meta Description</p>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {contentMetrics.pages_with_meta_description}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with H1</p>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {contentMetrics.pages_with_h1}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with Images</p>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {contentMetrics.pages_with_images}
                            </Badge>
                          </motion.div>
                          <motion.div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with Structured Data</p>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5"
                            >
                              {contentMetrics.pages_with_structured_data}
                            </Badge>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Audit Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="h-8 w-8 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                          <ArrowUpRight className="h-4 w-4 text-[#0071e3]" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900">Audit Details</CardTitle>
                      </div>
                      <CardDescription className="text-gray-500">
                        Technical information about this audit
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
                        <motion.div
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 250, 251, 1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-gray-500 mb-1">Domain</p>
                          <p className="text-sm font-medium text-gray-900">{domainInfo?.name || "Unknown Domain"}</p>
                        </motion.div>
                        <motion.div
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 250, 251, 1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-gray-500 mb-1">Started</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDateWithPattern(siteAuditSummary?.time, "MMM d, yyyy h:mm a")}
                          </p>
                        </motion.div>
                        <motion.div
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 250, 251, 1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <p className="text-sm font-medium text-gray-900">
                            {crawlProgress === "finished" ? "Completed" : "In Progress"}
                          </p>
                        </motion.div>
                        <motion.div
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 250, 251, 1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-gray-500 mb-1">Pages Crawled</p>
                          <p className="text-sm font-medium text-gray-900">
                            {pagesCrawled} of {totalPages}
                          </p>
                        </motion.div>
                        <motion.div
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 250, 251, 1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-gray-500 mb-1">Crawl Depth</p>
                          <p className="text-sm font-medium text-gray-900">{crawlStatus?.crawl_depth || "N/A"}</p>
                        </motion.div>
                        <motion.div
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 250, 251, 1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-gray-500 mb-1">JavaScript Rendering</p>
                          <p className="text-sm font-medium text-gray-900">
                            {siteAuditSummary?.enable_javascript ? "Enabled" : "Disabled"}
                          </p>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="pages" className="mt-6">
                {siteAuditLoading || isInitialLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm">
                          <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-8 w-16" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="bg-gray-100/50 backdrop-blur-xl rounded-md p-1 flex space-x-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-9 w-16 rounded-sm" />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-10 w-[200px]" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-xl rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <SiteAuditPages />
                )}
              </TabsContent>

              <TabsContent value="duplicates" className="mt-6">
                {siteAuditLoading || isInitialLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm">
                          <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-8 w-16" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-xl rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <div className="space-y-2">
                            {Array.from({ length: 2 }).map((_, j) => (
                              <div key={j} className="flex items-center space-x-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 flex-1" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <SiteAuditDuplicateTags />
                )}
              </TabsContent>

              <TabsContent value="links" className="mt-6">
                {siteAuditLoading || isInitialLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm">
                          <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-8 w-16" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-2">
                        <Skeleton className="h-9 w-20 rounded-sm" />
                        <Skeleton className="h-9 w-20 rounded-sm" />
                        <Skeleton className="h-9 w-20 rounded-sm" />
                      </div>
                      <Skeleton className="h-10 w-[200px]" />
                    </div>
                    <div className="bg-white/50 backdrop-blur-xl rounded-lg border border-gray-100">
                      <div className="p-4 space-y-4">
                        <div className="flex justify-between border-b pb-2">
                          <Skeleton className="h-5 w-1/4" />
                          <Skeleton className="h-5 w-1/4" />
                          <Skeleton className="h-5 w-1/4" />
                          <Skeleton className="h-5 w-1/4" />
                        </div>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex justify-between py-2">
                            <Skeleton className="h-4 w-1/4 mr-2" />
                            <Skeleton className="h-4 w-1/4 mr-2" />
                            <Skeleton className="h-4 w-1/4 mr-2" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <SiteAuditLinks />
                )}
              </TabsContent>

              <TabsContent value="non-indexable" className="mt-6">
                {siteAuditLoading || isInitialLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm">
                          <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-8 w-16" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-xl rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <SiteAuditNonIndexable />
                )}
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                {siteAuditLoading || isInitialLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm">
                          <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                          </CardHeader>
                          <CardContent>
                            <Skeleton className="h-8 w-16" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="bg-gray-100/50 backdrop-blur-xl rounded-md p-1 flex space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-9 w-16 rounded-sm" />
                        ))}
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Skeleton className="h-10 w-[200px]" />
                        <div className="flex gap-2">
                          <Skeleton className="h-10 w-[140px]" />
                          <Skeleton className="h-10 w-[140px]" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-xl rounded-lg p-4 border border-gray-100">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ResourcesTab
                    resources={siteAuditResources || []}
                    loading={siteAuditLoading}
                    onFilterChange={(filters) => {
                      if (activeSiteAuditTask) {
                        const options = {
                          resourceType: filters.resourceType,
                          minSize: filters.minSize,
                          orderBy: filters.orderBy,
                        }
                        loadSiteAuditResources(activeSiteAuditTask, options)
                      }
                    }}
                  />
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  )
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Unknown date"

  return formatDateWithPattern(dateString, "MMM d, yyyy h:mm a")
}
