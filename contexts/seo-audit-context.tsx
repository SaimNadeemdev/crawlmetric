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
  startLighthouseAudit,
  getLighthouseResults,
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
  startSiteAudit: (url: string, options: any) => Promise<string>
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
  // Lighthouse audit properties and functions
  lighthouseAuditLoading: boolean
  lighthouseAuditResults: any | null
  lighthouseAuditError: string | null
  startLighthouseAudit: (url: string, options: any) => Promise<any>
  getLighthouseResults: (taskId: string) => Promise<any>
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

  // Lighthouse audit state
  const [lighthouseAuditLoading, setLighthouseAuditLoading] = useState<boolean>(false)
  const [lighthouseAuditResults, setLighthouseAuditResults] = useState<any | null>(null)
  const [lighthouseAuditError, setLighthouseAuditError] = useState<string | null>(null)

  // State for Lighthouse audit polling
  const [lighthousePollingInterval, setLighthousePollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [lighthousePollingTaskId, setLighthousePollingTaskId] = useState<string | null>(null);
  const [lighthousePollingAttempts, setLighthousePollingAttempts] = useState<number>(0);
  const MAX_POLLING_ATTEMPTS = 10; // Maximum number of polling attempts
  const POLLING_INTERVAL = 5000; // 5 seconds between polling attempts

  // Clear any active Lighthouse polling
  const clearLighthousePolling = useCallback(() => {
    if (lighthousePollingInterval) {
      clearInterval(lighthousePollingInterval);
      setLighthousePollingInterval(null);
    }
    setLighthousePollingTaskId(null);
    setLighthousePollingAttempts(0);
  }, [lighthousePollingInterval]);

  // Function to get Lighthouse results
  const handleGetLighthouseResults = useCallback(async (taskId: string) => {
    try {
      setLighthouseAuditLoading(true);
      setLighthouseAuditError(null);

      console.log("Getting Lighthouse results for task ID:", taskId);

      // Call the API function to get the results
      const result = await getLighthouseResults(taskId);
      console.log("Lighthouse results received:", result);

      if (!result.success) {
        // Handle specific error cases
        if (result.error && typeof result.error === 'string') {
          // Handle in-progress status
          if (result.status === "in_progress" || 
              result.error.includes("still processing") || 
              result.error.includes("not available yet")) {
            setLighthouseAuditError("Lighthouse audit results are still processing. Please wait a moment.");
            // Return the error but don't stop polling
            return result;
          } 
          // Handle not found status
          else if (result.status === "not_found" || 
                   result.error.includes("Could not find URL") || 
                   result.error.includes("Not Found") || 
                   result.error.includes("task not found")) {
            setLighthouseAuditError("Could not find the URL or task associated with this audit. The audit may need to be restarted.");
            // This is a terminal error, stop polling
            clearLighthousePolling();
          } 
          // Handle timeout status
          else if (result.error.includes("timeout") || result.error.includes("timed out")) {
            setLighthouseAuditError("The Lighthouse audit timed out. Please try running the audit again.");
            clearLighthousePolling();
          }
          // Handle other errors
          else {
            setLighthouseAuditError(result.error);
            // For other errors, continue polling if we're under the max attempts
          }
        } else {
          setLighthouseAuditError("Failed to fetch Lighthouse results. Please try again.");
        }
        
        return result;
      }

      // Set the results in state
      setLighthouseAuditResults(result);
      setLighthouseAuditLoading(false);
      return result;
    } catch (error) {
      console.error("Error getting Lighthouse results:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setLighthouseAuditError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to get Lighthouse audit results: ${errorMessage}`,
        variant: "destructive",
      });
      return { success: false, error: errorMessage, status: "error" };
    } finally {
      // Only set loading to false if we're not actively polling
      if (!lighthousePollingTaskId || lighthousePollingTaskId !== taskId) {
        setLighthouseAuditLoading(false);
      }
    }
  }, [toast, clearLighthousePolling, lighthousePollingTaskId]);

  // Start polling for Lighthouse results
  const startLighthousePolling = useCallback((taskId: string) => {
    // Clear any existing polling
    clearLighthousePolling();
    
    // Set the task ID we're polling for
    setLighthousePollingTaskId(taskId);
    setLighthousePollingAttempts(0);
    
    console.log(`Starting Lighthouse polling for task ${taskId} with interval ${POLLING_INTERVAL}ms`);
    
    // Create a new polling interval
    const interval = setInterval(async () => {
      // Increment the polling attempts counter
      setLighthousePollingAttempts(prev => {
        const newCount = prev + 1;
        console.log(`Lighthouse polling attempt ${newCount} for task ${taskId}`);
        return newCount;
      });
      
      try {
        // Check if we've reached the maximum number of attempts
        if (lighthousePollingAttempts >= MAX_POLLING_ATTEMPTS) {
          console.log(`Reached maximum polling attempts (${MAX_POLLING_ATTEMPTS}) for task ${taskId}`);
          clearLighthousePolling();
          setLighthouseAuditError("Lighthouse audit timed out after multiple attempts. Please try again later.");
          return;
        }
        
        // Check if the task is ready
        const result = await handleGetLighthouseResults(taskId);
        
        // If we got successful results, stop polling
        if (result.success) {
          console.log(`Successfully retrieved Lighthouse results for task ${taskId}`);
          clearLighthousePolling();
        } else {
          // Check the status to determine if we should continue polling
          if (result.status === "not_found" || 
              (result.error && typeof result.error === 'string' && 
               (result.error.includes("not found") || 
                result.error.includes("Could not find")))) {
            console.log(`Task ${taskId} not found, stopping polling`);
            clearLighthousePolling();
            setLighthouseAuditError("Lighthouse audit not found. The task may have expired or been deleted.");
          } else if (result.status === "error" && 
                     result.error && 
                     typeof result.error === 'string' && 
                     !result.error.includes("still processing") && 
                     !result.error.includes("in progress")) {
            // If we have a non-recoverable error, stop polling
            console.log(`Encountered non-recoverable error for task ${taskId}, stopping polling: ${result.error}`);
            clearLighthousePolling();
          } else {
            // For in_progress status or other recoverable errors, continue polling
            console.log(`Task ${taskId} still in progress, continuing polling (attempt ${lighthousePollingAttempts} of ${MAX_POLLING_ATTEMPTS})`);
            // Adjust polling interval based on the number of attempts (exponential backoff)
            if (lighthousePollingAttempts > 5) {
              if (lighthousePollingInterval) {
                clearInterval(lighthousePollingInterval);
              }
              const newInterval = Math.min(POLLING_INTERVAL * 2, 10000); // Max 10 seconds
              console.log(`Increasing polling interval to ${newInterval}ms`);
              const newIntervalId = setInterval(async () => {
                // This will be called on the next interval
                setLighthousePollingAttempts(prev => {
                  const newCount = prev + 1;
                  console.log(`Lighthouse polling attempt ${newCount} for task ${taskId} (with increased interval)`);
                  return newCount;
                });
                
                try {
                  const result = await handleGetLighthouseResults(taskId);
                  if (result.success) {
                    console.log(`Successfully retrieved Lighthouse results for task ${taskId}`);
                    clearLighthousePolling();
                  } else if (lighthousePollingAttempts >= MAX_POLLING_ATTEMPTS) {
                    console.log(`Reached maximum polling attempts (${MAX_POLLING_ATTEMPTS}) for task ${taskId}`);
                    clearLighthousePolling();
                    setLighthouseAuditError("Lighthouse audit timed out after multiple attempts. Please try again later.");
                  }
                } catch (error) {
                  console.error(`Error in increased interval polling for Lighthouse results:`, error);
                  if (lighthousePollingAttempts >= MAX_POLLING_ATTEMPTS) {
                    clearLighthousePolling();
                    setLighthouseAuditError("Lighthouse audit polling failed after multiple attempts.");
                  }
                }
              }, newInterval);
              setLighthousePollingInterval(newIntervalId);
            }
          }
        }
      } catch (error) {
        console.error(`Error polling for Lighthouse results:`, error);
        
        // If we've reached the maximum number of attempts, stop polling
        if (lighthousePollingAttempts >= MAX_POLLING_ATTEMPTS) {
          clearLighthousePolling();
          setLighthouseAuditError("Lighthouse audit polling failed after multiple attempts.");
        }
      }
    }, POLLING_INTERVAL);
    
    setLighthousePollingInterval(interval);
    
    // Return the task ID for chaining
    return taskId;
  }, [clearLighthousePolling, handleGetLighthouseResults, lighthousePollingAttempts, lighthousePollingInterval]);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (lighthousePollingInterval) {
        clearInterval(lighthousePollingInterval);
      }
    };
  }, [lighthousePollingInterval]);

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
    // Safe check for browser environment
    if (typeof window === 'undefined') return;
    
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
    // Safe check for browser environment
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem("seo_audit_tasks", JSON.stringify(siteAuditTasks))
    } catch (error) {
      console.error("Error saving audit tasks:", error)
    }
  }, [siteAuditTasks])

  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return;
    
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

  const startSiteAudit = useCallback(async (url: string, options: any = {}): Promise<string> => {
    try {
      setSiteAuditLoading(true)

      console.log("Starting site audit for:", url)
      console.log("With options:", options)

      // Call the real API with options
      const taskData = await startFullSiteAudit(url, options)

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
      const errorsData = await getTaskErrors(taskId)
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
      setSiteAuditLoading(true)
      
      const resourcesData = await getTaskResources(taskId, options)
      console.log("Loaded resources data:", resourcesData)
      
      // Extract resources from the nested API response structure
      let resourceItems: ResourceData[] = []
      
      if (resourcesData && resourcesData.success && Array.isArray(resourcesData.data)) {
        // Handle the response from our API route
        resourceItems = resourcesData.data
        console.log(`Found ${resourceItems.length} resources from API route response`)
      } else if (resourcesData && resourcesData.tasks && resourcesData.tasks.length > 0) {
        // Handle the full API response structure
        const task = resourcesData.tasks[0]
        if (task.result && task.result.length > 0) {
          const result = task.result[0]
          resourceItems = result.items || []
          console.log(`Found ${resourceItems.length} resources out of ${result.total_count || 0} total`)
        }
      } else if (resourcesData && Array.isArray(resourcesData.items)) {
        // Handle already extracted items
        resourceItems = resourcesData.items
      } else if (Array.isArray(resourcesData)) {
        // Handle direct array
        resourceItems = resourcesData
      }
      
      console.log("Resource items extracted:", resourceItems.length, "items")
      console.log("First resource item sample:", resourceItems.length > 0 ? JSON.stringify(resourceItems[0]) : "No items")
      setSiteAuditResources(resourceItems)
      return resourceItems
    } catch (error) {
      console.error("Error loading resources data:", error)
      toast({
        title: "Error",
        description: "Failed to load resources data. Please try again.",
        variant: "destructive",
      })
      return []
    } finally {
      setSiteAuditLoading(false)
    }
  }, [toast])

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
        
        // If the crawl is finished, load all necessary data for the report
        if (summary.crawl_progress === "finished" || summary.crawl_progress === "in_progress") {
          // Load initial data for all tabs to ensure we have data ready when the user switches tabs
          await Promise.all([
            loadSiteAuditPages(taskId),
            loadSiteAuditLinks(taskId),
            loadSiteAuditDuplicateTags(taskId),
            loadSiteAuditNonIndexable(taskId),
            loadSiteAuditResources(taskId)
          ])
          
          console.log("All initial data loaded successfully")
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
  }, [loadSiteAuditPages, loadSiteAuditLinks, loadSiteAuditDuplicateTags, loadSiteAuditNonIndexable, loadSiteAuditResources, toast])

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
    // Lighthouse audit properties and functions
    lighthouseAuditLoading,
    lighthouseAuditResults,
    lighthouseAuditError,
    startLighthouseAudit,
    getLighthouseResults: handleGetLighthouseResults,
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
