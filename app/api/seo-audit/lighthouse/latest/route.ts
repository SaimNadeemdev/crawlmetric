"use client"

import { NextRequest, NextResponse } from "next/server";
import { loadTaskHistory, getAllTaskHistory, getUrlForTaskId } from "@/lib/task-history";

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// DataForSEO API credentials - use environment variables with fallbacks
const API_LOGIN = process.env.DATAFORSEO_USERNAME || "saim.nadeem@gmail.com";
const API_PASSWORD = process.env.DATAFORSEO_PASSWORD || "9e8f3d68a939d229";
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString('base64');

// Maximum number of retries for API requests
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 1500;

// Handle both GET and POST requests with the same function
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry a fetch operation with exponential backoff
async function retryFetch(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;
    
    // If we get a 404 or 429 (rate limit) and have retries left, wait and try again
    if ((response.status === 404 || response.status === 429) && retries > 0) {
      const waitTime = RETRY_DELAY * (MAX_RETRIES - retries + 1); // Exponential backoff
      console.log(`Got ${response.status} for ${url}, retrying in ${waitTime}ms... (${retries} retries left)`);
      await delay(waitTime);
      return retryFetch(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      const waitTime = RETRY_DELAY * (MAX_RETRIES - retries + 1);
      console.log(`Fetch error for ${url}, retrying in ${waitTime}ms... (${retries} retries left)`, error);
      await delay(waitTime);
      return retryFetch(url, options, retries - 1);
    }
    throw error;
  }
}

// Helper function to check if a task is ready
async function checkIfTaskIsReady(taskId: string): Promise<{isReady: boolean, error?: string}> {
  try {
    console.log(`Checking if task ${taskId} is ready`);
    
    const apiUrl = `https://api.dataforseo.com/v3/on_page/lighthouse/tasks_ready`;
    const response = await retryFetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_HEADER}`,
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error checking if task is ready: ${response.status} - ${errorText}`);
      return { 
        isReady: false, 
        error: `Error checking task readiness: ${response.status}` 
      };
    }
    
    const data = await response.json();
    
    if (data.status_code === 20000 && 
        data.tasks && 
        data.tasks.length > 0 && 
        data.tasks[0].result) {
      
      const readyTasks = data.tasks[0].result;
      const isReady = readyTasks.some((task: any) => task.id === taskId);
      console.log(`Task ${taskId} ready status: ${isReady}`);
      return { isReady };
    }
    
    return { 
      isReady: false,
      error: data.status_message || "Could not determine task readiness"
    };
  } catch (error) {
    console.error(`Error checking if task is ready:`, error);
    return { 
      isReady: false, 
      error: error instanceof Error ? error.message : "Unknown error checking task readiness"
    };
  }
}

// Helper function to get task results directly
async function getTaskResults(taskId: string): Promise<any> {
  try {
    const taskGetUrl = `https://api.dataforseo.com/v3/on_page/lighthouse/task_get/json/${taskId}`;
    console.log(`Fetching results from ${taskGetUrl}`);
    
    const response = await retryFetch(taskGetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_HEADER}`,
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error getting task results: ${response.status} - ${errorText}`);
      
      if (response.status === 404) {
        return {
          success: false,
          error: "Task not found",
          status: "not_found"
        };
      }
      
      return {
        success: false,
        error: `Error getting task results: ${response.status}`,
        status: "error"
      };
    }
    
    const data = await response.json();
    
    if (data.status_code === 20000 && 
        data.tasks && 
        data.tasks.length > 0) {
      
      // Check if the task has results
      if (data.tasks[0].result && data.tasks[0].result.length > 0) {
        return {
          success: true,
          data: data.tasks[0].result[0],
          status: "completed"
        };
      } else {
        // Task exists but no results yet
        return {
          success: false,
          error: "Task exists but results are not ready yet",
          status: "in_progress"
        };
      }
    } else if (data.status_code === 40400) {
      return {
        success: false,
        error: "Task not found",
        status: "not_found"
      };
    } else if (data.status_code === 40501) {
      return {
        success: false,
        error: "Task is still in progress",
        status: "in_progress"
      };
    } else {
      return {
        success: false,
        error: `Unexpected API response: ${data.status_code} - ${data.status_message || 'Unknown error'}`,
        status: "error"
      };
    }
  } catch (error) {
    console.error(`Error getting task results:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting task results",
      status: "error"
    };
  }
}

// Helper function to get results using the live endpoint
async function getLiveResults(url: string): Promise<any> {
  try {
    // Ensure the URL is properly formatted
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    console.log(`Getting live Lighthouse results for URL: ${formattedUrl}`);
    
    // Create a proper request body with all required parameters
    const requestBody = [
      {
        url: formattedUrl,
        lighthouse_version: "latest",
        device: "mobile",
        location_name: "United States",
        language_name: "English",
        calculate_resources: true,
        calculate_timing: true,
        check_spell: true
      }
    ];
    
    const apiUrl = `https://api.dataforseo.com/v3/on_page/lighthouse/live`;
    console.log(`Sending request to ${apiUrl}`);
    
    const response = await retryFetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_HEADER}`,
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error getting live results: ${response.status} - ${errorText}`);
      
      return {
        success: false,
        error: `Error getting live results: ${response.status}`,
        status: response.status === 404 ? "not_found" : "error"
      };
    }
    
    const data = await response.json();
    
    if (data.status_code === 20000 && 
        data.tasks && 
        data.tasks.length > 0 && 
        data.tasks[0].result && 
        data.tasks[0].result.length > 0) {
      
      console.log(`Successfully retrieved live results for URL: ${formattedUrl}`);
      return {
        success: true,
        data: data.tasks[0].result[0],
        status: "completed"
      };
    } else if (data.status_code === 40501) {
      // Task is still in progress
      console.log(`Live endpoint task is still in progress: ${data.status_message || 'No status message'}`);
      return {
        success: false,
        error: "Live endpoint task is still in progress",
        status: "in_progress"
      };
    } else if (data.status_code === 40400) {
      // URL not found
      console.log(`URL not found in live endpoint: ${data.status_message || 'No status message'}`);
      return {
        success: false,
        error: "URL not found in live endpoint",
        status: "not_found"
      };
    } else {
      // Other error
      console.error(`Unexpected API response from live endpoint: ${data.status_code} - ${data.status_message || 'Unknown error'}`);
      return {
        success: false,
        error: `Unexpected API response from live endpoint: ${data.status_code} - ${data.status_message || 'Unknown error'}`,
        status: "error"
      };
    }
  } catch (error) {
    console.error(`Error getting live results:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting live results",
      status: "error"
    };
  }
}

// Helper function to try alternative URLs for the same domain
async function tryAlternativeURLs(url: string): Promise<any> {
  try {
    // Parse the URL to get the domain
    let domain = url;
    
    // Remove protocol if present
    if (domain.startsWith('http://')) {
      domain = domain.substring(7);
    } else if (domain.startsWith('https://')) {
      domain = domain.substring(8);
    }
    
    // Remove www. if present
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    // Remove path and query parameters if present
    domain = domain.split('/')[0];
    
    console.log(`Trying alternative URL formats for domain: ${domain}`);
    
    // Create alternative URL formats to try
    const alternativeUrls = [
      `https://${domain}`,
      `https://www.${domain}`,
      `http://${domain}`,
      `http://www.${domain}`
    ];
    
    // Filter out the original URL
    const filteredUrls = alternativeUrls.filter(altUrl => {
      // Normalize the original URL for comparison
      let normalizedOriginal = url;
      if (!normalizedOriginal.startsWith('http://') && !normalizedOriginal.startsWith('https://')) {
        normalizedOriginal = 'https://' + normalizedOriginal;
      }
      return altUrl !== normalizedOriginal;
    });
    
    console.log(`Generated ${filteredUrls.length} alternative URLs to try`);
    
    // Try each alternative URL
    for (const alternativeUrl of filteredUrls) {
      console.log(`Trying alternative URL: ${alternativeUrl}`);
      
      const liveResults = await getLiveResults(alternativeUrl);
      
      if (liveResults.success) {
        console.log(`Successfully retrieved results for alternative URL: ${alternativeUrl}`);
        return {
          success: true,
          data: liveResults.data,
          status: "completed",
          alternativeUrl
        };
      }
      
      console.log(`Failed to get results for alternative URL: ${alternativeUrl}`);
    }
    
    console.log(`All alternative URLs failed for domain: ${domain}`);
    return {
      success: false,
      error: "Could not retrieve results for any alternative URL format",
      status: "not_found",
      triedUrls: filteredUrls
    };
  } catch (error) {
    console.error(`Error trying alternative URLs:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error trying alternative URLs",
      status: "error"
    };
  }
}

async function handleRequest(request: NextRequest) {
  try {
    console.log(`Getting latest Lighthouse results`);
    
    // Get all task history
    const allHistory = getAllTaskHistory();
    
    // Convert task history to array and sort by timestamp (newest first)
    const historyEntries = Object.entries(allHistory)
      .filter(([taskId, data]) => {
        // Only include Lighthouse tasks (identified by the specific format in the task ID)
        return data && data.url && data.timestamp && taskId.includes('-9323-0317-');
      })
      .sort(([taskIdA, dataA], [taskIdB, dataB]) => {
        // Sort by timestamp descending (newest first)
        return (dataB as any).timestamp - (dataA as any).timestamp;
      });
    
    console.log(`Found ${historyEntries.length} history entries with URLs`);
    
    // If we don't have any history, return an error
    if (historyEntries.length === 0) {
      console.error(`No task history found`);
      return NextResponse.json({
        success: false,
        error: "No Lighthouse audit history found. Please run a Lighthouse audit first.",
        status: "not_found"
      }, { status: 404 });
    }
    
    // Get the most recent task ID and URL
    const [latestTaskId, latestData] = historyEntries[0];
    const latestUrl = (latestData as any).url;
    
    console.log(`Latest task ID: ${latestTaskId}, URL: ${latestUrl}`);
    
    // Implementation strategy:
    // 1. Check if the task is ready
    // 2. If ready, fetch results from task_get endpoint
    // 3. If not ready or task_get fails, try the live endpoint
    // 4. If live endpoint fails, try alternative URL formats
    // 5. If all else fails, try previous tasks in history
    
    // Step 1: Check if the task is ready
    const taskReadyCheck = await checkIfTaskIsReady(latestTaskId);
    
    // Step 2: If the task is ready, fetch the results
    if (taskReadyCheck.isReady) {
      console.log(`Task ${latestTaskId} is ready, fetching results`);
      const taskResults = await getTaskResults(latestTaskId);
      
      if (taskResults.success) {
        return NextResponse.json({
          success: true,
          taskId: latestTaskId,
          url: latestUrl,
          status: "completed",
          data: taskResults.data,
          taskReadyStatus: "ready"
        });
      }
      
      console.log(`Task is ready but failed to get results: ${taskResults.error}`);
    } else {
      console.log(`Task ${latestTaskId} is not ready: ${taskReadyCheck.error}`);
      
      // Try the task_get endpoint directly anyway
      const taskResults = await getTaskResults(latestTaskId);
      
      if (taskResults.success) {
        return NextResponse.json({
          success: true,
          taskId: latestTaskId,
          url: latestUrl,
          status: "completed",
          data: taskResults.data,
          taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
          taskReadyError: taskReadyCheck.error
        });
      }
      
      // If task is still in progress, return a 202 status
      if (taskResults.status === "in_progress") {
        return NextResponse.json({
          success: false,
          taskId: latestTaskId,
          url: latestUrl,
          status: "in_progress",
          error: taskResults.error,
          taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
          taskReadyError: taskReadyCheck.error
        }, { status: 202 });
      }
      
      console.log(`Failed to get results from task_get: ${taskResults.error}`);
    }
    
    // Step 3: Try the live endpoint as a fallback
    console.log(`Trying live endpoint as fallback for URL: ${latestUrl}`);
    const liveResults = await getLiveResults(latestUrl);
    
    if (liveResults.success) {
      return NextResponse.json({
        success: true,
        taskId: latestTaskId,
        url: latestUrl,
        status: "completed",
        data: liveResults.data,
        note: "Results from live endpoint",
        taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
        taskReadyError: taskReadyCheck.error
      });
    }
    
    // Step 4: Try alternative URL formats
    console.log(`Live endpoint failed, trying alternative URL formats`);
    const alternativeResults = await tryAlternativeURLs(latestUrl);
    
    if (alternativeResults.success) {
      return NextResponse.json({
        success: true,
        taskId: latestTaskId,
        url: latestUrl,
        status: "completed",
        data: alternativeResults.data,
        note: "Results from live endpoint with alternative URL format",
        taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
        taskReadyError: taskReadyCheck.error
      });
    }
    
    // Step 5: Try previous tasks in history (up to 5 most recent)
    console.log(`All attempts failed for latest task, trying previous tasks`);
    
    // Try up to 5 previous tasks
    const previousTasksToTry = Math.min(5, historyEntries.length - 1);
    
    for (let i = 1; i <= previousTasksToTry; i++) {
      const [previousTaskId, previousData] = historyEntries[i];
      const previousUrl = (previousData as any).url;
      
      console.log(`Trying previous task ${i}: ${previousTaskId}, URL: ${previousUrl}`);
      
      // Check if this task is ready
      const previousTaskReadyCheck = await checkIfTaskIsReady(previousTaskId);
      
      if (previousTaskReadyCheck.isReady) {
        const previousTaskResults = await getTaskResults(previousTaskId);
        
        if (previousTaskResults.success) {
          return NextResponse.json({
            success: true,
            taskId: previousTaskId,
            url: previousUrl,
            status: "completed",
            data: previousTaskResults.data,
            note: "Results are from a previous audit",
            taskReadyStatus: "ready"
          });
        }
      }
      
      // Try the live endpoint with this URL
      const previousLiveResults = await getLiveResults(previousUrl);
      
      if (previousLiveResults.success) {
        return NextResponse.json({
          success: true,
          taskId: previousTaskId,
          url: previousUrl,
          status: "completed",
          data: previousLiveResults.data,
          note: "Results are from a live audit of a previous URL",
          taskReadyStatus: previousTaskReadyCheck.isReady ? "ready" : "not_ready",
          taskReadyError: previousTaskReadyCheck.error
        });
      }
      
      // Try alternative URL formats for previous URL
      const previousAlternativeResults = await tryAlternativeURLs(previousUrl);
      
      if (previousAlternativeResults.success) {
        return NextResponse.json({
          success: true,
          taskId: previousTaskId,
          url: previousUrl,
          status: "completed",
          data: previousAlternativeResults.data,
          note: "Results are from a live audit of a previous URL with alternative format",
          taskReadyStatus: previousTaskReadyCheck.isReady ? "ready" : "not_ready",
          taskReadyError: previousTaskReadyCheck.error
        });
      }
    }
    
    // If all attempts fail, return an error
    return NextResponse.json({
      success: false,
      taskId: latestTaskId,
      url: latestUrl,
      error: "Could not retrieve Lighthouse results after multiple attempts. Please try running a new audit.",
      status: "error",
      taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
      taskReadyError: taskReadyCheck.error
    }, { status: 404 });
    
  } catch (error) {
    console.error(`Error in Lighthouse latest handler:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      status: "error"
    }, { status: 500 });
  }
}
