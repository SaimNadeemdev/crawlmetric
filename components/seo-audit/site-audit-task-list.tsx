"use client"

import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Clock, CheckCircle2, AlertCircle, XCircle, ChevronRight, BarChart3 } from "lucide-react"
import { cn, formatTimeAgo } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define an extended SiteAuditTask type that includes both context properties and API response properties
interface ExtendedSiteAuditTask {
  id: string
  url?: string
  status: "pending" | "running" | "completed" | "failed" | string // Allow for API status values
  progress?: number
  createdAt?: string
  completedAt?: string
  status_code?: number
  status_message?: string
  time?: string
  data?: {
    target: string
  }
  // Additional properties from API responses
  target?: string
  pages_crawled?: number
  max_crawl_pages?: number
  issues_count?: number
  crawl_progress?: string
}

export function SiteAuditTaskList() {
  const { 
    siteAuditTasks, 
    startSiteAudit, 
    siteAuditLoading, 
    setActiveSiteAuditTask,
    activeSiteAuditTask 
  } = useSeoAudit()

  // Sort tasks by creation date (newest first)
  const sortedTasks = [...siteAuditTasks].sort((a, b) => {
    const bDate = b.time || b.createdAt || "";
    const aDate = a.time || a.createdAt || "";
    
    // Safely parse dates with validation
    const bTimestamp = bDate ? Date.parse(bDate) : 0;
    const aTimestamp = aDate ? Date.parse(aDate) : 0;
    
    // If either date is invalid, use the current time for that item
    // This ensures consistent sorting even with invalid dates
    const bTime = isNaN(bTimestamp) ? Date.now() : bTimestamp;
    const aTime = isNaN(aTimestamp) ? Date.now() : aTimestamp;
    
    return bTime - aTime;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-50"
      case "in_progress":
      case "running":
        return "text-blue-500 bg-blue-50"
      case "queued":
      case "pending":
        return "text-amber-500 bg-amber-50"
      case "failed":
        return "text-red-500 bg-red-50"
      default:
        return "text-gray-500 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />
      case "in_progress":
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "queued":
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Use a different name for the local function to avoid conflict with the imported utility
  const formatTaskTime = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date"
    
    // Debug log to identify problematic date strings
    console.log("Date string to format:", JSON.stringify(dateString));
    
    // Use the robust utility function from utils.ts
    return formatTimeAgo(dateString);
  }

  // Function to handle refresh - we can't directly use startSiteAudit as it requires parameters
  const handleRefresh = () => {
    // This is just a placeholder to satisfy TypeScript
    // In a real implementation, we would need a proper refresh function
    console.log("Refresh requested");
  }

  // Generate a unique key for each task
  const getTaskKey = (task: any, index: number) => {
    // Use id if available, otherwise use a combination of other properties or index as fallback
    if (task.id) return task.id;
    
    // Try to create a unique key from other properties
    const targetKey = task.target || (task.data && task.data.target);
    const timeKey = task.time || task.createdAt;
    
    if (targetKey && timeKey) {
      return `${targetKey}-${timeKey}`;
    }
    
    // Last resort: use index, but prefix it to avoid conflicts with actual IDs
    return `task-index-${index}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-[#0071e3]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Recent Audits</CardTitle>
                <CardDescription className="text-gray-500">
                  View and manage your recent site audits
                </CardDescription>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={siteAuditLoading}
                    className="h-9 w-9 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#0071e3] transition-all duration-200"
                  >
                    <RefreshCw className={cn("h-4 w-4", siteAuditLoading && "animate-spin")} />
                    <span className="sr-only">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-white p-2 rounded-xl border border-gray-100 shadow-lg">
                  <p className="text-sm text-gray-700">Refresh audit list</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          <AnimatePresence mode="wait">
            {sortedTasks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No audits yet</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Start a new site audit to analyze your website's SEO performance
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {sortedTasks.map((task, index) => {
                  // Cast task to our extended type to satisfy TypeScript
                  const extendedTask = task as unknown as ExtendedSiteAuditTask;
                  
                  // Safely access properties with fallbacks
                  const taskId = extendedTask?.id || `unknown-task-${index}`;
                  const taskStatus = extendedTask?.status || "unknown";
                  const taskTarget = extendedTask?.target || 
                                    (extendedTask?.data && extendedTask?.data?.target) || 
                                    "Unknown target";
                  
                  // Generate a unique key for this task
                  const taskKey = getTaskKey(extendedTask, index);
                  
                  return (
                    <motion.div
                      key={taskKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          "group relative p-4 rounded-xl border border-gray-100 transition-all duration-200 cursor-pointer",
                          activeSiteAuditTask === taskId
                            ? "bg-[#0071e3]/5 border-[#0071e3]/20"
                            : "bg-white hover:bg-gray-50"
                        )}
                        onClick={() => setActiveSiteAuditTask(taskId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1 border-0",
                                  getStatusColor(taskStatus)
                                )}
                              >
                                {getStatusIcon(taskStatus)}
                                <span className="capitalize">{taskStatus.replace("_", " ")}</span>
                              </Badge>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {taskTarget}
                                </h3>
                                {extendedTask?.pages_crawled && extendedTask.pages_crawled > 0 && (
                                  <span className="text-xs text-gray-500">
                                    ({extendedTask.pages_crawled} pages)
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Started {formatTaskTime(extendedTask?.time || extendedTask?.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-500 text-right">
                              {extendedTask?.status === "completed" && (
                                <span className="font-medium text-gray-700">
                                  {extendedTask.issues_count || 0} issues found
                                </span>
                              )}
                              {(extendedTask?.status === "in_progress" || extendedTask?.status === "running") && 
                                extendedTask?.pages_crawled && extendedTask.max_crawl_pages && (
                                <span className="font-medium text-[#0071e3]">
                                  {Math.round((extendedTask.pages_crawled / extendedTask.max_crawl_pages) * 100)}% complete
                                </span>
                              )}
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#0071e3] transition-colors duration-200" />
                          </div>
                        </div>
                        
                        {(extendedTask?.status === "in_progress" || extendedTask?.status === "running") && 
                          extendedTask?.pages_crawled && extendedTask.max_crawl_pages && (
                          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              className="h-full bg-[#0071e3]"
                              initial={{ width: "0%" }}
                              animate={{ 
                                width: `${Math.round((extendedTask.pages_crawled / extendedTask.max_crawl_pages) * 100)}%` 
                              }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
