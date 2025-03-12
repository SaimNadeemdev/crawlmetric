"use client"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  ArrowRight, 
  ArrowUpRight,
  BarChart3,
  CheckCircle, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  FileText, 
  Heading as HeadingIcon, 
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListChecks,
  Loader2,
  Search, 
  Server, 
  Share2, 
  Tag, 
  Type,
  XCircle,
  Zap,
  AlignLeft
} from "lucide-react"
import { motion as m, AnimatePresence } from "framer-motion"

// Define motion components to fix the JSX error
const motion = {
  div: m.div,
  span: m.span
}

import { format } from "date-fns"

// Animated title component for section headers
const AnimatedTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.03
          }
        }
      }}
      className="inline-block"
    >
      {String(children).split("").map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export function InstantAuditResults() {
  const { instantAuditResults, instantAuditLoading, clearInstantAuditResults, instantAuditError } = useSeoAudit()

  if (instantAuditLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6"
      >
        <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center h-[400px]">
            <div className="relative">
              <motion.div 
                className="h-16 w-16 rounded-full bg-[#0071e3]/10 flex items-center justify-center mb-6"
                animate={{ 
                  boxShadow: [
                    "0 0 0 0px rgba(0,113,227,0.2)",
                    "0 0 0 10px rgba(0,113,227,0.0)"
                  ],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <Loader2 className="h-8 w-8 text-[#0071e3] animate-spin" />
              </motion.div>
            </div>
            <AnimatedTitle>Analyzing page...</AnimatedTitle>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            
            <motion.div 
              className="w-64 h-1 bg-gray-100 rounded-full mt-8 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"
                animate={{ 
                  width: ["0%", "100%"],
                  x: ["-100%", "0%"]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear"
                }}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (instantAuditError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6"
      >
        <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center h-[400px]">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Analyzing Page</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{instantAuditError}</p>
            <Button 
              onClick={clearInstantAuditResults}
              className="bg-[#0071e3] hover:bg-[#0077ED] text-white border-0 rounded-xl h-11 px-6 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <motion.div
                className="flex items-center justify-center"
                whileTap={{ scale: 0.97 }}
              >
                Try Again
              </motion.div>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (!instantAuditResults) {
    return null
  }

  // Log the full response structure to help with debugging
  console.log("Full audit results:", JSON.stringify(instantAuditResults).substring(0, 1000) + "...")

  // Get the task from the response
  const task = instantAuditResults.tasks?.[0]
  if (!task?.result?.[0]) {
    console.error("Invalid audit results structure - missing task or result:", instantAuditResults)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6"
      >
        <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center h-[400px]">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid Results</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">The audit results are not in the expected format.</p>
            <Button 
              onClick={clearInstantAuditResults}
              className="bg-[#0071e3] hover:bg-[#0077ED] text-white border-0 rounded-xl h-11 px-6 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <motion.div
                className="flex items-center justify-center"
                whileTap={{ scale: 0.97 }}
              >
                Try Again
              </motion.div>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Extract the page data from the items array
  const resultData = task.result[0]
  
  // Ensure we're properly accessing the page data
  // The API response structure might have changed or be truncated
  const pageData = resultData?.items?.[0]
  
  // More robust logging to help with debugging
  console.log("Task result structure:", Object.keys(resultData || {}))
  console.log("Items array length:", resultData?.items?.length)
  console.log("First item keys:", pageData ? Object.keys(pageData) : "No page data")
  
  // Safely access nested properties with optional chaining
  const meta = pageData?.meta || {}
  const checks = pageData?.checks || {}
  const page_metrics = pageData?.page_metrics || {}
  const page_timing = pageData?.page_timing || {}

  if (!pageData) {
    console.error("Invalid audit results structure - missing items data:", resultData)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6"
      >
        <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center h-[400px]">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Missing Page Data</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">The audit results do not contain page data.</p>
            <Button 
              onClick={clearInstantAuditResults}
              className="bg-[#0071e3] hover:bg-[#0077ED] text-white border-0 rounded-xl h-11 px-6 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <motion.div
                className="flex items-center justify-center"
                whileTap={{ scale: 0.97 }}
              >
                Try Again
              </motion.div>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Extract key metrics with proper fallbacks
  const score = pageData.onpage_score || 0
  const scoreColor = score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : "text-red-500"
  const scoreGradient = score >= 80 
    ? "from-green-400 to-green-600" 
    : score >= 60 
      ? "from-amber-400 to-amber-600" 
      : "from-red-400 to-red-600"

  const url = pageData.url || task.data?.url || "Unknown URL"

  // Extract meta information
  const metaInfo = {
    title: meta.title || "",
    description: meta.description || "",
    canonical: meta.canonical || "",
    robots: meta.follow !== undefined ? (meta.follow ? "follow" : "nofollow") : "",
    viewport: "",
    h1: meta.htags?.h1 || [],
    h2: meta.htags?.h2 || [],
    h3: meta.htags?.h3 || [],
    h4: meta.htags?.h4 || [],
    h5: meta.htags?.h5 || [],
    language: "",
    content_type: pageData.media_type || "text/html",
    generator: meta.generator || "",
    charset: meta.charset || "",
    internal_links_count: meta.internal_links_count || 0,
    external_links_count: meta.external_links_count || 0,
    images_count: meta.images_count || 0,
  }

  // Extract content metrics
  const contentMetrics = {
    wordCount: meta.content?.plain_text_word_count || 0,
    textRate: meta.content?.plain_text_rate || 0,
    readabilityScore: meta.content?.automated_readability_index || 0,
    textSize: meta.content?.plain_text_size || 0,
  }

  // Calculate link metrics
  const linkMetrics = {
    total: meta.internal_links_count + meta.external_links_count,
    internal: meta.internal_links_count,
    external: meta.external_links_count,
    broken: pageData.broken_links === true ? 1 : 0,
  }

  // Calculate size metrics
  const sizeMetrics = {
    totalSize: pageData.size || 0,
    htmlSize: pageData.size || 0,
    transferSize: pageData.total_transfer_size || 0,
    domSize: pageData.total_dom_size || 0,
  }

  // Get page status
  const pageStatus = {
    code: pageData.status_code || 200,
    message: pageData.status_code === 200 ? "OK" : "Error",
  }

  // Get meta tags status
  const metaStatus = {
    hasTitle: !!meta.title,
    hasDescription: !!meta.description,
    hasCanonical: !!meta.canonical,
    hasRobots: !!meta.robots,
    hasViewport: !!meta.viewport,
  }

  // Calculate image metrics
  const imageMetrics = {
    total: meta.images_count,
    withoutAlt: pageData.checks?.no_image_alt === true ? "Some images" : 0,
    broken: pageData.broken_resources === true ? "Some resources" : 0,
  }

  // Get performance metrics
  const performanceMetrics = {
    timeToInteractive: page_timing.time_to_interactive || 0,
    domComplete: page_timing.dom_complete || 0,
    largestContentfulPaint: page_timing.largest_contentful_paint || 0,
    firstInputDelay: page_timing.first_input_delay || 0,
    connectionTime: page_timing.connection_time || 0,
    waitingTime: page_timing.waiting_time || 0,
    downloadTime: page_timing.download_time || 0,
    durationTime: page_timing.duration_time || 0
  }

  // Get screenshot data
  const screenshotData = pageData.page_screenshot_data

  // Extract links from the audit result
  const externalLinks = instantAuditResults?.externalLinks || []
  const internalLinks = instantAuditResults?.internalLinks || []

  // Log extracted metrics for debugging
  console.log("Extracted content metrics:", contentMetrics)
  console.log("Extracted link metrics:", linkMetrics)
  console.log("Extracted image metrics:", imageMetrics)

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 w-full max-w-[1200px] mx-auto"
    >
      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-[#0071e3]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Audit Results</CardTitle>
                <CardDescription className="text-gray-500 mt-1 flex items-center">
                  <span className="truncate max-w-[300px]">{url}</span>
                  <Badge className="ml-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors rounded-full text-xs px-2">
                    {format(new Date(), "MMM d, yyyy")}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearInstantAuditResults}
                className="rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  New Audit
                </span>
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pt-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Overall Score Card */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative overflow-hidden"
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden h-full transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-gray-600" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-700">Overall Score</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center pt-2">
                    <div className="relative mb-2">
                      <motion.div 
                        className={`text-4xl font-bold ${scoreColor}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {Math.round(score)}%
                      </motion.div>
                      <motion.div 
                        className="absolute -bottom-6 left-0 right-0 flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Badge 
                          className={`bg-gradient-to-r ${scoreGradient} text-white border-0 rounded-full text-xs px-2`}
                        >
                          {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </motion.div>
                    </div>
                    <div className="w-full mt-6 mb-1">
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r ${scoreGradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Page Load Time Card */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative overflow-hidden"
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden h-full transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-700">Page Load Time</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center pt-2">
                    <motion.div 
                      className="text-4xl font-bold text-gray-900"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {((performanceMetrics.timeToInteractive || 0) / 1000).toFixed(2)}
                      <span className="text-xl font-medium text-gray-500">s</span>
                    </motion.div>
                    <div className="text-sm text-gray-500 mt-2">Time to Interactive</div>
                    <div className="w-full mt-4 mb-1">
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (performanceMetrics.timeToInteractive / 5000) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Content Card */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative overflow-hidden"
            >
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden h-full transition-all duration-300 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-700">Content</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center pt-2">
                    <motion.div 
                      className="text-4xl font-bold text-gray-900"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {contentMetrics.wordCount}
                    </motion.div>
                    <div className="text-sm text-gray-500 mt-2">Words</div>
                    <div className="w-full mt-4 mb-1">
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (contentMetrics.wordCount / 1000) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <div className="relative mb-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white -z-10 rounded-xl" />
              <TabsList className="bg-transparent p-1 rounded-xl border border-gray-100 w-full flex justify-start overflow-x-auto">
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg text-gray-600 transition-all duration-200"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="meta"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg text-gray-600 transition-all duration-200"
                >
                  Meta Tags
                </TabsTrigger>
                <TabsTrigger 
                  value="content"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg text-gray-600 transition-all duration-200"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="links"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg text-gray-600 transition-all duration-200"
                >
                  Links
                </TabsTrigger>
                <TabsTrigger 
                  value="performance"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg text-gray-600 transition-all duration-200"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger 
                  value="images"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-lg text-gray-600 transition-all duration-200"
                >
                  Images
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="mt-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-gray-800">Page Information</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="space-y-3">
                          <motion.div 
                            className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-24 flex-shrink-0">
                              <span className="text-sm font-medium text-gray-600">URL</span>
                            </div>
                            <span className="text-sm text-gray-800 break-all">{url}</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-24 flex-shrink-0">
                              <span className="text-sm font-medium text-gray-600">Status</span>
                            </div>
                            <span className="text-sm text-gray-800">
                              {pageStatus.code} {pageStatus.message}
                            </span>
                          </motion.div>
                          <motion.div 
                            className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-24 flex-shrink-0">
                              <span className="text-sm font-medium text-gray-600">Content Type</span>
                            </div>
                            <span className="text-sm text-gray-800">{metaInfo.content_type || "text/html"}</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-24 flex-shrink-0">
                              <span className="text-sm font-medium text-gray-600">Encoding</span>
                            </div>
                            <span className="text-sm text-gray-800">{metaInfo.charset ? `UTF-${metaInfo.charset}` : "UTF-8"}</span>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-gray-800">Key Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="space-y-3">
                          <motion.div 
                            className="flex items-center p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge 
                              variant={metaStatus.hasTitle ? "default" : "destructive"} 
                              className={`mr-3 ${metaStatus.hasTitle ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''} border-0 rounded-full px-2`}
                            >
                              {metaStatus.hasTitle ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm font-medium text-gray-700">Title Tag</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge 
                              variant={metaStatus.hasDescription ? "default" : "destructive"} 
                              className={`mr-3 ${metaStatus.hasDescription ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''} border-0 rounded-full px-2`}
                            >
                              {metaStatus.hasDescription ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm font-medium text-gray-700">Meta Description</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge 
                              variant={metaStatus.hasCanonical ? "default" : "destructive"} 
                              className={`mr-3 ${metaStatus.hasCanonical ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''} border-0 rounded-full px-2`}
                            >
                              {metaStatus.hasCanonical ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm font-medium text-gray-700">Canonical URL</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge 
                              variant={contentMetrics.wordCount >= 300 ? "default" : "destructive"} 
                              className={`mr-3 ${contentMetrics.wordCount >= 300 ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''} border-0 rounded-full px-2`}
                            >
                              {contentMetrics.wordCount >= 300 ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm font-medium text-gray-700">Content Length</span>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {screenshotData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium text-gray-800">Page Screenshot</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="border rounded-xl overflow-hidden shadow-sm">
                            <img 
                              src={`data:image/jpeg;base64,${screenshotData}`} 
                              alt="Page Screenshot" 
                              className="w-full" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="meta" className="mt-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                              <Type className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Title</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-800">{metaInfo.title || "No title found"}</p>
                          </div>
                          <div className="flex items-center mt-3 p-3 bg-gray-50 rounded-xl">
                            <Badge
                              variant={pageData.checks?.title_too_long === true ? "destructive" : "default"}
                              className={`mr-3 ${pageData.checks?.title_too_long !== true ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''} border-0 rounded-full px-2`}
                            >
                              {pageData.checks?.title_too_long === true ? "✗" : "✓"}
                            </Badge>
                            <p className="text-sm text-gray-700">
                              {pageData.checks?.title_too_long === true
                                ? "Title is too long (over 60 characters)"
                                : pageData.checks?.title_too_short === true
                                  ? "Title is too short (under 30 characters)"
                                  : "Title length is good"}
                            </p>
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-500">Title Length</span>
                              <span className="text-xs font-medium text-gray-700">
                                {metaInfo.title ? metaInfo.title.length : 0} / 60 characters
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${metaInfo.title && metaInfo.title.length > 60 ? 'bg-red-500' : metaInfo.title && metaInfo.title.length < 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, metaInfo.title ? (metaInfo.title.length / 60) * 100 : 0)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                              <AlignLeft className="h-4 w-4 text-purple-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Meta Description</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm font-medium text-gray-800">{metaInfo.description || "No description found"}</p>
                          </div>
                          <div className="flex items-center mt-3 p-3 bg-gray-50 rounded-xl">
                            <Badge
                              variant={pageData.checks?.no_description === true ? "destructive" : "default"}
                              className={`mr-3 ${pageData.checks?.no_description !== true ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''} border-0 rounded-full px-2`}
                            >
                              {pageData.checks?.no_description === true ? "✗" : "✓"}
                            </Badge>
                            <p className="text-sm text-gray-700">
                              {pageData.checks?.no_description === true
                                ? "Description is missing"
                                : metaInfo.description && metaInfo.description.length > 160
                                  ? "Description is too long (over 160 characters)"
                                  : metaInfo.description && metaInfo.description.length < 50
                                    ? "Description is too short (under 50 characters)"
                                    : "Description length is good"}
                            </p>
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-500">Description Length</span>
                              <span className="text-xs font-medium text-gray-700">
                                {metaInfo.description ? metaInfo.description.length : 0} / 160 characters
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${metaInfo.description && metaInfo.description.length > 160 ? 'bg-red-500' : metaInfo.description && metaInfo.description.length < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, metaInfo.description ? (metaInfo.description.length / 160) * 100 : 0)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                              <ListChecks className="h-4 w-4 text-green-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Other Meta Tags</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">Canonical URL</span>
                              </div>
                              <span className="text-sm text-gray-800 break-all">{metaInfo.canonical || "Not set"}</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">Robots</span>
                              </div>
                              <span className="text-sm text-gray-800">{metaInfo.robots || "Not set"}</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">Viewport</span>
                              </div>
                              <span className="text-sm text-gray-800">{metaInfo.viewport || "Not set"}</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">Language</span>
                              </div>
                              <span className="text-sm text-gray-800">{metaInfo.language || "Not set"}</span>
                            </motion.div>
                            {metaInfo.generator && (
                              <motion.div 
                                className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="w-32 flex-shrink-0">
                                  <span className="text-sm font-medium text-gray-600">Generator</span>
                                </div>
                                <span className="text-sm text-gray-800">{metaInfo.generator}</span>
                              </motion.div>
                            )}
                            {metaInfo.charset && (
                              <motion.div 
                                className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="w-32 flex-shrink-0">
                                  <span className="text-sm font-medium text-gray-600">Charset</span>
                                </div>
                                <span className="text-sm text-gray-800">UTF-{metaInfo.charset}</span>
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="content" className="mt-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                              <HeadingIcon className="h-4 w-4 text-indigo-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Headings</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {metaInfo.h1 && metaInfo.h1.length > 0 && (
                              <motion.div 
                                className="p-3 bg-gradient-to-r from-indigo-50 to-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="flex items-center mb-1">
                                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0 rounded-full px-2 mr-2">H1</Badge>
                                  <span className="text-xs text-gray-500">Primary Heading</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800">{metaInfo.h1[0]}</p>
                              </motion.div>
                            )}
                            
                            {metaInfo.h2 && Array.isArray(metaInfo.h2) && metaInfo.h2.slice(0, 5).map((h2: string, index: number) => (
                              <motion.div 
                                key={`h2-${index}`}
                                className="p-3 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="flex items-center mb-1">
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-full px-2 mr-2">H2</Badge>
                                  <span className="text-xs text-gray-500">Secondary Heading</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800">{h2}</p>
                              </motion.div>
                            ))}
                            
                            {metaInfo.h3 && Array.isArray(metaInfo.h3) && metaInfo.h3.slice(0, 5).map((h3: string, index: number) => (
                              <motion.div 
                                key={`h3-${index}`}
                                className="p-3 bg-gradient-to-r from-purple-50 to-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="flex items-center mb-1">
                                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 rounded-full px-2 mr-2">H3</Badge>
                                  <span className="text-xs text-gray-500">Tertiary Heading</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800">{h3}</p>
                              </motion.div>
                            ))}
                            
                            {(!metaInfo.h1 || metaInfo.h1.length === 0) && (!metaInfo.h2 || metaInfo.h2.length === 0) && (!metaInfo.h3 || metaInfo.h3.length === 0) && (
                              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex items-center">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                                  <p className="text-sm font-medium text-amber-700">No headings found on this page</p>
                                </div>
                                <p className="text-xs text-amber-600 mt-1">
                                  Proper heading structure is important for SEO and accessibility.
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                              <BarChart3 className="h-4 w-4 text-emerald-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Content Metrics</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div 
                              className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="text-xs text-emerald-600 mb-1 font-medium">Word Count</div>
                              <div className="text-2xl font-bold text-gray-800">{contentMetrics.wordCount}</div>
                              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (contentMetrics.wordCount / 1000) * 100)}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {contentMetrics.wordCount < 300 ? "Too short" : Number(contentMetrics.wordCount) > 1500 ? "Excellent" : "Good"}
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="text-xs text-blue-600 mb-1 font-medium">Text/HTML Ratio</div>
                              <div className="text-2xl font-bold text-gray-800">
                                {contentMetrics.textRate ? `${(contentMetrics.textRate * 100).toFixed(1)}%` : "N/A"}
                              </div>
                              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, contentMetrics.textRate ? contentMetrics.textRate * 100 * 2 : 0)}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {!contentMetrics.textRate ? "Unknown" : Number(contentMetrics.textRate) < 0.1 ? "Too low" : Number(contentMetrics.textRate) > 0.5 ? "Excellent" : "Good"}
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="text-xs text-purple-600 mb-1 font-medium">Readability</div>
                              <div className="text-2xl font-bold text-gray-800">
                                {contentMetrics.readabilityScore ? contentMetrics.readabilityScore.toFixed(1) : "N/A"}
                              </div>
                              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, contentMetrics.readabilityScore ? (contentMetrics.readabilityScore / 100) * 100 : 0)}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {!contentMetrics.readabilityScore ? "Unknown" : Number(contentMetrics.readabilityScore) < 30 ? "Difficult" : Number(contentMetrics.readabilityScore) > 70 ? "Easy" : "Moderate"}
                              </div>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-pink-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Images</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div 
                              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-3 mx-auto">
                                <ImageIcon className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{imageMetrics.total}</div>
                                <div className="text-xs text-gray-500 mt-1">Total Images</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 mb-3 mx-auto">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{imageMetrics.withoutAlt}</div>
                                <div className="text-xs text-gray-500 mt-1">Missing Alt Text</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-red-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3 mx-auto">
                                <XCircle className="h-5 w-5 text-red-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{imageMetrics.broken}</div>
                                <div className="text-xs text-gray-500 mt-1">Broken Images</div>
                              </div>
                            </motion.div>
                          </div>
                          
                          {typeof imageMetrics.withoutAlt === 'number' && imageMetrics.withoutAlt > 0 || imageMetrics.withoutAlt === "Some images" && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                              <div className="flex items-start">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-amber-700">Images missing alt text</p>
                                  <p className="text-xs text-amber-600 mt-1">
                                    Alt text is important for accessibility and SEO. Add descriptive alt text to all images.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {typeof imageMetrics.broken === 'number' && imageMetrics.broken > 0 || imageMetrics.broken === "Some resources" && (
                            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                              <div className="flex items-start">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-red-700">Broken images detected</p>
                                  <p className="text-xs text-red-600 mt-1">
                                    Fix or remove broken images to improve user experience and page load time.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="links" className="mt-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                              <LinkIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Link Summary</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div 
                              className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 mb-3 mx-auto">
                                <LinkIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{linkMetrics.total}</div>
                                <div className="text-xs text-gray-500 mt-1">Total Links</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 mb-3 mx-auto">
                                <ExternalLink className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{linkMetrics.external}</div>
                                <div className="text-xs text-gray-500 mt-1">External Links</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-red-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3 mx-auto">
                                <XCircle className="h-5 w-5 text-red-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{linkMetrics.broken}</div>
                                <div className="text-xs text-gray-500 mt-1">Broken Links</div>
                              </div>
                            </motion.div>
                          </div>
                          
                          {typeof linkMetrics.broken === 'number' && linkMetrics.broken > 0 && (
                            <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                              <div className="flex items-start">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-red-700">Broken links detected</p>
                                  <p className="text-xs text-red-600 mt-1">
                                    Fix broken links to improve user experience and SEO performance.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                              <ExternalLink className="h-4 w-4 text-purple-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">External Links</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {externalLinks && externalLinks.length > 0 ? (
                              externalLinks.slice(0, 5).map((link: any, index: number) => (
                                <motion.div 
                                  key={`external-link-${index}`}
                                  className="p-3 bg-gradient-to-r from-purple-50 to-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                                  whileHover={{ x: 3 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="flex items-start">
                                    <ExternalLink className="h-4 w-4 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-800 break-all">{link.url}</p>
                                      <div className="flex items-center mt-1">
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 rounded-full px-2 mr-2">
                                          {link.rel || "follow"}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {link.text ? (link.text.length > 30 ? link.text.substring(0, 30) + '...' : link.text) : 'No text'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center">
                                  <AlertTriangle className="h-4 w-4 text-gray-500 mr-2" />
                                  <p className="text-sm font-medium text-gray-700">No external links found</p>
                                </div>
                              </div>
                            )}
                            
                            {externalLinks && externalLinks.length > 5 && (
                              <div className="flex justify-center mt-2">
                                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 px-3 py-1">
                                  +{externalLinks.length - 5} more external links
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                              <LinkIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Internal Links</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {internalLinks && internalLinks.length > 0 ? (
                              internalLinks.slice(0, 5).map((link: any, index: number) => (
                                <motion.div 
                                  key={`internal-link-${index}`}
                                  className="p-3 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                                  whileHover={{ x: 3 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="flex items-start">
                                    <LinkIcon className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-800 break-all">{link.url}</p>
                                      <div className="flex items-center mt-1">
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-full px-2 mr-2">
                                          {link.rel || "follow"}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {link.text ? (link.text.length > 30 ? link.text.substring(0, 30) + '...' : link.text) : 'No text'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center">
                                  <AlertTriangle className="h-4 w-4 text-gray-500 mr-2" />
                                  <p className="text-sm font-medium text-gray-700">No internal links found</p>
                                </div>
                              </div>
                            )}
                            
                            {internalLinks && internalLinks.length > 5 && (
                              <div className="flex justify-center mt-2">
                                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 px-3 py-1">
                                  +{internalLinks.length - 5} more internal links
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="performance" className="mt-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Page Load Time</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div 
                              className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 mb-3 mx-auto">
                                <Clock className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{((performanceMetrics.timeToInteractive || 0) / 1000).toFixed(2)}</div>
                                <div className="text-xs text-gray-500 mt-1">Time to Interactive</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 mb-3 mx-auto">
                                <Clock className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{((performanceMetrics.domComplete || 0) / 1000).toFixed(2)}</div>
                                <div className="text-xs text-gray-500 mt-1">DOM Complete</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-red-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3 mx-auto">
                                <Clock className="h-5 w-5 text-red-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{((performanceMetrics.largestContentfulPaint || 0) / 1000).toFixed(2)}</div>
                                <div className="text-xs text-gray-500 mt-1">Largest Contentful Paint</div>
                              </div>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-purple-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Other Performance Metrics</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">First Input Delay</span>
                              </div>
                              <span className="text-sm text-gray-800">{((performanceMetrics.firstInputDelay || 0) / 1000).toFixed(2)}s</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">Connection Time</span>
                              </div>
                              <span className="text-sm text-gray-800">{((performanceMetrics.connectionTime || 0) / 1000).toFixed(2)}s</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">Waiting Time</span>
                              </div>
                              <span className="text-sm text-gray-800">{((performanceMetrics.waitingTime || 0) / 1000).toFixed(2)}s</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">Download Time</span>
                              </div>
                              <span className="text-sm text-gray-800">{((performanceMetrics.downloadTime || 0) / 1000).toFixed(2)}s</span>
                            </motion.div>
                            <motion.div 
                              className="flex items-start p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="w-32 flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">Duration Time</span>
                              </div>
                              <span className="text-sm text-gray-800">{((performanceMetrics.durationTime || 0) / 1000).toFixed(2)}s</span>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="images" className="mt-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <motion.div
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden"
                    >
                      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-pink-600" />
                            </div>
                            <CardTitle className="text-base font-medium text-gray-800">Image Summary</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div 
                              className="bg-gradient-to-br from-white to-pink-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-pink-100 mb-3 mx-auto">
                                <ImageIcon className="h-5 w-5 text-pink-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{imageMetrics.total}</div>
                                <div className="text-xs text-gray-500 mt-1">Total Images</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 mb-3 mx-auto">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{imageMetrics.withoutAlt}</div>
                                <div className="text-xs text-gray-500 mt-1">Missing Alt Text</div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              className="bg-gradient-to-br from-white to-red-50 rounded-xl p-4 shadow-sm"
                              whileHover={{ y: -3, scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3 mx-auto">
                                <XCircle className="h-5 w-5 text-red-600" />
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{imageMetrics.broken}</div>
                                <div className="text-xs text-gray-500 mt-1">Broken Images</div>
                              </div>
                            </motion.div>
                          </div>
                          
                          {typeof imageMetrics.withoutAlt === 'number' && imageMetrics.withoutAlt > 0 || imageMetrics.withoutAlt === "Some images" && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                              <div className="flex items-start">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-amber-700">Images missing alt text</p>
                                  <p className="text-xs text-amber-600 mt-1">
                                    Alt text is important for accessibility and SEO. Add descriptive alt text to all images.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {typeof imageMetrics.broken === 'number' && imageMetrics.broken > 0 || imageMetrics.broken === "Some resources" && (
                            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                              <div className="flex items-start">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-red-700">Broken images detected</p>
                                  <p className="text-xs text-red-600 mt-1">
                                    Fix or remove broken images to improve user experience and page load time.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </m.div>
  )
}
