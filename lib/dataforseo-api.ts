import { getBaseUrl } from "./utils"

// Function to start a full site audit
export async function startFullSiteAudit(target: string, options: any = {}) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Starting full site audit for: ${target}`)
    console.log(`With options:`, options)

    const requestBody = {
      target,
      max_crawl_pages: options.max_crawl_pages || 100,
      max_crawl_depth: options.max_crawl_depth || 3,
    }

    const response = await fetch(`${baseUrl}/api/seo-audit/start-site-audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error starting site audit: ${response.status}`, errorText)
      throw new Error(`Error starting site audit: ${response.status}`)
    }

    const data = await response.json()
    console.log("Site audit started:", data)

    return data
  } catch (error) {
    console.error("Error starting site audit:", error)
    throw error
  }
}

// Function to check task status
export async function checkTaskStatus(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Checking status for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/check-task-status?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error checking task status: ${response.status}`, errorText)
      throw new Error(`Error checking task status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Task status:", data)

    return data
  } catch (error) {
    console.error("Error checking task status:", error)
    throw error
  }
}

// Function to get pages data
export async function getTaskPages(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting pages for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/get-pages?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task pages: ${response.status}`, errorText)
      throw new Error(`Error getting task pages: ${response.status}`)
    }

    const data = await response.json()
    console.log("Task pages response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result
      console.log("Extracted pages result:", JSON.stringify(result).substring(0, 500) + "...")
      return result
    }

    return []
  } catch (error) {
    console.error("Error getting task pages:", error)
    return []
  }
}

// Function to get duplicate tags data
export async function getTaskDuplicateTags(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting duplicate tags for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/get-duplicate-tags?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting duplicate tags: ${response.status}`, errorText)
      throw new Error(`Error getting duplicate tags: ${response.status}`)
    }

    const data = await response.json()
    console.log("Duplicate tags response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result
      console.log("Extracted duplicate tags result:", JSON.stringify(result).substring(0, 500) + "...")
      return result
    }

    return []
  } catch (error) {
    console.error("Error getting duplicate tags:", error)
    return []
  }
}

// Function to get links data
export async function getTaskLinks(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting links for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/get-links?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting links: ${response.status}`, errorText)
      throw new Error(`Error getting links: ${response.status}`)
    }

    const data = await response.json()
    console.log("Links response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result
      console.log("Extracted links result:", JSON.stringify(result).substring(0, 500) + "...")
      return result
    }

    return []
  } catch (error) {
    console.error("Error getting links:", error)
    return []
  }
}

// Function to get non-indexable pages data
export async function getTaskNonIndexable(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting non-indexable pages for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/get-non-indexable?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting non-indexable pages: ${response.status}`, errorText)
      throw new Error(`Error getting non-indexable pages: ${response.status}`)
    }

    const data = await response.json()
    console.log("Non-indexable pages response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result
      console.log("Extracted non-indexable pages result:", JSON.stringify(result).substring(0, 500) + "...")
      return result
    }

    return []
  } catch (error) {
    console.error("Error getting non-indexable pages:", error)
    return []
  }
}

// Function to get duplicate content data
export async function getTaskDuplicateContent(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting duplicate content for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/get-duplicate-content?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting duplicate content: ${response.status}`, errorText)
      throw new Error(`Error getting duplicate content: ${response.status}`)
    }

    const data = await response.json()
    console.log("Duplicate content response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result
      console.log("Extracted duplicate content result:", JSON.stringify(result).substring(0, 500) + "...")
      return result
    }

    return []
  } catch (error) {
    console.error("Error getting duplicate content:", error)
    return []
  }
}

// Function to get errors data
export async function getTaskErrors(taskId: string) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting errors for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/get-errors?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task errors: ${response.status}`, errorText)
      throw new Error(`Error getting task errors: ${response.status}`)
    }

    const data = await response.json()
    console.log("Errors response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result
      console.log("Extracted errors result:", JSON.stringify(result).substring(0, 500) + "...")
      return result
    }

    return []
  } catch (error) {
    console.error("Error getting task errors:", error)
    return []
  }
}

// Function to get resources data
export async function getTaskResources(taskId: string, options: any = {}) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting resources for task ID: ${taskId}`)
    const response = await fetch(`${baseUrl}/api/seo-audit/get-resources?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task resources: ${response.status}`, errorText)
      throw new Error(`Error getting task resources: ${response.status}`)
    }

    const data = await response.json()
    console.log("Resources response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result
      console.log("Extracted resources result:", JSON.stringify(result).substring(0, 500) + "...")
      return result
    }

    return []
  } catch (error) {
    console.error("Error getting task resources:", error)
    return []
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
          with_title: (result.domain_info?.total_pages || 0) - (result.page_metrics?.checks?.no_title || 0),
          with_meta_description: (result.domain_info?.total_pages || 0) - (result.page_metrics?.checks?.no_description || 0),
          with_h1: (result.domain_info?.total_pages || 0) - (result.page_metrics?.checks?.no_h1_tag || 0),
          with_images: (result.domain_info?.total_pages || 0) - (result.page_metrics?.checks?.no_image_alt || 0),
          with_structured_data: result.page_metrics?.checks?.structured_data || 0,
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
        with_title: 0,
        with_meta_description: 0,
        with_h1: 0,
        with_images: 0,
        with_structured_data: 0,
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
        with_title: 0,
        with_meta_description: 0,
        with_h1: 0,
        with_images: 0,
        with_structured_data: 0,
      },
    }
  }
}
