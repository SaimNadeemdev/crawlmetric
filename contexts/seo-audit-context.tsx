"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  runInstantPageAudit,
  startFullSiteAudit,
  getTaskSummary,
  getTaskPages,
  getTaskDuplicateTags,
  getTaskLinks,
  getTaskNonIndexable,
} from "@/lib/dataforseo-api"

// Define the types for our context
type AuditResult = {
  url: string
  score: number
  issues: Array<{
    type: string
    severity: "critical" | "warning" | "info"
    message: string
  }>
  metadata: {
    title: string
    description: string
    h1: string[]
    images: number
    imagesWithAlt: number
    internalLinks: number
    externalLinks: number
    wordCount: number
  }
  performance: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
  }
  timestamp: string
}

type SiteAuditTask = {
  id: string
  url: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  createdAt: string
  completedAt?: string
  status_code?: number
  status_message?: string
  time?: string
  data?: {
    target: string
  }
  crawl_progress?: string
}

type SeoAuditContextType = {
  instantAuditUrl: string
  setInstantAuditUrl: (url: string) => void
  instantAuditLoading: boolean
  setInstantAuditLoading: (loading: boolean) => void
  instantAuditResult: AuditResult | null
  setInstantAuditResult: (result: AuditResult | null) => void

  siteAuditUrl: string
  setSiteAuditUrl: (url: string) => void
  siteAuditLoading: boolean
  setSiteAuditLoading: (loading: boolean) => void
  siteAuditTasks: SiteAuditTask[]
  setSiteAuditTasks: (tasks: SiteAuditTask[]) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  siteAuditResult: any | null
  setSiteAuditResult: (result: any | null) => void

  // Add all the methods that the components are expecting
  runInstantAudit: (urls: string[], options?: any) => Promise<void>
  clearInstantAuditResults: () => void
  instantAuditResults: any | null
  instantAuditError: string | null

  startSiteAudit: (target: string, options?: any) => Promise<string>
  setActiveSiteAuditTask: (taskId: string | null) => void
  activeSiteAuditTask: string | null
  loadSiteAuditSummary: (taskId: string) => Promise<void>
  clearSiteAuditData: () => void
  updateTaskStatus: (taskId: string, status: any) => void
  siteAuditSummary: any | null

  loadSiteAuditPages: (taskId: string) => Promise<void>
  loadSiteAuditDuplicateTags: (taskId: string) => Promise<void>
  loadSiteAuditLinks: (taskId: string) => Promise<void>
  loadSiteAuditNonIndexable: (taskId: string) => Promise<void>
}

// Create the context
const SeoAuditContext = createContext<SeoAuditContextType | undefined>(undefined)

// Create a provider component
export function SeoAuditProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  const [instantAuditUrl, setInstantAuditUrl] = useState("")
  const [instantAuditLoading, setInstantAuditLoading] = useState(false)
  const [instantAuditResult, setInstantAuditResult] = useState<AuditResult | null>(null)
  const [instantAuditResults, setInstantAuditResults] = useState<any | null>(null)
  const [instantAuditError, setInstantAuditError] = useState<string | null>(null)

  const [siteAuditUrl, setSiteAuditUrl] = useState("")
  const [siteAuditLoading, setSiteAuditLoading] = useState(false)
  const [siteAuditTasks, setSiteAuditTasks] = useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [activeSiteAuditTask, setActiveSiteAuditTask] = useState<string | null>(null)
  const [siteAuditResult, setSiteAuditResult] = useState<any | null>(null)
  const [siteAuditSummary, setSiteAuditSummary] = useState<any | null>(null)

  // Helper function to sanitize task data
  const sanitizeTaskData = useCallback((task: any) => {
    if (!task) return null

    // Ensure time is a valid date string
    if (task.time) {
      try {
        // Try to parse the date
        const date = new Date(task.time)
        // If invalid, set to current time
        if (isNaN(date.getTime())) {
          task.time = new Date().toISOString()
        }
      } catch (e) {
        // If error, set to current time
        task.time = new Date().toISOString()
      }
    } else {
      // If no time, set to current time
      task.time = new Date().toISOString()
    }

    return task
  }, [])

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem("seo_audit_tasks")
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks)
        // Sanitize each task
        const sanitizedTasks = parsedTasks.map(sanitizeTaskData).filter(Boolean)
        setSiteAuditTasks(sanitizedTasks)
      }

      const activeTask = localStorage.getItem("active_seo_audit_task")
      if (activeTask) {
        setActiveSiteAuditTask(activeTask)
      }
    } catch (error) {
      console.error("Error loading stored audit tasks:", error)
    }
  }, [sanitizeTaskData])

  // Save tasks to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("seo_audit_tasks", JSON.stringify(siteAuditTasks))
    } catch (error) {
      console.error("Error saving audit tasks:", error)
    }
  }, [siteAuditTasks])

  // Save active task to localStorage when it changes
  useEffect(() => {
    try {
      if (activeSiteAuditTask) {
        localStorage.setItem("active_seo_audit_task", activeSiteAuditTask)
      } else {
        localStorage.removeItem("active_seo_audit_task")
      }
    } catch (error) {
      console.error("Error saving active audit task:", error)
    }
  }, [activeSiteAuditTask])

  // Implement the methods that the components are expecting
  const runInstantAudit = useCallback(async (urls: string[], options?: any) => {
    try {
      setInstantAuditLoading(true)
      setInstantAuditError(null)

      console.log("Running instant audit for URLs:", urls, "with options:", options)

      // Call the real API
      const result = await runInstantPageAudit(urls[0], options)
      setInstantAuditResults(result)
    } catch (error) {
      console.error("Error running instant audit:", error)
      setInstantAuditError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setInstantAuditLoading(false)
    }
  }, [])

  const clearInstantAuditResults = useCallback(() => {
    setInstantAuditResults(null)
    setInstantAuditError(null)
  }, [])

  const startSiteAudit = useCallback(async (target: string, options?: any): Promise<string> => {
    try {
      setSiteAuditLoading(true)

      console.log("Starting site audit for:", target, "with options:", options)

      // Call the real API
      const taskData = await startFullSiteAudit(target, options)

      // Add the task to the list
      setSiteAuditTasks((prev) => [taskData, ...prev])

      return taskData.id
    } catch (error) {
      console.error("Error starting site audit:", error)
      throw error
    } finally {
      setSiteAuditLoading(false)
    }
  }, [])

  const loadSiteAuditSummary = useCallback(async (taskId: string) => {
    try {
      setSiteAuditLoading(true)

      console.log("Loading site audit summary for task:", taskId)

      // Call the real API
      const summary = await getTaskSummary(taskId)
      setSiteAuditSummary(summary)
    } catch (error) {
      console.error("Error loading site audit summary:", error)
      toast({
        title: "Error",
        description: "Failed to load audit summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSiteAuditLoading(false)
    }
  }, [])

  const clearSiteAuditData = useCallback(() => {
    setSiteAuditSummary(null)
    setSiteAuditResult(null)
  }, [])

  const updateTaskStatus = useCallback((taskId: string, status: any) => {
    setSiteAuditTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...status } : task)))
  }, [])

  const loadSiteAuditPages = useCallback(
    async (taskId: string) => {
      try {
        console.log("Loading site audit pages for task:", taskId)
        const pages = await getTaskPages(taskId)
        return pages
      } catch (error) {
        console.error("Error loading site audit pages:", error)
        toast({
          title: "Error",
          description: "Failed to load audit pages. Please try again.",
          variant: "destructive",
        })
        return []
      }
    },
    [toast],
  )

  const loadSiteAuditDuplicateTags = useCallback(
    async (taskId: string) => {
      try {
        console.log("Loading site audit duplicate tags for task:", taskId)
        const duplicateTags = await getTaskDuplicateTags(taskId)
        return duplicateTags
      } catch (error) {
        console.error("Error loading site audit duplicate tags:", error)
        toast({
          title: "Error",
          description: "Failed to load duplicate tags. Please try again.",
          variant: "destructive",
        })
        return []
      }
    },
    [toast],
  )

  const loadSiteAuditLinks = useCallback(
    async (taskId: string) => {
      try {
        console.log("Loading site audit links for task:", taskId)
        const links = await getTaskLinks(taskId)
        return links
      } catch (error) {
        console.error("Error loading site audit links:", error)
        toast({
          title: "Error",
          description: "Failed to load audit links. Please try again.",
          variant: "destructive",
        })
        return []
      }
    },
    [toast],
  )

  const loadSiteAuditNonIndexable = useCallback(
    async (taskId: string) => {
      try {
        console.log("Loading site audit non-indexable pages for task:", taskId)
        const nonIndexable = await getTaskNonIndexable(taskId)
        return nonIndexable
      } catch (error) {
        console.error("Error loading site audit non-indexable pages:", error)
        toast({
          title: "Error",
          description: "Failed to load non-indexable pages. Please try again.",
          variant: "destructive",
        })
        return []
      }
    },
    [toast],
  )

  const value = {
    instantAuditUrl,
    setInstantAuditUrl,
    instantAuditLoading,
    setInstantAuditLoading,
    instantAuditResult,
    setInstantAuditResult,

    siteAuditUrl,
    setSiteAuditUrl,
    siteAuditLoading,
    setSiteAuditLoading,
    siteAuditTasks,
    setSiteAuditTasks,
    selectedTaskId,
    setSelectedTaskId,
    siteAuditResult,
    setSiteAuditResult,

    runInstantAudit,
    clearInstantAuditResults,
    instantAuditResults,
    instantAuditError,

    startSiteAudit,
    setActiveSiteAuditTask,
    activeSiteAuditTask,
    loadSiteAuditSummary,
    clearSiteAuditData,
    updateTaskStatus,
    siteAuditSummary,

    loadSiteAuditPages,
    loadSiteAuditDuplicateTags,
    loadSiteAuditLinks,
    loadSiteAuditNonIndexable,
  }

  return <SeoAuditContext.Provider value={value}>{children}</SeoAuditContext.Provider>
}

// Create a custom hook to use the context
export function useSeoAudit() {
  const context = useContext(SeoAuditContext)
  if (context === undefined) {
    throw new Error("useSeoAudit must be used within a SeoAuditProvider")
  }
  return context
}

