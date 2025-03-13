"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Globe,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  Lightbulb,
  ExternalLink,
  Clock,
  Zap,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const MAX_RETRIES = 15
const POLLING_INTERVAL = 5000

interface AuditReference {
  id: string
  weight: number
  group: string
}

interface Audit {
  id: string
  title: string
  description: string
  score: number | null
  displayValue: string | null
}

interface AuditItem {
  id: string
  weight: number
  group: string
  audit: Audit
}

interface LighthouseAudit {
  id: string
  title: string
  description: string
  score: number | null
  displayValue?: string
  numericValue?: number
  numericUnit?: string
  details?: {
    type?: string
    headings?: Array<{
      key: string
      itemType?: string
      text?: string
      label?: string
    }>
    items?: Array<Record<string, any>>
    overallSavingsMs?: number
  }
  warnings?: string[]
  errorMessage?: string
  scoreDisplayMode?: string
}

interface LighthouseCategory {
  id: string
  title: string
  description: string
  score: number
  audits: LighthouseAudit[]
}

interface LighthouseResult {
  categories: LighthouseCategory[]
  fetchTime: string
  requestedUrl: string
  finalUrl: string
  lighthouseVersion: string
  userAgent: string
  environment: any
  runWarnings: any[]
}

interface LighthouseAuditFormProps {
  onTaskCreated?: (taskId: string) => void;
}

// Memoized CircularProgress component to prevent unnecessary re-renders
const CircularProgress = memo(
  ({
    value,
    label,
    size = 120,
    strokeWidth = 8,
  }: {
    value: number
    label: string
    size?: number
    strokeWidth?: number
  }) => {
    const normalizedValue = value * 100
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - (normalizedValue / 100) * circumference

    // Determine color based on score
    const getColor = (score: number) => {
      if (score >= 90) return "#0cce6b" // Good (green)
      if (score >= 50) return "#ffa400" // Needs Improvement (orange)
      return "#ff4e42" // Poor (red)
    }

    const color = getColor(normalizedValue)

    return (
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background circle */}
          <svg width={size} height={size} className="absolute top-0 left-0">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#e6e6e6"
              strokeWidth={strokeWidth}
            />
          </svg>

          {/* Progress circle with animation - only animate once */}
          <motion.svg
            width={size}
            height={size}
            className="absolute top-0 left-0 -rotate-90 transform"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </motion.svg>

          {/* Score text with animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-2xl font-bold"
              style={{ color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {Math.round(normalizedValue)}
            </motion.span>
          </div>
        </div>
        <span className="mt-2 text-sm font-medium text-gray-700">{label}</span>
      </motion.div>
    )
  },
)

CircularProgress.displayName = "CircularProgress"

export function LighthouseAuditForm({ onTaskCreated }: LighthouseAuditFormProps) {
  const {
    startLighthouseAudit,
    getLighthouseResults,
    lighthouseAuditLoading,
    lighthouseAuditResults,
    setActiveSiteAuditTask,
  } = useSeoAudit()
  const { toast } = useToast()
  const [target, setTarget] = useState("")
  const [forMobile, setForMobile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [glowColor] = useState("#0071e3") // Removed the changing color to prevent re-renders

  // Results-related state
  const [localResults, setLocalResults] = useState<any | null>(null)
  const [localTaskId, setLocalTaskId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [hasResults, setHasResults] = useState(false)
  const [activeTab, setActiveTab] = useState("performance")
  const [showResults, setShowResults] = useState(false)
  const [auditStartTime, setAuditStartTime] = useState<Date | null>(null)

  // Set mounted state for animations
  useEffect(() => {
    setMounted(true)
  }, [])

  // Validate URL on change
  const validateUrl = (url: string) => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  // Update validation state when target changes
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTarget(value)
    if (value.trim() === "") {
      setIsValid(null)
    } else {
      setIsValid(validateUrl(value))
    }
  }

  // Function to poll for results
  const pollForResults = useCallback(
    async (taskId: string) => {
      if (!taskId) return

      console.log(`Polling for results for task ID: ${taskId}`)
      setIsPolling(true)
      setRetryCount((prev) => prev + 1)

      try {
        // Call the getLighthouseResults function from the context
        const result = await getLighthouseResults(taskId)
        console.log("Received Lighthouse results:", result)

        if (result.success) {
          // Successfully got results
          console.log("Successfully retrieved Lighthouse results")
          setLocalResults(result.data)
          setHasResults(true)
          setShowResults(true)
          setIsPolling(false)

          toast({
            title: "Audit Complete",
            description: "Lighthouse audit has been completed successfully.",
          })

          return
        } else {
          // Handle in-progress status
          if (
            result.status === "in_progress" ||
            (result.error &&
              typeof result.error === "string" &&
              (result.error.includes("still processing") ||
                result.error.includes("not ready") ||
                result.error.includes("in progress")))
          ) {
            console.log("Lighthouse audit still in progress, continuing polling...")
            // Continue polling if under max retries
            if (retryCount < MAX_RETRIES) {
              setTimeout(() => pollForResults(taskId), POLLING_INTERVAL)
            } else {
              console.log("Reached maximum polling attempts")
              setIsPolling(false)
              setError("Lighthouse audit timed out after multiple attempts. Please try refreshing the results.")

              toast({
                title: "Audit Timeout",
                description: "The audit is taking longer than expected. Please try refreshing the results.",
                variant: "destructive",
              })
            }
          } else {
            // Handle other errors
            console.error("Error getting Lighthouse results:", result.error)
            setIsPolling(false)
            setError(result.error || "Failed to get Lighthouse results")

            toast({
              title: "Audit Failed",
              description: result.error || "Failed to get Lighthouse results",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Error polling for Lighthouse results:", error)
        setIsPolling(false)
        setError(error instanceof Error ? error.message : "An unknown error occurred")

        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        })
      }
    },
    [getLighthouseResults, retryCount, toast],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!target) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to audit.",
        variant: "destructive",
      })
      return
    }

    // URL validation
    if (!validateUrl(target)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Starting Lighthouse audit for:", target)
      const options = {
        forMobile,
      }
      console.log("Options:", options)

      setAuditStartTime(new Date())

      const taskData = await startLighthouseAudit(target, options)

      if (taskData && taskData.taskId) {
        console.log(`Lighthouse audit started with task ID: ${taskData.taskId}`)
        toast({
          title: "Audit Started",
          description: `Lighthouse audit for ${target} has been initiated. Results will appear shortly.`,
        })

        // Set this task as the active task
        setActiveSiteAuditTask(taskData.taskId)
        setLocalTaskId(taskData.taskId)

        if (onTaskCreated) {
          onTaskCreated(taskData.taskId);
        }

        // Start polling for results
        setIsPolling(true)
        setRetryCount(0)
        pollForResults(taskData.taskId)
      } else {
        console.error("No task ID returned from startLighthouseAudit")
        throw new Error("Failed to start the Lighthouse audit. No task ID was returned.")
      }
    } catch (err) {
      console.error("Error starting Lighthouse audit:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Audit Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  // Enhanced function to adapt Lighthouse data with detailed information
  function adaptLighthouseData(data: any): LighthouseResult | null {
    console.log("Adapting Lighthouse data:", JSON.stringify(data).substring(0, 500) + "...")

    if (!data) {
      console.log("No data provided to adaptLighthouseData")
      return null
    }

    // Function to recursively search for lighthouse results
    function findLighthouseResult(obj: any): any {
      // If this is a lighthouse result with categories and audits
      if (obj && obj.categories && obj.audits) {
        console.log("Found lighthouse result with categories and audits")
        return obj
      }

      // If this has lighthouse_result
      if (obj && obj.lighthouse_result) {
        console.log("Found lighthouse_result property")
        return obj.lighthouse_result
      }

      // If this is an array, search each item
      if (Array.isArray(obj)) {
        console.log("Searching array for lighthouse result")
        for (const item of obj) {
          const result = findLighthouseResult(item)
          if (result) return result
        }
      }

      // If this is an object, search each property
      if (obj && typeof obj === "object") {
        // Check for result array which is common in DataForSEO responses
        if (obj.result && Array.isArray(obj.result)) {
          console.log("Searching result array")
          for (const item of obj.result) {
            const result = findLighthouseResult(item)
            if (result) return result
          }
        }

        // Check for items array which is common in DataForSEO responses
        if (obj.items && Array.isArray(obj.items)) {
          console.log("Searching items array")
          for (const item of obj.items) {
            const result = findLighthouseResult(item)
            if (result) return result
          }
        }

        // Search all other properties
        for (const key in obj) {
          if (key !== "result" && key !== "items") {
            // Skip the ones we already checked
            const result = findLighthouseResult(obj[key])
            if (result) return result
          }
        }
      }

      return null
    }

    // Find the lighthouse result
    const lighthouseResult = findLighthouseResult(data)
    console.log("Lighthouse result found:", lighthouseResult ? "Yes" : "No")

    if (!lighthouseResult) {
      console.log("No lighthouse result found in data")
      return null
    }

    // Extract categories and audits
    const { categories, audits } = lighthouseResult

    if (!categories || !audits) {
      console.log("Missing categories or audits in lighthouse result")
      return null
    }

    // Process the categories and their audits
    const processedCategories = Object.entries(categories).map(([id, category]: [string, any]) => {
      // Get the audits for this category
      const categoryAudits = category.auditRefs
        ? category.auditRefs
            .map((auditRef: any) => {
              const auditId = auditRef.id
              const audit = audits[auditId]

              if (!audit) return null

              // Extract detailed information from the audit
              return {
                id: auditId,
                title: audit.title,
                description: audit.description,
                score: audit.score,
                displayValue: audit.displayValue,
                numericValue: audit.numericValue,
                numericUnit: audit.numericUnit,
                details: audit.details,
                warnings: audit.warnings,
                errorMessage: audit.errorMessage,
                scoreDisplayMode: audit.scoreDisplayMode,
              }
            })
            .filter(Boolean)
        : []

      return {
        id,
        title: category.title,
        description: category.description,
        score: category.score,
        audits: categoryAudits,
      }
    })

    return {
      categories: processedCategories,
      fetchTime: lighthouseResult.fetchTime,
      requestedUrl: lighthouseResult.requestedUrl,
      finalUrl: lighthouseResult.finalUrl,
      lighthouseVersion: lighthouseResult.lighthouseVersion,
      userAgent: lighthouseResult.userAgent,
      environment: lighthouseResult.environment,
      runWarnings: lighthouseResult.runWarnings || [],
    }
  }

  // Memoize the adapted data to prevent unnecessary recalculations
  const adaptedData = useMemo(() => {
    if (!localResults) {
      return null
    }

    return adaptLighthouseData(localResults)
  }, [localResults])

  // Calculate elapsed time for the audit
  const getElapsedTime = useCallback(() => {
    if (!auditStartTime) return null

    const now = new Date()
    const elapsed = Math.floor((now.getTime() - auditStartTime.getTime()) / 1000)

    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60

    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
  }, [auditStartTime])

  // Format the audit date
  const formatAuditDate = useCallback(() => {
    if (!adaptedData?.fetchTime) return null

    try {
      const date = new Date(adaptedData.fetchTime)
      return date.toLocaleString()
    } catch (e) {
      return adaptedData.fetchTime
    }
  }, [adaptedData])

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div
            className="relative overflow-hidden rounded-3xl border border-[#d2d2d7] bg-white/90 backdrop-blur-xl shadow-lg"
            style={{
              boxShadow: `0 10px 40px -10px rgba(0,0,0,0.1), 0 0 15px 2px ${glowColor}20`,
            }}
          >
            {/* Header with gradient line */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0071e3] to-[#40a9ff]"></div>
              <div className="pt-8 px-8 pb-6">
                <div className="flex items-center gap-4 mb-2">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] shadow-md"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Globe className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <motion.h2
                      className="text-2xl font-semibold tracking-tight text-gray-900"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      Lighthouse Performance Audit
                    </motion.h2>
                    <motion.p
                      className="text-base text-gray-500 mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      Analyze your website's performance, accessibility, best practices, and SEO with Google Lighthouse.
                    </motion.p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form content */}
            {!showResults && (
              <motion.div
                className="px-8 pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="target" className="text-base font-medium text-gray-800 flex items-center gap-2">
                      Website URL
                    </Label>
                    <motion.div
                      whileFocus={{ scale: 1.005 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="relative"
                    >
                      <Input
                        id="target"
                        placeholder="https://example.com"
                        value={target}
                        onChange={handleTargetChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`h-12 pl-4 pr-12 rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] ${
                          isValid === true ? "border-green-500" : isValid === false ? "border-red-500" : ""
                        }`}
                      />
                      <AnimatePresence mode="wait">
                        {isValid === true && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </motion.div>
                        )}
                        {isValid === false && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-500"
                          >
                            <XCircle className="h-5 w-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 pl-1">
                      <span className="text-[#0071e3]">•</span>
                      Enter the full URL including https:// or http://
                    </p>
                  </div>

                  <motion.div
                    className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl border border-[#e5e5e7]"
                    whileHover={{ backgroundColor: "#f0f0f2" }}
                    transition={{ duration: 0.2 }}
                  >
                    <Switch
                      id="mobile-mode"
                      checked={forMobile}
                      onCheckedChange={setForMobile}
                      className="data-[state=checked]:bg-[#0071e3]"
                    />
                    <Label htmlFor="mobile-mode" className="font-medium text-gray-800 cursor-pointer select-none">
                      Mobile Device Mode
                    </Label>
                    <Badge variant="outline" className="ml-auto text-xs bg-white/70 text-gray-500 border-[#d2d2d7]">
                      {forMobile ? "Simulates mobile device" : "Desktop experience"}
                    </Badge>
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start space-x-3 text-red-800"
                      >
                        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-500" />
                        <div>
                          <p className="font-medium">Error</p>
                          <p className="text-sm">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      type="submit"
                      disabled={lighthouseAuditLoading || isPolling}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white font-medium text-lg shadow-md transition-all hover:shadow-lg"
                    >
                      {lighthouseAuditLoading || isPolling ? (
                        <div className="flex items-center justify-center">
                          <motion.div
                            className="h-6 w-6 rounded-full border-3 border-white border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                          <span className="ml-3">{isPolling ? "Getting Results..." : "Starting Audit..."}</span>
                        </div>
                      ) : (
                        <span className="flex items-center">
                          Start Lighthouse Audit
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      )}
                    </Button>
                  </motion.div>

                  {/* Tips section */}
                  <motion.div
                    className="mt-6 bg-[#f5f5f7]/70 rounded-xl p-4 border border-[#e5e5e7]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Lighthouse Tips
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-500">
                      <li className="flex items-start gap-2">
                        <span className="text-[#0071e3] mt-0.5">•</span>
                        <span>Performance measures how fast your page loads and becomes interactive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#0071e3] mt-0.5">•</span>
                        <span>Accessibility ensures your site works well for users with disabilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#0071e3] mt-0.5">•</span>
                        <span>Best Practices checks if your site follows modern web development standards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#0071e3] mt-0.5">•</span>
                        <span>SEO measures how well search engines can discover and understand your content</span>
                      </li>
                    </ul>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* Results content */}
            {showResults && adaptedData && (
              <motion.div
                className="px-8 pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h3 className="text-xl font-semibold text-gray-800">Audit Results</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-[#0071e3]" />
                          {adaptedData.requestedUrl}
                        </span>
                        {formatAuditDate() && (
                          <span className="flex items-center gap-1 ml-3">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {formatAuditDate()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                    <div className="flex gap-2">
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowResults(false)}
                          className="text-sm flex items-center gap-1 border-[#d2d2d7] hover:bg-[#f5f5f7]"
                        >
                          <ArrowRight className="h-4 w-4 rotate-180" />
                          Back to Form
                        </Button>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (localTaskId) {
                              setRetryCount(0)
                              setIsPolling(true)
                              pollForResults(localTaskId)
                            }
                          }}
                          className="text-sm flex items-center gap-1 border-[#d2d2d7] hover:bg-[#f5f5f7]"
                          disabled={isPolling}
                        >
                          <RefreshCw className={`h-4 w-4 ${isPolling ? "animate-spin" : ""}`} />
                          Refresh
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Score cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {adaptedData.categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-[#f0f0f0] hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        whileHover={{ y: -2 }}
                      >
                        <CircularProgress value={category.score || 0} label={category.title} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Audit details with tabs */}
                  <motion.div
                    className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Tabs defaultValue={adaptedData.categories[0]?.id || "performance"} className="w-full">
                      <TabsList className="flex p-1 bg-[#f5f5f7] border-b border-[#e5e5e7] rounded-t-xl overflow-x-auto">
                        {adaptedData.categories.map((category) => (
                          <TabsTrigger
                            key={category.id}
                            value={category.id}
                            className="flex-1 py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg data-[state=active]:text-[#0071e3]"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    category.score >= 0.9 ? "#0cce6b" : category.score >= 0.5 ? "#ffa400" : "#ff4e42",
                                }}
                              />
                              <span>{category.title}</span>
                              <span className="text-xs ml-1 opacity-70">{Math.round((category.score || 0) * 100)}</span>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {adaptedData.categories.map((category) => (
                        <TabsContent key={category.id} value={category.id} className="p-4">
                          <div className="text-sm text-gray-600 mb-4 bg-[#f9f9fb] p-3 rounded-lg border border-[#e5e5e7]">
                            {category.description}
                          </div>

                          {/* Audit items */}
                          <div className="space-y-4">
                            <Accordion type="single" collapsible className="w-full">
                              {category.audits.map((item, itemIndex) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.05 * itemIndex }}
                                >
                                  <AccordionItem
                                    value={item.id}
                                    className="border border-[#f0f0f0] rounded-lg mb-3 overflow-hidden"
                                  >
                                    <AccordionTrigger className="px-4 py-3 hover:bg-[#f5f5f7]/50 data-[state=open]:bg-[#f5f5f7]/70">
                                      <div className="flex items-center gap-3 w-full">
                                        <div
                                          className="w-3 h-3 rounded-full flex-shrink-0"
                                          style={{
                                            backgroundColor:
                                              item.score === null
                                                ? "#9ca3af"
                                                : item.score >= 0.9
                                                  ? "#0cce6b"
                                                  : item.score >= 0.5
                                                    ? "#ffa400"
                                                    : "#ff4e42",
                                          }}
                                        />
                                        <span className="font-medium text-left">{item.title}</span>
                                        {item.score !== null && (
                                          <Badge
                                            variant="outline"
                                            className="ml-auto text-xs"
                                            style={{
                                              backgroundColor:
                                                item.score >= 0.9
                                                  ? "#0cce6b20"
                                                  : item.score >= 0.5
                                                    ? "#ffa40020"
                                                    : "#ff4e4220",
                                              color:
                                                item.score >= 0.9
                                                  ? "#0cce6b"
                                                  : item.score >= 0.5
                                                    ? "#ffa400"
                                                    : "#ff4e42",
                                            }}
                                          >
                                            {item.displayValue || `${Math.round((item.score || 0) * 100)}/100`}
                                          </Badge>
                                        )}
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2">
                                      <div className="text-sm text-gray-600 mb-3">{item.description}</div>

                                      {/* Display detailed information if available */}
                                      {item.details && item.details.items && item.details.items.length > 0 && (
                                        <div className="mt-3">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                                            <Info className="h-4 w-4 text-[#0071e3]" />
                                            Detailed Information
                                          </h4>
                                          <div className="bg-[#f9f9fb] p-3 rounded-md text-xs overflow-x-auto border border-[#e5e5e7]">
                                            <table className="min-w-full divide-y divide-gray-200">
                                              <thead>
                                                <tr>
                                                  {item.details &&
                                                    item.details.headings &&
                                                    item.details.headings.map((heading: any, index: number) => (
                                                      <th
                                                        key={index}
                                                        className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                      >
                                                        {heading.text || heading.label || heading.key}
                                                      </th>
                                                    ))}
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-200">
                                                {item.details &&
                                                  item.details.items
                                                    .slice(0, 5)
                                                    .map((detailItem: any, index: number) => (
                                                      <tr
                                                        key={index}
                                                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                      >
                                                        {item.details &&
                                                          item.details.headings &&
                                                          item.details.headings.map(
                                                            (heading: any, headingIndex: number) => {
                                                              const key = heading.key
                                                              const value = detailItem[key]
                                                              return (
                                                                <td
                                                                  key={headingIndex}
                                                                  className="px-2 py-1 whitespace-nowrap text-xs text-gray-500"
                                                                >
                                                                  {typeof value === "object"
                                                                    ? JSON.stringify(value).substring(0, 50)
                                                                    : typeof value === "number"
                                                                      ? value.toLocaleString()
                                                                      : value?.toString().substring(0, 50) || "N/A"}
                                                                  {typeof value === "string" && value.length > 50
                                                                    ? "..."
                                                                    : ""}
                                                                </td>
                                                              )
                                                            },
                                                          )}
                                                      </tr>
                                                    ))}
                                              </tbody>
                                            </table>
                                            {item.details && item.details.items.length > 5 && (
                                              <div className="text-xs text-gray-500 mt-2 italic">
                                                Showing 5 of {item.details.items.length} items
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Display warnings if available */}
                                      {item.warnings && item.warnings.length > 0 && (
                                        <div className="mt-3">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            Warnings
                                          </h4>
                                          <ul className="list-disc list-inside text-xs text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-100">
                                            {item.warnings.map((warning: string, index: number) => (
                                              <li key={index} className="mb-1 last:mb-0">
                                                {warning}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {/* Display error message if available */}
                                      {item.errorMessage && (
                                        <div className="mt-3">
                                          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            Error
                                          </h4>
                                          <div className="bg-red-50 p-3 rounded-md text-xs text-red-600 border border-red-100">
                                            {item.errorMessage}
                                          </div>
                                        </div>
                                      )}
                                    </AccordionContent>
                                  </AccordionItem>
                                </motion.div>
                              ))}
                            </Accordion>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Loading state when polling for results */}
            {isPolling && !showResults && (
              <motion.div
                className="px-8 pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center justify-center py-10">
                  <motion.div
                    className="h-16 w-16 rounded-full border-4 border-[#0071e3] border-t-transparent mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                  <motion.h3
                    className="text-xl font-semibold text-gray-800 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    Retrieving Lighthouse Results
                  </motion.h3>
                  <motion.p
                    className="text-gray-500 text-center max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    We're analyzing your website with Google Lighthouse. This may take a minute or two depending on the
                    complexity of the website.
                  </motion.p>

                  <motion.div
                    className="mt-8 w-full max-w-md bg-[#f5f5f7] rounded-full h-2 overflow-hidden"
                    initial={{ opacity: 0, scaleX: 0.8 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#0071e3] to-[#40a9ff]"
                      initial={{ width: "5%" }}
                      animate={{
                        width: isPolling ? ["5%", "95%"] : "100%",
                      }}
                      transition={{
                        duration: 15,
                        ease: "easeInOut",
                        times: [0, 1],
                      }}
                    />
                  </motion.div>

                  {auditStartTime && (
                    <motion.div
                      className="mt-4 flex items-center gap-2 text-sm text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <Clock className="h-4 w-4 text-[#0071e3]" />
                      <span>Elapsed time: {getElapsedTime()}</span>
                    </motion.div>
                  )}

                  <motion.div
                    className="mt-6 flex items-center gap-2 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span>Lighthouse is checking performance, accessibility, SEO, and best practices</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* No results state */}
            {showResults && !adaptedData && (
              <motion.div
                className="px-8 pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center justify-center py-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
                  </motion.div>
                  <motion.h3
                    className="text-xl font-semibold text-gray-800 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    No Results Available
                  </motion.h3>
                  <motion.p
                    className="text-gray-500 text-center max-w-md mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    We couldn't process the Lighthouse results. This could be due to an error in the audit process or an
                    issue with the data format.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Button variant="outline" onClick={() => setShowResults(false)} className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      Back to Form
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Footer with tips */}
            <motion.div
              className="border-t border-[#d2d2d7] bg-[#f5f5f7]/70 backdrop-blur-sm px-8 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center text-white mr-3 shadow-sm">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <span>Lighthouse analyzes performance, accessibility, SEO, and best practices</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="https://developers.google.com/web/tools/lighthouse"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 sm:text-right flex items-center gap-1 hover:text-[#0071e3] transition-colors"
                      >
                        <span>Powered by</span>
                        <span className="font-medium text-gray-500">Google Lighthouse</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Learn more about Lighthouse</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
