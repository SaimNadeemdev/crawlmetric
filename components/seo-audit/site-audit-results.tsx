"use client"

import { useEffect, useState } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDateWithPattern } from "@/lib/utils"
import { Loader2, BarChart3, Link2, Copy, AlertTriangle, CheckCircle, Search, ArrowUpRight, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Components for each tab
import { SiteAuditPages } from "./site-audit-pages"
import { SiteAuditDuplicates } from "./site-audit-duplicates"
import { SiteAuditLinks } from "./site-audit-links"
import { SiteAuditNonIndexable } from "./site-audit-non-indexable"
import { SiteAuditDuplicateTags } from "./site-audit-duplicate-tags"
import { SiteAuditDuplicateContent } from "./site-audit-duplicate-content"
import { ErrorsTab } from "./errors-tab"
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
        <motion.span
          key={index}
          variants={child}
          className="text-3xl font-bold tracking-tight text-gray-900"
        >
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
  delay = 0
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
        delay: delay * 0.1
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg relative group">
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out rounded-[22px] pointer-events-none" />
        <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out rounded-[22px] pointer-events-none`} />
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
                    stiffness: 200
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
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.2 }
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
    siteAuditDuplicateContent,
    siteAuditErrors,
    siteAuditResources,
    loadSiteAuditSummary,
    loadSiteAuditPages,
    loadSiteAuditDuplicateTags,
    loadSiteAuditLinks,
    loadSiteAuditNonIndexable,
    loadSiteAuditDuplicateContent,
    loadSiteAuditErrors,
    loadSiteAuditResources,
  } = useSeoAudit()
  const [activeTab, setActiveTab] = useState("overview")

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
      case "duplicate-content":
        loadSiteAuditDuplicateContent(activeSiteAuditTask)
        break
      case "links":
        loadSiteAuditLinks(activeSiteAuditTask)
        break
      case "non-indexable":
        loadSiteAuditNonIndexable(activeSiteAuditTask)
        break
      case "errors":
        loadSiteAuditErrors(activeSiteAuditTask)
        break
      case "resources":
        loadSiteAuditResources(activeSiteAuditTask)
        break
    }
  }, [activeTab, activeSiteAuditTask, loadSiteAuditPages, loadSiteAuditDuplicateTags, loadSiteAuditLinks, loadSiteAuditNonIndexable, loadSiteAuditDuplicateContent, loadSiteAuditResources])

  // Add a useEffect to log data when it changes
  useEffect(() => {
    if (activeSiteAuditTask) {
      console.log("Active task ID:", activeSiteAuditTask);
      console.log("Site audit summary:", siteAuditSummary);
      console.log("Site audit pages:", siteAuditPages);
      console.log("Site audit duplicate tags:", siteAuditDuplicateTags);
      console.log("Site audit duplicate content:", siteAuditDuplicateContent);
      console.log("Site audit links:", siteAuditLinks);
      console.log("Site audit non-indexable:", siteAuditNonIndexable);
      console.log("Site audit errors:", siteAuditErrors);
      console.log("Site audit resources:", siteAuditResources);
    }
  }, [activeSiteAuditTask, siteAuditSummary, siteAuditPages, siteAuditDuplicateTags, siteAuditLinks, siteAuditNonIndexable, siteAuditDuplicateContent, siteAuditErrors, siteAuditResources]);

  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value)
    setActiveTab(value)
    
    if (!activeSiteAuditTask) {
      console.log("No active task, cannot load data")
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
      case "duplicate-content":
        loadSiteAuditDuplicateContent(activeSiteAuditTask)
        break
      case "links":
        loadSiteAuditLinks(activeSiteAuditTask)
        break
      case "non-indexable":
        loadSiteAuditNonIndexable(activeSiteAuditTask)
        break
      case "errors":
        loadSiteAuditErrors(activeSiteAuditTask)
        break
      case "resources":
        loadSiteAuditResources(activeSiteAuditTask)
        break
      default:
        // For overview tab, no need to load additional data
        break
    }
  }

  const domainName = siteAuditSummary?.domain_info?.name || "Unknown Domain";
  const seoScore = siteAuditSummary?.page_metrics?.onpage_score !== undefined 
    ? siteAuditSummary.page_metrics.onpage_score.toFixed(1) 
    : "0.0";
  const getSeoScoreStatus = () => {
    const score = parseFloat(seoScore)
    if (score >= 80) return "success"
    if (score >= 60) return "warning"
    return "error"
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
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
                  <p className="text-xs text-gray-400">
                    Last updated: {siteAuditSummary?.time}
                  </p>
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
              <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                parseFloat(seoScore) >= 80 
                  ? "bg-green-50 text-green-600" 
                  : parseFloat(seoScore) >= 60
                  ? "bg-amber-50 text-amber-600"
                  : "bg-red-50 text-red-600"
              }`}>
                <BarChart3 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">SEO Score</p>
                <p className={`text-2xl font-bold ${
                  parseFloat(seoScore) >= 80 
                    ? "text-green-600" 
                    : parseFloat(seoScore) >= 60
                    ? "text-amber-600"
                    : "text-red-600"
                }`}>{seoScore}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Pages Crawled"
          value={siteAuditSummary?.pages_crawled || 0}
          subtitle={`of ${siteAuditSummary?.pages_count || 0} total pages`}
          icon={<Search className="h-5 w-5" />}
          status="info"
          delay={0}
        />
        <MetricCard
          title="Total Links"
          value={siteAuditSummary?.page_metrics?.links_internal + siteAuditSummary?.page_metrics?.links_external || 0}
          subtitle={`${siteAuditSummary?.page_metrics?.links_internal || 0} internal, ${siteAuditSummary?.page_metrics?.links_external || 0} external`}
          icon={<Link2 className="h-5 w-5" />}
          status="info"
          delay={1}
        />
        <MetricCard
          title="Issues Detected"
          value={
            siteAuditSummary?.page_metrics?.broken_resources +
            siteAuditSummary?.page_metrics?.broken_links +
            siteAuditSummary?.page_metrics?.duplicate_title +
            siteAuditSummary?.page_metrics?.duplicate_description +
            siteAuditSummary?.page_metrics?.duplicate_content +
            siteAuditSummary?.page_metrics?.non_indexable || 0
          }
          subtitle="total issues found"
          icon={<AlertTriangle className="h-5 w-5" />}
          status={
            (siteAuditSummary?.page_metrics?.broken_resources +
            siteAuditSummary?.page_metrics?.broken_links +
            siteAuditSummary?.page_metrics?.duplicate_title +
            siteAuditSummary?.page_metrics?.duplicate_description +
            siteAuditSummary?.page_metrics?.duplicate_content +
            siteAuditSummary?.page_metrics?.non_indexable || 0) > 20
              ? "error"
              : (siteAuditSummary?.page_metrics?.broken_resources +
                siteAuditSummary?.page_metrics?.broken_links +
                siteAuditSummary?.page_metrics?.duplicate_title +
                siteAuditSummary?.page_metrics?.duplicate_description +
                siteAuditSummary?.page_metrics?.duplicate_content +
                siteAuditSummary?.page_metrics?.non_indexable || 0) > 10
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30 rounded-3xl blur-xl opacity-50 h-full" />
        <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-sm">
          <Tabs defaultValue="overview" className="w-full" onValueChange={handleTabChange}>
            <div className="relative flex justify-center mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-full blur-xl opacity-50 h-12" />
              <TabsList className="grid grid-cols-7 md:grid-cols-7 lg:grid-cols-7 h-auto p-1 bg-gray-100/50 backdrop-blur-xl">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs md:text-sm"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="pages"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs md:text-sm"
                >
                  Pages
                </TabsTrigger>
                <TabsTrigger
                  value="duplicates"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs md:text-sm"
                >
                  Duplicate Tags
                </TabsTrigger>
                <TabsTrigger
                  value="links"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs md:text-sm"
                >
                  Links
                </TabsTrigger>
                <TabsTrigger
                  value="non-indexable"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs md:text-sm"
                >
                  Non-Indexable
                </TabsTrigger>
                <TabsTrigger
                  value="duplicate-content"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs md:text-sm"
                >
                  Duplicate Content
                </TabsTrigger>
                <TabsTrigger
                  value="errors"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs md:text-sm"
                >
                  Errors
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 text-xs md:text-sm"
                >
                  Resources
                </TabsTrigger>
              </TabsList>
            </div>

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
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.broken_resources || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Broken Links</p>
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.broken_links || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Duplicate Titles</p>
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.duplicate_title || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Duplicate Descriptions</p>
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.duplicate_description || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Duplicate Content</p>
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.duplicate_content || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Non-Indexable Pages</p>
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.non_indexable || 0}
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
                        <CardDescription className="text-gray-500">
                          Key performance indicators
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 pt-2">
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">HTTPS Pages</p>
                            <Badge variant="outline" className="bg-blue-50 text-[#0071e3] border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.https_pages || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Internal Links</p>
                            <Badge variant="outline" className="bg-blue-50 text-[#0071e3] border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.links_internal || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">External Links</p>
                            <Badge variant="outline" className="bg-blue-50 text-[#0071e3] border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.links_external || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Indexable Pages</p>
                            <Badge variant="outline" className="bg-blue-50 text-[#0071e3] border-0 rounded-full px-2.5 py-0.5">
                              {(siteAuditSummary?.pages_count || 0) - (siteAuditSummary?.page_metrics?.non_indexable || 0)}
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
                        <CardDescription className="text-gray-500">
                          Content quality indicators
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 pt-2">
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with Title</p>
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.with_title || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with Meta Description</p>
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.with_meta_description || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with H1</p>
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.with_h1 || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with Images</p>
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.with_images || 0}
                            </Badge>
                          </motion.div>
                          <motion.div 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm font-medium text-gray-700">Pages with Structured Data</p>
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-0 rounded-full px-2.5 py-0.5">
                              {siteAuditSummary?.page_metrics?.with_structured_data || 0}
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
                          <p className="text-sm font-medium text-gray-900">{siteAuditSummary?.domain_info?.name || "Unknown Domain"}</p>
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
                            {siteAuditSummary?.crawl_progress === "finished" ? "Completed" : "In Progress"}
                          </p>
                        </motion.div>
                        <motion.div 
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 250, 251, 1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-gray-500 mb-1">Pages Crawled</p>
                          <p className="text-sm font-medium text-gray-900">
                            {(siteAuditSummary?.pages_crawled || 0)} of {(siteAuditSummary?.pages_count || 0)}
                          </p>
                        </motion.div>
                        <motion.div 
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(249, 250, 251, 1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-xs text-gray-500 mb-1">Crawl Depth</p>
                          <p className="text-sm font-medium text-gray-900">
                            {siteAuditSummary?.crawl_depth || "N/A"}
                          </p>
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
                <SiteAuditPages />
              </TabsContent>

              <TabsContent value="duplicates" className="mt-6">
                <SiteAuditDuplicateTags />
              </TabsContent>

              <TabsContent value="duplicate-content" className="mt-6">
                <SiteAuditDuplicateContent />
              </TabsContent>

              <TabsContent value="links" className="mt-6">
                <SiteAuditLinks />
              </TabsContent>

              <TabsContent value="non-indexable" className="mt-6">
                <SiteAuditNonIndexable />
              </TabsContent>

              <TabsContent value="errors" className="mt-6">
                <ErrorsTab errors={siteAuditErrors || []} loading={siteAuditLoading} />
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <ResourcesTab 
                  resources={siteAuditResources || []} 
                  loading={siteAuditLoading} 
                  onFilterChange={(filters) => {
                    if (activeSiteAuditTask) {
                      const options = {
                        resourceType: filters.resourceType,
                        minSize: filters.minSize,
                        orderBy: filters.orderBy
                      };
                      loadSiteAuditResources(activeSiteAuditTask, options);
                    }
                  }}
                />
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  )
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Unknown date";
  
  return formatDateWithPattern(dateString, "MMM d, yyyy h:mm a");
}
