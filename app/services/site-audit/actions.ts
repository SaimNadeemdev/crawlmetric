"use server"

import { revalidatePath } from "next/cache"

// Types for DataForSEO API
type DataForSEOResponse = {
  status_code: number
  status_message: string
  tasks?: {
    id: string
    status_code: number
    status_message: string
    data?: any
  }[]
  error?: string
}

// Start a site audit
export async function startSiteAudit(url: string) {
  try {
    // Validate URL format
    try {
      new URL(url)
    } catch (e) {
      return { success: false, error: "Invalid URL format" }
    }

    // DataForSEO API credentials
    const username = process.env.DATAFORSEO_USERNAME
    const password = process.env.DATAFORSEO_PASSWORD

    if (!username || !password) {
      return { success: false, error: "API credentials not configured" }
    }

    // Base64 encode credentials
    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Prepare the request to DataForSEO On-Page API
    const response = await fetch("https://api.dataforseo.com/v3/on_page/task_post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify([
        {
          target: url,
          max_crawl_pages: 100, // Limit the number of pages to crawl
          load_resources: true,
          enable_javascript: true,
          custom_js: "meta = {}; meta.url = document.URL; meta;",
        },
      ]),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      }
    }

    const data: DataForSEOResponse = await response.json()

    if (data.status_code !== 20000) {
      return {
        success: false,
        error: data.status_message || "API returned an error",
      }
    }

    if (!data.tasks || data.tasks.length === 0) {
      return { success: false, error: "No task was created" }
    }

    const taskId = data.tasks[0].id

    // Revalidate the path to ensure fresh data
    revalidatePath("/services/site-audit")

    return { success: true, taskId }
  } catch (error) {
    console.error("Site audit error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Get site audit results
export async function getSiteAuditResults(taskId: string) {
  try {
    // DataForSEO API credentials
    const username = process.env.DATAFORSEO_USERNAME
    const password = process.env.DATAFORSEO_PASSWORD

    if (!username || !password) {
      return { success: false, error: "API credentials not configured" }
    }

    // Base64 encode credentials
    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Fetch the task result
    const response = await fetch(`https://api.dataforseo.com/v3/on_page/task_get/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      }
    }

    const data: DataForSEOResponse = await response.json()

    if (data.status_code !== 20000) {
      return {
        success: false,
        error: data.status_message || "API returned an error",
      }
    }

    if (!data.tasks || data.tasks.length === 0) {
      return { success: false, error: "No task data found" }
    }

    const taskData = data.tasks[0]

    // Check if the task is still in progress
    if (taskData.status_code === 20100) {
      return { success: true, status: "in_progress" }
    }

    // Check if the task has failed
    if (taskData.status_code !== 20000) {
      return {
        success: false,
        error: taskData.status_message || "Task failed",
      }
    }

    // Return the task data
    return {
      success: true,
      status: "complete",
      data: taskData.data,
    }
  } catch (error) {
    console.error("Get site audit results error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Get detailed site audit summary
export async function getSiteAuditSummary(taskId: string) {
  try {
    // DataForSEO API credentials
    const username = process.env.DATAFORSEO_USERNAME
    const password = process.env.DATAFORSEO_PASSWORD

    if (!username || !password) {
      return { success: false, error: "API credentials not configured" }
    }

    // Base64 encode credentials
    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Fetch the summary
    const response = await fetch(`https://api.dataforseo.com/v3/on_page/summary/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      }
    }

    const data: DataForSEOResponse = await response.json()

    if (data.status_code !== 20000) {
      return {
        success: false,
        error: data.status_message || "API returned an error",
      }
    }

    if (!data.tasks || data.tasks.length === 0) {
      return { success: false, error: "No summary data found" }
    }

    const summaryData = data.tasks[0].data

    return {
      success: true,
      data: summaryData,
    }
  } catch (error) {
    console.error("Get site audit summary error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Get pages with issues
export async function getPagesWithIssues(taskId: string) {
  try {
    // DataForSEO API credentials
    const username = process.env.DATAFORSEO_USERNAME
    const password = process.env.DATAFORSEO_PASSWORD

    if (!username || !password) {
      return { success: false, error: "API credentials not configured" }
    }

    // Base64 encode credentials
    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Fetch pages with issues
    const response = await fetch(`https://api.dataforseo.com/v3/on_page/pages/${taskId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify([
        {
          limit: 100,
          filters: [["checks.critical_issues", ">", 0], "or", ["checks.warnings", ">", 0]],
        },
      ]),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      }
    }

    const data: DataForSEOResponse = await response.json()

    if (data.status_code !== 20000) {
      return {
        success: false,
        error: data.status_message || "API returned an error",
      }
    }

    if (!data.tasks || data.tasks.length === 0) {
      return { success: false, error: "No pages with issues found" }
    }

    const pagesData = data.tasks[0].data

    return {
      success: true,
      data: pagesData,
    }
  } catch (error) {
    console.error("Get pages with issues error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

