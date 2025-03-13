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
export async function getTaskPages(taskId: string, limit: number = 100, offset: number = 0, maxPages: number = 100) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting pages for task ID: ${taskId}, limit: ${limit}, offset: ${offset}, maxPages: ${maxPages}`)
    
    // Add query parameters for limit, offset, and maxPages
    const url = `${baseUrl}/api/seo-audit/get-pages?taskId=${encodeURIComponent(taskId)}&limit=${limit}&offset=${offset}&maxPages=${maxPages}`
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting task pages: ${response.status}`, errorText)
      throw new Error(`Error getting task pages: ${response.status}`)
    }

    const data = await response.json()
    console.log("Task pages response:", JSON.stringify(data).substring(0, 500) + "...")

    // Handle the new response format
    if (data.status === "success" && data.items) {
      console.log(`Received ${data.items_count} pages out of ${data.total_items_count} total`)
      return data.items
    }
    
    // Handle the old response format for backward compatibility
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      // Check if there's an items array in the result
      const result = data.tasks[0].result[0];
      if (result.items && Array.isArray(result.items)) {
        console.log(`Extracted ${result.items.length} pages from API response`)
        return result.items;
      }
      
      // Fall back to the old format if needed
      console.log("Extracted pages result (old format):", JSON.stringify(data.tasks[0].result).substring(0, 500) + "...")
      return data.tasks[0].result
    }

    console.log("No valid pages data found in the response")
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
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      return data.tasks[0].result
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
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      return data.tasks[0].result
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
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      return data.tasks[0].result
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
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      return data.tasks[0].result
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
      console.error(`Error getting errors: ${response.status}`, errorText)
      throw new Error(`Error getting errors: ${response.status}`)
    }

    const data = await response.json()
    console.log("Errors response:", JSON.stringify(data).substring(0, 500) + "...")

    // Extract the result from the response
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      return data.tasks[0].result
    }

    return []
  } catch (error) {
    console.error("Error getting errors:", error)
    return []
  }
}

// Function to get resources data
export async function getTaskResources(taskId: string, options: any = {}) {
  try {
    const baseUrl = getBaseUrl()
    console.log(`Getting resources for task ID: ${taskId}`)
    
    // Build the URL with query parameters
    let url = `${baseUrl}/api/seo-audit/get-resources?taskId=${encodeURIComponent(taskId)}`
    
    // Add optional query parameters if provided
    if (options.limit) {
      url += `&limit=${options.limit}`
    }
    if (options.offset) {
      url += `&offset=${options.offset}`
    }
    if (options.resourceType) {
      url += `&resourceType=${encodeURIComponent(options.resourceType)}`
    }
    if (options.minSize) {
      url += `&minSize=${encodeURIComponent(options.minSize)}`
    }
    if (options.orderBy) {
      url += `&orderBy=${encodeURIComponent(options.orderBy)}`
    }
    
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error getting resources: ${response.status}`, errorText)
      throw new Error(`Error getting resources: ${response.status}`)
    }

    const data = await response.json()
    console.log("Resources response:", JSON.stringify(data).substring(0, 500) + "...")

    // Handle the new API response format
    if (data.success === true && data.data) {
      console.log(`Received ${data.data.length} resources from API`)
      return data
    }
    
    // Handle the old response format for backward compatibility
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
      console.log("Using legacy response format")
      return data.tasks[0].result
    }

    console.log("No resources found in response")
    return []
  } catch (error) {
    console.error("Error getting resources:", error)
    return []
  }
}

// Track in-flight requests to prevent duplicates
const inFlightRequests: Record<string, Promise<any>> = {};

/**
 * Start a Lighthouse audit for a URL with request deduplication
 */
export async function startLighthouseAudit(url: string, options: any = {}) {
  try {
    const baseUrl = getBaseUrl();
    console.log(`Starting Lighthouse audit for URL: ${url}`);
    
    // Normalize the URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Remove trailing slash if present
    if (normalizedUrl.endsWith('/')) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }
    
    console.log(`Normalized URL: ${normalizedUrl}`);
    
    // Create a unique request key
    const requestKey = `lighthouse_audit_${normalizedUrl}`;
    
    // Check if there's already an in-flight request for this URL
    if (Object.prototype.hasOwnProperty.call(inFlightRequests, requestKey)) {
      console.log(`Using existing in-flight request for ${normalizedUrl}`);
      return inFlightRequests[requestKey];
    }
    
    // Create a new request
    const requestPromise = (async () => {
      const requestBody = {
        url: normalizedUrl,
        options: {
          device: options.device || "mobile",
          lighthouse_version: options.lighthouse_version || "latest",
          location_name: options.location_name || "United States",
          language_name: options.language_name || "English"
        }
      };
      
      console.log(`Sending request to ${baseUrl}/api/seo-audit/lighthouse/task-post`);
      console.log(`Request body:`, JSON.stringify(requestBody));
      
      const response = await fetch(`${baseUrl}/api/seo-audit/lighthouse/task-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error starting Lighthouse audit: ${response.status}`, errorText);
        return {
          success: false,
          error: `Error starting Lighthouse audit: ${response.status} - ${errorText}`
        };
      }
      
      const data = await response.json();
      console.log("Lighthouse audit started:", data);
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || "Failed to start Lighthouse audit"
        };
      }
      
      return data;
    })();
    
    // Store the request promise
    inFlightRequests[requestKey] = requestPromise;
    
    // Clean up the in-flight request after it completes
    requestPromise.finally(() => {
      delete inFlightRequests[requestKey];
    });
    
    return requestPromise;
  } catch (error) {
    console.error("Error starting Lighthouse audit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

/**
 * Get the results of a Lighthouse audit with request deduplication
 */
export async function getLighthouseResults(taskId: string): Promise<any> {
  // If there's already a request in flight for this task ID, return that promise
  const requestKey = `lighthouse_get_${taskId}`;
  
  // Check if there's an in-flight request and it's a Promise
  if (Object.prototype.hasOwnProperty.call(inFlightRequests, requestKey)) {
    console.log(`Reusing in-flight request for Lighthouse task ID: ${taskId}`);
    return inFlightRequests[requestKey];
  }

  try {
    const baseUrl = getBaseUrl();
    console.log(`Getting Lighthouse results for task ID: ${taskId}`);
    
    // Create the promise for this request
    const requestPromise = (async () => {
      try {
        // First, try to get results directly from the task_get endpoint
        console.log(`Attempting to fetch from task_get endpoint for task: ${taskId}`);
        const response = await fetch(`${baseUrl}/api/seo-audit/lighthouse/task-get?taskId=${encodeURIComponent(taskId)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Add cache: 'no-store' to prevent caching
          cache: 'no-store',
        });
        
        // Process the response
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error getting Lighthouse results: ${response.status} - ${errorText}`);
          
          // If we get a 404 or other error, try the latest endpoint as a fallback
          if (response.status === 404 || response.status === 500 || response.status === 202) {
            console.log(`Task get failed with status ${response.status}, trying latest endpoint as fallback`);
            
            // Try the latest endpoint which has additional fallback mechanisms
            const latestResponse = await fetch(`${baseUrl}/api/seo-audit/lighthouse/latest`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              cache: 'no-store',
            });
            
            if (!latestResponse.ok) {
              const latestErrorText = await latestResponse.text();
              console.error(`Error getting latest Lighthouse results: ${latestResponse.status} - ${latestErrorText}`);
              
              // Provide more specific error messages based on status code
              if (latestResponse.status === 404) {
                return {
                  success: false,
                  error: "Lighthouse audit not found. The task may have expired or been deleted.",
                  status: "not_found"
                };
              } else if (latestResponse.status === 202) {
                return {
                  success: false,
                  error: "Lighthouse audit is still processing. Please try again in a moment.",
                  status: "in_progress"
                };
              }
              
              return {
                success: false,
                error: `Error getting Lighthouse results: ${latestResponse.status} - ${latestErrorText}`,
                status: "error"
              };
            }
            
            const latestData = await latestResponse.json();
            console.log(`Got latest Lighthouse results:`, latestData);
            
            if (!latestData.success) {
              // Check for specific error conditions in the response
              if (latestData.status === "in_progress") {
                return {
                  success: false,
                  error: "Lighthouse audit is still processing. Please try again in a moment.",
                  status: "in_progress"
                };
              } else if (latestData.status === "not_found") {
                return {
                  success: false,
                  error: "Lighthouse audit not found. The task may have expired or been deleted.",
                  status: "not_found"
                };
              }
              
              return {
                success: false,
                error: latestData.error || "Failed to get latest Lighthouse results",
                status: latestData.status || "error"
              };
            }
            
            return latestData;
          } else if (response.status === 202) {
            // Task is still in progress
            return {
              success: false,
              error: "Lighthouse audit is still processing. Please try again in a moment.",
              status: "in_progress"
            };
          }
          
          // For other error types, return a generic error
          return {
            success: false,
            error: `Error getting Lighthouse results: ${response.status} - ${errorText}`,
            status: "error"
          };
        }
        
        // Process successful response
        const data = await response.json();
        console.log(`Got Lighthouse results:`, data);
        
        if (!data.success) {
          // Check for specific error conditions in the response
          if (data.status === "in_progress") {
            return {
              success: false,
              error: "Lighthouse audit is still processing. Please try again in a moment.",
              status: "in_progress"
            };
          } else if (data.status === "not_found") {
            return {
              success: false,
              error: "Lighthouse audit not found. The task may have expired or been deleted.",
              status: "not_found"
            };
          }
          
          return {
            success: false,
            error: data.error || "Failed to get Lighthouse results",
            status: data.status || "error"
          };
        }
        
        return data;
      } finally {
        // Remove this request from in-flight requests when it completes
        setTimeout(() => {
          delete inFlightRequests[requestKey];
        }, 0);
      }
    })();
    
    // Store the promise in the in-flight requests map
    inFlightRequests[requestKey] = requestPromise;
    
    return requestPromise;
  } catch (error) {
    console.error("Error in getLighthouseResults:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      status: "error"
    };
  }
}

/**
 * Function to get task summary
 */
export async function getTaskSummary(taskId: string) {
  try {
    const baseUrl = getBaseUrl();
    console.log(`Getting summary for task ID: ${taskId}`);
    
    // Check if this is a Lighthouse task by examining the task ID format
    const isLighthouseTask = taskId.includes('-9323-0317-');
    
    // Add a query parameter to indicate if this is a Lighthouse task
    const url = `${baseUrl}/api/seo-audit/get-summary?taskId=${encodeURIComponent(taskId)}${isLighthouseTask ? '&type=lighthouse' : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store', // Prevent caching
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error getting task summary: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `Error getting task summary: ${response.status} - ${errorText}`
      };
    }
    
    const data = await response.json();
    console.log(`Got task summary:`, data);
    
    return data;
  } catch (error) {
    console.error("Error getting task summary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

/**
 * Function to run an instant page audit
 */
export async function runInstantPageAudit(url: string) {
  try {
    const baseUrl = getBaseUrl();
    console.log(`Running instant page audit for URL: ${url}`);
    
    // Normalize the URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    const response = await fetch(`${baseUrl}/api/seo-audit/instant-page-audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: normalizedUrl }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error running instant page audit: ${response.status}`, errorText);
      return {
        success: false,
        error: `Error running instant page audit: ${response.status} - ${errorText}`
      };
    }
    
    const data = await response.json();
    console.log("Instant page audit result:", data);
    
    return data;
  } catch (error) {
    console.error("Error running instant page audit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}
