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
  getTaskDuplicateContent,
  getTaskErrors,
  getTaskResources,
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

// Update the SiteAuditTask interface (around line 43-57)
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
    max_crawl_pages?: number
    max_crawl_depth?: number
  }
  crawl_progress?: string
}

type DuplicateTagData = {
  tag_type: string
  duplicate_value: string
  pages: string[]
}

type DuplicateContentData = {
  url: string
  total_count: number
  pages: {
    similarity: number
    page: {
      url: string
      meta: {
        title: string
        description: string
      }
      content: {
        plain_text_word_count: number
      }
    }
  }[]
}

type ErrorData = {
  id: string
  datetime: string
  function: string
  error_code: number
  error_message: string
  http_url: string
  http_method: string
  http_code: number
  http_time: number
  http_response: string
}

type ResourceData = {
  resource_type: string
  url: string
  size: number
  encoded_size: number
  total_transfer_size: number
  status_code: number
  media_type: string
  content_encoding: string | null
  meta?: {
    alternative_text?: string
    title?: string
    original_width?: number
    original_height?: number
    width?: number
    height?: number
  }
  checks: {
    no_content_encoding?: boolean
    high_loading_time?: boolean
    is_redirect?: boolean
    is_4xx_code?: boolean
    is_5xx_code?: boolean
    is_broken?: boolean
    is_www?: boolean
    is_https?: boolean
    is_http?: boolean
    is_minified?: boolean
    has_subrequests?: boolean
    original_size_displayed?: boolean
  }
  fetch_time: string
  cache_control: {
    cachable: boolean
    ttl: number
  }
}

type LinkData = {
  url: string
  type: "internal" | "external"
  status_code: number
  source_url: string
}

type NonIndexablePageData = {
  url: string
  reason: string
  status_code: number
}

type SeoAuditContextType = {
  instantAuditUrl: string
  setInstantAuditUrl: (url: string) => void
  instantAuditLoading: boolean
  instantAuditResult: AuditResult | null
  instantAuditResults: any | null
  instantAuditError: string | null
  runInstantAudit: (url: string) => Promise<void>
  clearInstantAuditResults: () => void
  siteAuditUrl: string
  setSiteAuditUrl: (url: string) => void
  siteAuditLoading: boolean
  siteAuditTasks: SiteAuditTask[]
  siteAuditResult: any | null
  siteAuditSummary: any | null
  activeSiteAuditTask: string | null
  setActiveSiteAuditTask: (taskId: string | null) => void
  startSiteAudit: (url: string) => Promise<string>
  loadSiteAuditSummary: (taskId: string) => Promise<void>
  updateTaskStatus: (taskId: string, status: any) => void
  loadSiteAuditPages: (taskId: string) => Promise<any>
  loadSiteAuditDuplicateTags: (taskId: string) => Promise<DuplicateTagData[]>
  loadSiteAuditLinks: (taskId: string) => Promise<LinkData[]>
  loadSiteAuditNonIndexable: (taskId: string) => Promise<NonIndexablePageData[]>
  loadSiteAuditDuplicateContent: (taskId: string) => Promise<DuplicateContentData[]>
  loadSiteAuditErrors: (taskId: string) => Promise<ErrorData[]>
  loadSiteAuditResources: (taskId: string, options?: any) => Promise<ResourceData[]>
  siteAuditPages: any | null
  siteAuditDuplicateTags: DuplicateTagData[] | null
  siteAuditLinks: LinkData[] | null
  siteAuditNonIndexable: NonIndexablePageData[] | null
  siteAuditDuplicateContent: DuplicateContentData[] | null
  siteAuditErrors: ErrorData[] | null
  siteAuditResources: ResourceData[] | null
}

// Create the context
const SeoAuditContext = createContext<SeoAuditContextType | undefined>(undefined)

// Create a provider component
export function SeoAuditProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  const [instantAuditUrl, setInstantAuditUrl] = useState<string>("")
  const [instantAuditLoading, setInstantAuditLoading] = useState<boolean>(false)
  const [instantAuditResult, setInstantAuditResult] = useState<AuditResult | null>(null)
  const [instantAuditResults, setInstantAuditResults] = useState<any | null>(null)
  const [instantAuditError, setInstantAuditError] = useState<string | null>(null)

  const [siteAuditUrl, setSiteAuditUrl] = useState<string>("")
  const [siteAuditLoading, setSiteAuditLoading] = useState<boolean>(false)
  const [siteAuditTasks, setSiteAuditTasks] = useState<SiteAuditTask[]>([])
  const [siteAuditResult, setSiteAuditResult] = useState<any | null>(null)
  const [siteAuditSummary, setSiteAuditSummary] = useState<any | null>(null)
  const [activeSiteAuditTask, setActiveSiteAuditTaskState] = useState<string | null>(null)
  
  const [siteAuditPages, setSiteAuditPages] = useState<any | null>(null)
  const [siteAuditDuplicateTags, setSiteAuditDuplicateTags] = useState<DuplicateTagData[] | null>(null)
  const [siteAuditLinks, setSiteAuditLinks] = useState<LinkData[] | null>(null)
  const [siteAuditNonIndexable, setSiteAuditNonIndexable] = useState<NonIndexablePageData[] | null>(null)
  const [siteAuditDuplicateContent, setSiteAuditDuplicateContent] = useState<DuplicateContentData[] | null>(null)
  const [siteAuditErrors, setSiteAuditErrors] = useState<ErrorData[] | null>(null)
  const [siteAuditResources, setSiteAuditResources] = useState<ResourceData[] | null>(null)

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
        setActiveSiteAuditTaskState(activeTask)
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
  const runInstantAudit = useCallback(async (url: string) => {
    try {
      setInstantAuditLoading(true)
      setInstantAuditError(null)

      console.log("Running instant audit for URL:", url)

      // Call the real API
      const result = await runInstantPageAudit(url)
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

  const startSiteAudit = useCallback(async (url: string): Promise<string> => {
    try {
      setSiteAuditLoading(true)

      console.log("Starting site audit for:", url)

      // Call the real API
      const taskData = await startFullSiteAudit(url)

      // Add the task to the list with proper type casting
      setSiteAuditTasks((prev) => [{
        ...taskData,
        // Map any status string to one of the allowed values
        status: (taskData.status === "finished" ? "completed" : 
                taskData.status === "in_progress" ? "running" : 
                taskData.status === "error" ? "failed" : 
                "pending") as "pending" | "running" | "completed" | "failed"
      }, ...prev])

      return taskData.id
    } catch (error) {
      console.error("Error starting site audit:", error)
      throw error
    } finally {
      setSiteAuditLoading(false)
    }
  }, [])

  const loadSiteAuditSummary = useCallback(async (taskId: string): Promise<void> => {
    try {
      setSiteAuditLoading(true)

      console.log("Loading site audit summary for task:", taskId)

      // Call the real API
      const summary = await getTaskSummary(taskId)
      
      // Debug log to help diagnose issues
      console.log("Extracted summary result:", JSON.stringify(summary))
      
      // Check if we have a valid summary with required fields
      if (summary && typeof summary === 'object') {
        console.log("Setting site audit summary in state:", summary.crawl_progress)
        setSiteAuditSummary(summary)
        
        // If the crawl is finished, we don't need to poll anymore
        if (summary.crawl_progress === "finished") {
          console.log("Crawl is finished, stopping polling")
        }
      } else {
        console.warn("Invalid summary data received:", summary)
        toast({
          title: "Warning",
          description: "Received incomplete data from the API. Some information may be missing.",
          variant: "default",
        })
      }
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

  const updateTaskStatus = useCallback((taskId: string, status: any) => {
    setSiteAuditTasks((prev) => prev.map((task) => {
      if (task.id === taskId) {
        // Create a properly typed status if it exists in the update
        const updatedStatus = status.status ? 
          (status.status === "finished" ? "completed" : 
           status.status === "in_progress" ? "running" : 
           status.status === "error" ? "failed" : 
           "pending") as "pending" | "running" | "completed" | "failed" 
          : task.status;
        
        return { 
          ...task, 
          ...status,
          status: updatedStatus
        };
      }
      return task;
    }))
  }, [])

// In the loadSiteAuditPages function (around line 380-400)
const loadSiteAuditPages = useCallback(
  async (taskId: string) => {
    try {
      console.log("Loading site audit pages for task:", taskId)
      setSiteAuditLoading(true)
      
      // Find the task to get its max_crawl_pages
      const task = siteAuditTasks.find(t => t.id === taskId);
      const maxPages = task?.data?.max_crawl_pages || 100;
      
      console.log(`Using maxPages: ${maxPages} for task ${taskId}`);
      
      // Pass maxPages to getTaskPages
      const pages = await getTaskPages(taskId, 100, 0, maxPages);
      setSiteAuditPages(pages);
      return pages;
    } catch (error) {
      console.error("Error loading site audit pages:", error)
      toast({
        title: "Error",
        description: "Failed to load audit pages. Please try again.",
        variant: "destructive",
      })
      return []
    } finally {
      setSiteAuditLoading(false)
    }
  },
  [siteAuditTasks, toast]
)

  const loadSiteAuditDuplicateTags = useCallback(
    async (taskId: string): Promise<DuplicateTagData[]> => {
      try {
        console.log("Loading site audit duplicate tags for task:", taskId)
        setSiteAuditLoading(true)
        const duplicateTags = await getTaskDuplicateTags(taskId)
        
        // Debug the raw API response
        console.log("Raw duplicate tags data from API:", JSON.stringify(duplicateTags, null, 2))
        
        // Check if duplicateTags is an array
        if (!Array.isArray(duplicateTags)) {
          console.error("Duplicate tags data is not an array:", duplicateTags)
          setSiteAuditLoading(false)
          setSiteAuditDuplicateTags([])
          return []
        }
        
        // Ensure the data has the correct shape
        const typedDuplicateTags: DuplicateTagData[] = duplicateTags.map((tag: any) => {
          console.log("Processing duplicate tag item:", tag)
          return {
            tag_type: tag.tag_type || 'title',
            duplicate_value: tag.duplicate_value || '',
            pages: Array.isArray(tag.pages) ? tag.pages : []
          }
        });
        
        console.log("Processed duplicate tags data:", JSON.stringify(typedDuplicateTags, null, 2))
        setSiteAuditDuplicateTags(typedDuplicateTags)
        return typedDuplicateTags
      } catch (error) {
        console.error("Error loading site audit duplicate tags:", error)
        toast({
          title: "Error",
          description: "Failed to load duplicate tags. Please try again.",
          variant: "destructive",
        })
        setSiteAuditDuplicateTags([])
        return []
      } finally {
        setSiteAuditLoading(false)
      }
    },
    [toast],
  )

  const loadSiteAuditLinks = useCallback(
    async (taskId: string): Promise<LinkData[]> => {
      try {
        console.log("Loading site audit links for task:", taskId)
        setSiteAuditLoading(true)
        const links = await getTaskLinks(taskId)
        
        // Debug the raw API response
        console.log("Raw links data from API:", JSON.stringify(links, null, 2))
        
        // Check if links is an array
        if (!Array.isArray(links)) {
          console.error("Links data is not an array:", links)
          setSiteAuditLoading(false)
          return []
        }
        
        // Ensure the data has the correct shape
        const typedLinks: LinkData[] = links.map((link: any) => {
          console.log("Processing link item:", link)
          return {
            url: link.url || '',
            type: link.type === "internal" ? "internal" : "external",
            status_code: link.status_code || 0,
            source_url: link.source_url || ''
          }
        });
        
        console.log("Processed links data:", JSON.stringify(typedLinks, null, 2))
        setSiteAuditLinks(typedLinks)
        return typedLinks
      } catch (error) {
        console.error("Error loading site audit links:", error)
        toast({
          title: "Error",
          description: "Failed to load links. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setSiteAuditLoading(false)
      }
    },
    [toast],
  )

  const loadSiteAuditNonIndexable = useCallback(
    async (taskId: string): Promise<NonIndexablePageData[]> => {
      try {
        console.log("Loading site audit non-indexable pages for task:", taskId)
        setSiteAuditLoading(true)
        const nonIndexable = await getTaskNonIndexable(taskId)
        
        // Debug the raw API response
        console.log("Raw non-indexable data from API:", JSON.stringify(nonIndexable, null, 2))
        
        // Check if nonIndexable is an array
        if (!Array.isArray(nonIndexable)) {
          console.error("Non-indexable data is not an array:", nonIndexable)
          setSiteAuditLoading(false)
          return []
        }
        
        // Ensure the data has the correct shape
        const typedNonIndexable: NonIndexablePageData[] = nonIndexable.map((page: any) => {
          console.log("Processing non-indexable item:", page)
          return {
            url: page.url || '',
            reason: page.reason || 'Unknown reason',
            status_code: page.status_code || 0
          }
        });
        
        console.log("Processed non-indexable data:", JSON.stringify(typedNonIndexable, null, 2))
        setSiteAuditNonIndexable(typedNonIndexable)
        return typedNonIndexable
      } catch (error) {
        console.error("Error loading site audit non-indexable pages:", error)
        toast({
          title: "Error",
          description: "Failed to load non-indexable pages. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setSiteAuditLoading(false)
      }
    },
    [toast],
  )

  const loadSiteAuditDuplicateContent = useCallback(
    async (taskId: string): Promise<DuplicateContentData[]> => {
      try {
        console.log("Loading site audit duplicate content for task:", taskId)
        setSiteAuditLoading(true)
        const duplicateContent = await getTaskDuplicateContent(taskId)
        
        // Debug the raw API response
        console.log("Raw duplicate content data from API:", JSON.stringify(duplicateContent, null, 2))
        
        // Check if duplicateContent is an array
        if (!Array.isArray(duplicateContent)) {
          console.error("Duplicate content data is not an array:", duplicateContent)
          setSiteAuditLoading(false)
          return []
        }
        
        // Ensure the data has the correct shape
        const typedDuplicateContent: DuplicateContentData[] = duplicateContent.map((content: any) => {
          console.log("Processing duplicate content item:", content)
          return {
            url: content.url || '',
            total_count: content.total_count || 0,
            pages: Array.isArray(content.pages) ? content.pages.map((page: any) => ({
              similarity: page.similarity || 0,
              page: {
                url: page.page.url || '',
                meta: {
                  title: page.page.meta.title || '',
                  description: page.page.meta.description || ''
                },
                content: {
                  plain_text_word_count: page.page.content.plain_text_word_count || 0
                }
              }
            })) : []
          }
        });
        
        console.log("Processed duplicate content data:", JSON.stringify(typedDuplicateContent, null, 2))
        setSiteAuditDuplicateContent(typedDuplicateContent)
        return typedDuplicateContent
      } catch (error) {
        console.error("Error loading site audit duplicate content:", error)
        toast({
          title: "Error",
          description: "Failed to load duplicate content. Please try again.",
          variant: "destructive",
        })
        return []
      } finally {
        setSiteAuditLoading(false)
      }
    },
    [toast],
  )

  const loadSiteAuditErrors = useCallback(async (taskId: string): Promise<ErrorData[]> => {
    if (!taskId) {
      console.error("No task ID provided for loading errors")
      return []
    }

    try {
      console.log("Loading errors data for task:", taskId)
      const options = {
        limit: 100,
        offset: 0
      }
      
      const errorsData = await getTaskErrors(taskId, options)
      console.log("Loaded errors data:", errorsData)
      
      setSiteAuditErrors(errorsData)
      return errorsData
    } catch (error) {
      console.error("Error loading errors data:", error)
      toast({
        title: "Error",
        description: "Failed to load errors data. Please try again.",
        variant: "destructive",
      })
      return []
    }
  }, [toast])

  const loadSiteAuditResources = useCallback(async (taskId: string, options: any = {}): Promise<ResourceData[]> => {
    if (!taskId) {
      console.error("No task ID provided for loading resources")
      return []
    }

    try {
      console.log("Loading resources data for task:", taskId, "with options:", options)
      
      const resourcesData = await getTaskResources(taskId, options)
      console.log("Loaded resources data:", resourcesData)
      
      setSiteAuditResources(resourcesData.items || [])
      return resourcesData.items || []
    } catch (error) {
      console.error("Error loading resources data:", error)
      toast({
        title: "Error",
        description: "Failed to load resources data. Please try again.",
        variant: "destructive",
      })
      return []
    }
  }, [toast])

  const setActiveSiteAuditTask = useCallback((taskId: string | null) => {
    console.log("Setting active site audit task:", taskId)
    setActiveSiteAuditTaskState(taskId)
    
    // Immediately load the summary when a task is set as active
    if (taskId) {
      loadSiteAuditSummary(taskId)
    } else {
      // Clear summary data if no task is selected
      setSiteAuditSummary(null)
    }
  }, [loadSiteAuditSummary])

  const value = {
    instantAuditUrl,
    setInstantAuditUrl,
    instantAuditLoading,
    instantAuditResult,
    instantAuditResults,
    instantAuditError,
    runInstantAudit,
    clearInstantAuditResults,
    siteAuditUrl,
    setSiteAuditUrl,
    siteAuditLoading,
    siteAuditTasks,
    siteAuditResult,
    siteAuditSummary,
    activeSiteAuditTask,
    setActiveSiteAuditTask,
    startSiteAudit,
    loadSiteAuditSummary,
    updateTaskStatus,
    loadSiteAuditPages,
    loadSiteAuditDuplicateTags,
    loadSiteAuditLinks,
    loadSiteAuditNonIndexable,
    loadSiteAuditDuplicateContent,
    loadSiteAuditErrors,
    loadSiteAuditResources,
    siteAuditPages,
    siteAuditDuplicateTags,
    siteAuditLinks,
    siteAuditNonIndexable,
    siteAuditDuplicateContent,
    siteAuditErrors,
    siteAuditResources,
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
