"use server"

import { getBaseUrl } from "@/lib/utils"

// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

// Helper function for API requests
async function makeRequest(endpoint: string, method = "GET", body?: any) {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Basic ${AUTH_HEADER}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DataForSEO API error: ${response.status} ${errorText}`)
      return { error: `API error: ${response.status}` }
    }

    return await response.json()
  } catch (error) {
    console.error("DataForSEO API request failed:", error)
    return { error: "Request failed" }
  }
}

// Function to run an instant page audit
export async function runInstantPageAudit(url: string, options: any = {}) {
  try {
    const baseUrl = getBaseUrl()
    const endpoint = `${baseUrl}/api/seo-audit/instant-page-audit?url=${encodeURIComponent(url)}`
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Audit results received:", JSON.stringify(data).substring(0, 1000) + "...")
    return data
  } catch (error) {
    console.error("Error running instant page audit:", error)
    throw error
  }
}

// Function to start a full site audit
export async function startFullSiteAudit(target: string, options: any = {}) {
  try {
    const baseUrl = getBaseUrl()
    const endpoint = `${baseUrl}/api/seo-audit/start-site-audit`
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target,
        ...options,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Full site audit response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the task ID from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].id) {
      return {
        id: data.tasks[0].id,
        status_code: data.tasks[0].status_code,
        status_message: data.tasks[0].status_message,
        time: data.tasks[0].time,
        data: {
          target: target,
        },
      }
    }

    throw new Error("No task ID found in API response")
  } catch (error) {
    console.error("Error starting site audit:", error)
    throw error
  }
}

// Function to check the status of a task
export async function checkTaskStatus(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Checking status for task ID: ${taskId}`)

    // First, try to get the summary directly to check crawl_progress
    try {
      const summaryResponse = await fetch(`${baseUrl}/api/seo-audit/get-summary?taskId=${encodeURIComponent(taskId)}`)

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        console.log(`Summary check for ${taskId}:`, JSON.stringify(summaryData).substring(0, 200))

        // Check if we have result data with crawl_progress
        if (
          summaryData.tasks &&
          summaryData.tasks.length > 0 &&
          summaryData.tasks[0].result &&
          summaryData.tasks[0].result.length > 0
        ) {
          const result = summaryData.tasks[0].result[0]

          // If crawl_progress is "finished", the task is complete
          if (result.crawl_progress === "finished") {
            console.log(`Task ${taskId} is complete (crawl_progress: finished)`)
            return {
              id: taskId,
              status_code: 3, // Completed
              status_message: "Completed",
              time: new Date().toISOString(),
              crawl_progress: "finished",
            }
          }

          console.log(`Task ${taskId} crawl_progress: ${result.crawl_progress}`)

          // If we have crawl_progress but it's not "finished", it's still in progress
          if (result.crawl_progress) {
            return {
              id: taskId,
              status_code: 2, // In progress
              status_message: "In progress",
              time: new Date().toISOString(),
              crawl_progress: result.crawl_progress,
            }
          }
        }
      }
    } catch (summaryError) {
      console.error(`Error checking summary for task ${taskId}:`, summaryError)
    }

    // If we couldn't determine status from summary, fall back to checking task status
    const response = await fetch(`${baseUrl}/api/seo-audit/check-status?taskId=${encodeURIComponent(taskId)}`)

    // Log the full response for debugging
    const responseText = await response.text()
    console.log(`Task status response for ${taskId} (status ${response.status}):`, responseText.substring(0, 200))

    if (!response.ok) {
      console.error(`Error checking task status: ${response.status}`, responseText)

      // Return a default "in progress" status
      return {
        id: taskId,
        status_code: 2, // In progress
        status_message: "In progress",
        time: new Date().toISOString(),
        crawl_progress: "in_progress",
      }
    }

    // Parse the response as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Error parsing task status response:", parseError)
      return {
        id: taskId,
        status_code: 2, // In progress
        status_message: "In progress",
        time: new Date().toISOString(),
        crawl_progress: "in_progress",
      }
    }

    // Extract the task from the response
    if (data.tasks && data.tasks.length > 0) {
      return data.tasks[0]
    }

    // If we still don't have a task, return a default status
    return {
      id: taskId,
      status_code: 2, // In progress
      status_message: "In progress",
      time: new Date().toISOString(),
      crawl_progress: "in_progress",
    }
  } catch (error) {
    console.error("Error checking task status:", error)
    // Return a default status instead of throwing
    return {
      id: taskId,
      status_code: 2, // In progress
      status_message: "In progress",
      time: new Date().toISOString(),
      crawl_progress: "in_progress",
    }
  }
}

// Function to get task summary
export async function getTaskSummary(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting summary for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/get-summary?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task summary: ${response.status}`, errorText)

      // Return a default summary instead of throwing
      return {
        crawl_progress: "in_progress",
        crawl_status: {
          status_code: 2,
          status_message: "In progress",
          max_crawl_pages: 0,
          pages_in_queue: 0,
          pages_crawled: 0,
        },
        domain_info: {
          name: taskId.split("_")[0] || "Unknown Domain",
        },
        pages_crawled: 0,
        pages_count: 0,
        page_metrics: {
          broken_resources: 0,
          broken_links: 0,
          duplicate_title: 0,
          duplicate_description: 0,
          duplicate_content: 0,
          https_pages: 0,
          links_external: 0,
          links_internal: 0,
          non_indexable: 0,
          onpage_score: 0,
        },
      }
    }

    const data = await response.json()
    console.log("Task summary response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result[0]
      console.log("Extracted summary result:", JSON.stringify(result).substring(0, 500) + "...")

      // Format the data to match the expected structure, using the exact field names from the API response
      return {
        crawl_progress: result.crawl_progress || "in_progress",
        crawl_stop_reason: result.crawl_stop_reason || null,
        crawl_status: {
          status_code: result.crawl_status?.status_code || 2,
          status_message: result.crawl_status?.status_message || "In progress",
          max_crawl_pages: result.crawl_status?.max_crawl_pages || 0,
          pages_in_queue: result.crawl_status?.pages_in_queue || 0,
          pages_crawled: result.crawl_status?.pages_crawled || 0,
        },
        domain_info: {
          name: result.domain_info?.name || result.domain || taskId.split("_")[0] || "Unknown Domain",
          ip: result.domain_info?.ip || "",
          server: result.domain_info?.server || "",
          cms: result.domain_info?.cms || "",
          crawl_start: result.domain_info?.crawl_start || "",
          crawl_end: result.domain_info?.crawl_end || "",
          total_pages: result.domain_info?.total_pages || 0,
          checks: result.domain_info?.checks || {},
        },
        pages_crawled: result.crawl_status?.pages_crawled || 0,
        pages_count: result.crawl_status?.max_crawl_pages || 0,
        page_metrics: {
          broken_resources: result.page_metrics?.broken_resources || 0,
          broken_links: result.page_metrics?.broken_links || 0,
          duplicate_title: result.page_metrics?.duplicate_title || 0,
          duplicate_description: result.page_metrics?.duplicate_description || 0,
          duplicate_content: result.page_metrics?.duplicate_content || 0,
          https_pages: result.page_metrics?.checks?.is_https || 0,
          links_external: result.page_metrics?.links_external || 0,
          links_internal: result.page_metrics?.links_internal || 0,
          non_indexable: result.page_metrics?.non_indexable || 0,
          onpage_score: result.page_metrics?.onpage_score || 0,
          checks: result.page_metrics?.checks || {},
        },
      }
    }

    // If no result found, return a default summary
    return {
      crawl_progress: "in_progress",
      crawl_status: {
        status_code: 2,
        status_message: "In progress",
        max_crawl_pages: 0,
        pages_in_queue: 0,
        pages_crawled: 0,
      },
      domain_info: {
        name: taskId.split("_")[0] || "Unknown Domain",
      },
      pages_crawled: 0,
      pages_count: 0,
      page_metrics: {
        broken_resources: 0,
        broken_links: 0,
        duplicate_title: 0,
        duplicate_description: 0,
        duplicate_content: 0,
        https_pages: 0,
        links_external: 0,
        links_internal: 0,
        non_indexable: 0,
        onpage_score: 0,
      },
    }
  } catch (error) {
    console.error("Error getting task summary:", error)
    // Return a default summary instead of throwing
    return {
      crawl_progress: "in_progress",
      crawl_status: {
        status_code: 2,
        status_message: "In progress",
        max_crawl_pages: 0,
        pages_in_queue: 0,
        pages_crawled: 0,
      },
      domain_info: {
        name: taskId.split("_")[0] || "Unknown Domain",
      },
      pages_crawled: 0,
      pages_count: 0,
      page_metrics: {
        broken_resources: 0,
        broken_links: 0,
        duplicate_title: 0,
        duplicate_description: 0,
        duplicate_content: 0,
        https_pages: 0,
        links_external: 0,
        links_internal: 0,
        non_indexable: 0,
        onpage_score: 0,
      },
    }
  }
}

// Function to get task pages
export async function getTaskPages(taskId: string, limit = 100, offset = 0) {
  try {
    // Check if the task is ready before fetching pages
    const status = await checkTaskStatus(taskId)

    // Only fetch pages if the task is completed or has enough progress
    if (status.status_code !== 3 && status.crawl_progress !== "finished") {
      console.log(
        `Task ${taskId} is not ready yet for pages data. Status: ${status.status_code}, Progress: ${status.crawl_progress}`,
      )
      return []
    }

    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/seo-audit/get-pages?taskId=${encodeURIComponent(taskId)}&limit=${limit}&offset=${offset}`,
    )

    // If we get a 404, it means the data isn't ready yet
    if (response.status === 404) {
      console.log(`Pages data not ready yet for task ${taskId}`)
      return []
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task pages: ${response.status}`, errorText)
      return []
    }

    const data = await response.json()
    console.log("Task pages response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the results from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      // Format each page to match the expected structure
      return data.tasks[0].result.map((page: any) => ({
        url: page.url || "",
        status_code: page.status_code || 0,
        meta: {
          title: page.meta?.title || "",
          description: page.meta?.description || "",
        },
        onpage_score: page.onpage_score || 0,
        page_timing: {
          time_to_interactive: page.page_timing?.time_to_interactive || 0,
          dom_complete: page.page_timing?.dom_complete || 0,
          largest_contentful_paint: page.page_timing?.largest_contentful_paint || 0,
        },
      }))
    }

    return []
  } catch (error) {
    console.error("Error getting task pages:", error)
    return []
  }
}

// Function to get task duplicate tags
export async function getTaskDuplicateTags(taskId: string) {
  try {
    // Check if the task is ready before fetching duplicate tags
    const status = await checkTaskStatus(taskId)

    // Only fetch duplicate tags if the task is completed or has enough progress
    if (status.status_code !== 3 && status.crawl_progress !== "finished") {
      console.log(
        `Task ${taskId} is not ready yet for duplicate tags data. Status: ${status.status_code}, Progress: ${status.crawl_progress}`,
      )
      return []
    }

    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/seo-audit/get-duplicate-tags?taskId=${encodeURIComponent(taskId)}`)

    // If we get a 404, it means the data isn't ready yet
    if (response.status === 404) {
      console.log(`Duplicate tags data not ready yet for task ${taskId}`)
      return []
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task duplicate tags: ${response.status}`, errorText)
      return []
    }

    const data = await response.json()

    // Extract the results from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      return data.tasks[0].result
    }

    return []
  } catch (error) {
    console.error("Error getting task duplicate tags:", error)
    return []
  }
}

// Function to get task links
export async function getTaskLinks(taskId: string, limit = 100, offset = 0) {
  try {
    // Check if the task is ready before fetching links
    const status = await checkTaskStatus(taskId)

    // Only fetch links if the task is completed or has enough progress
    if (status.status_code !== 3 && status.crawl_progress !== "finished") {
      console.log(
        `Task ${taskId} is not ready yet for links data. Status: ${status.status_code}, Progress: ${status.crawl_progress}`,
      )
      return []
    }

    const baseUrl = getBaseUrl()
    const response = await fetch(
      `${baseUrl}/api/seo-audit/get-links?taskId=${encodeURIComponent(taskId)}&limit=${limit}&offset=${offset}`,
    )

    // If we get a 404, it means the data isn't ready yet
    if (response.status === 404) {
      console.log(`Links data not ready yet for task ${taskId}`)
      return []
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task links: ${response.status}`, errorText)
      return []
    }

    const data = await response.json()

    // Extract the results from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      return data.tasks[0].result
    }

    return []
  } catch (error) {
    console.error("Error getting task links:", error)
    return []
  }
}

// Function to get task non-indexable pages
export async function getTaskNonIndexable(taskId: string) {
  try {
    // Check if the task is ready before fetching non-indexable pages
    const status = await checkTaskStatus(taskId)

    // Only fetch non-indexable pages if the task is completed or has enough progress
    if (status.status_code !== 3 && status.crawl_progress !== "finished") {
      console.log(
        `Task ${taskId} is not ready yet for non-indexable pages data. Status: ${status.status_code}, Progress: ${status.crawl_progress}`,
      )
      return []
    }

    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/seo-audit/get-non-indexable?taskId=${encodeURIComponent(taskId)}`)

    // If we get a 404, it means the data isn't ready yet
    if (response.status === 404) {
      console.log(`Non-indexable pages data not ready yet for task ${taskId}`)
      return []
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task non-indexable pages: ${response.status}`, errorText)
      return []
    }

    const data = await response.json()

    // Extract the results from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      return data.tasks[0].result
    }

    return []
  } catch (error) {
    console.error("Error getting task non-indexable pages:", error)
    return []
  }
}

