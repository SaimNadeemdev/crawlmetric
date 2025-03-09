"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle, Clock } from "lucide-react"
import { format, isValid } from "date-fns"
import { checkTaskStatus } from "@/lib/dataforseo-api"

export function SiteAuditTaskList() {
  const {
    siteAuditTasks,
    activeSiteAuditTask,
    setActiveSiteAuditTask,
    loadSiteAuditSummary,
    clearSiteAuditData,
    updateTaskStatus,
    siteAuditSummary,
  } = useSeoAudit()
  const [refreshing, setRefreshing] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckedRef = useRef<Record<string, number>>({})
  const initialCheckDelayRef = useRef<boolean>(true)

  // Function to refresh task statuses
  const refreshTasks = useCallback(async () => {
    if (refreshing) return // Prevent concurrent refreshes

    setRefreshing(true)
    console.log("Refreshing task statuses...")
    console.log(new Date().toISOString())

    try {
      for (const task of siteAuditTasks) {
        // Only check status for tasks that aren't marked as completed
        // or tasks that don't have crawl_progress="finished"
        if (task.status_code !== 3 || task.crawl_progress !== "finished") {
          console.log(`Checking status for task: ${task.id}`)

          try {
            // Use the checkTaskStatus function directly
            const status = await checkTaskStatus(task.id)

            // Update the task status in the context
            if (status) {
              updateTaskStatus(task.id, status)
              lastCheckedRef.current[task.id] = Date.now()

              // If the task is completed (status_code=3 or crawl_progress="finished") and it's the active task, load the summary
              if (
                (status.status_code === 3 || status.crawl_progress === "finished") &&
                activeSiteAuditTask === task.id
              ) {
                console.log(`Task ${task.id} completed, loading summary automatically`)
                // Use a small delay to ensure the UI updates first
                setTimeout(() => {
                  loadSiteAuditSummary(task.id)
                }, 500)
              }
            }
          } catch (error) {
            console.error(`Error checking status for task ${task.id}:`, error)
          }
        } else if (
          (task.status_code === 3 || task.crawl_progress === "finished") &&
          activeSiteAuditTask === task.id &&
          !siteAuditSummary
        ) {
          // If the task is already completed but we don't have the summary, load it
          console.log(`Task ${task.id} is completed but summary not loaded, loading now`)
          setTimeout(() => {
            loadSiteAuditSummary(task.id)
          }, 500)
        }
      }
    } catch (error) {
      console.error("Error refreshing tasks:", error)
    } finally {
      setRefreshing(false)
    }
  }, [refreshing, siteAuditTasks, activeSiteAuditTask, siteAuditSummary, updateTaskStatus, loadSiteAuditSummary])

  // Set up polling for task status every 10 seconds
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Start a new interval that runs every 10 seconds
    pollingIntervalRef.current = setInterval(() => {
      console.log("Auto-checking task statuses...")

      // Only start checking after a delay on initial load
      if (initialCheckDelayRef.current) {
        console.log("Skipping initial check to allow API time to process")
        initialCheckDelayRef.current = false
        return
      }

      refreshTasks()
    }, 10000) // 10 seconds

    // Don't run immediately on mount - wait for the first interval
    // This prevents immediate server errors after starting an audit

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [refreshTasks]) // Only depend on refreshTasks

  // Handle task selection
  const handleSelectTask = async (taskId: string) => {
    clearSiteAuditData()
    setActiveSiteAuditTask(taskId)

    // Check if the task is completed before loading summary
    const task = siteAuditTasks.find((t) => t.id === taskId)
    if (task && (task.status_code === 3 || task.crawl_progress === "finished")) {
      await loadSiteAuditSummary(taskId)
    }
  }

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return isValid(date) ? format(date, "MMM d, yyyy h:mm a") : "Invalid date"
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  if (siteAuditTasks.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Recent Audits</CardTitle>
          <p className="text-sm text-muted-foreground">Select an audit to view results</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshTasks} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {siteAuditTasks.map((task) => {
            // Determine status badge
            let statusBadge

            // Check both status_code and crawl_progress
            const isCompleted = task.status_code === 3 || task.crawl_progress === "finished"

            switch (true) {
              case task.status_code === 0:
                statusBadge = <Badge variant="destructive">Failed</Badge>
                break
              case isCompleted:
                statusBadge = (
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )
                break
              case task.status_code === 1:
                statusBadge = (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )
                break
              case task.status_code === 2:
                statusBadge = (
                  <Badge variant="secondary">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    In Progress
                  </Badge>
                )
                break
              default:
                statusBadge = <Badge variant="outline">Unknown</Badge>
            }

            // Safely get the domain name
            const domainName = task.data?.target || "Unknown Domain"

            // Safely format the date
            const formattedDate = task.time ? safeFormatDate(task.time) : "Unknown date"

            return (
              <div
                key={task.id}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  activeSiteAuditTask === task.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                }`}
                onClick={() => handleSelectTask(task.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{domainName}</span>
                    <span className="text-xs text-muted-foreground">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">{statusBadge}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

