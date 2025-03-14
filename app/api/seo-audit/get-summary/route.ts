"use client"

import { type NextRequest, NextResponse } from "next/server"
import { getUrlForTaskId } from "@/lib/task-history";

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// DataForSEO API credentials - use environment variables with fallbacks
const API_LOGIN = process.env.DATAFORSEO_USERNAME || "saim.nadeem@gmail.com";
const API_PASSWORD = process.env.DATAFORSEO_PASSWORD || "9e8f3d68a939d229";

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId")
    const type = request.nextUrl.searchParams.get("type") // Optional type parameter

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    console.log(`Getting summary for task ID: ${taskId}`)

    // Check if this is a Lighthouse task by examining the task ID format or the type parameter
    // DataForSEO Lighthouse task IDs typically have a specific format
    const isLighthouseTask = taskId.includes('-9323-0317-') || type === "lighthouse";
    
    if (isLighthouseTask) {
      return await handleLighthouseTask(taskId);
    } else {
      return await handleRegularTask(taskId);
    }
  } catch (error) {
    console.error("Error in get-summary:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 })
  }
}

async function handleLighthouseTask(taskId: string) {
  try {
    // First check if the task is ready using the tasks_ready endpoint
    const tasksReadyUrl = `https://api.dataforseo.com/v3/on_page/lighthouse/tasks_ready`;
    
    console.log(`Checking if Lighthouse task is ready with ${tasksReadyUrl}`);
    
    const tasksReadyResponse = await fetch(tasksReadyUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_HEADER}`,
      },
      cache: 'no-store', // Prevent caching
    });
    
    const tasksReadyData = await tasksReadyResponse.json();
    
    // Check if our task ID is in the list of ready tasks
    let isTaskReady = false;
    if (tasksReadyData.status_code === 20000 && 
        tasksReadyData.tasks && 
        tasksReadyData.tasks.length > 0 && 
        tasksReadyData.tasks[0].result) {
      
      const readyTasks = tasksReadyData.tasks[0].result;
      isTaskReady = readyTasks.some((task: any) => task.id === taskId);
      console.log(`Lighthouse task ${taskId} ready status: ${isTaskReady}`);
    }
    
    // If the task is ready, try to get the summary
    if (isTaskReady) {
      // Try the summary endpoint first
      const summaryEndpoint = "https://api.dataforseo.com/v3/on_page/lighthouse/summary";
      console.log(`Using API endpoint: ${summaryEndpoint} for task ID: ${taskId}`);
      
      // Prepare the request to DataForSEO API
      const apiBody = [
        {
          id: taskId,
          limit: 1,
        },
      ];
      
      const summaryResponse = await fetch(summaryEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${AUTH_HEADER}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiBody),
      });
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        
        if (summaryData.status_code === 20000 && 
            summaryData.tasks && 
            summaryData.tasks.length > 0 && 
            summaryData.tasks[0].result) {
          return NextResponse.json(summaryData);
        }
      }
      
      // If summary endpoint failed, try the task_get endpoint
      console.log(`Summary endpoint failed, trying task_get endpoint`);
      return await getLighthouseTaskResults(taskId);
    } else {
      // Task is not ready yet, check if it exists
      console.log(`Task not ready yet, checking if it exists`);
      
      // Try the task_get endpoint to see if the task exists
      const taskGetUrl = `https://api.dataforseo.com/v3/on_page/lighthouse/task_get/${taskId}`;
      
      const taskGetResponse = await fetch(taskGetUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${AUTH_HEADER}`,
        },
        cache: 'no-store',
      });
      
      const taskGetData = await taskGetResponse.json();
      
      if (taskGetData.status_code === 20000) {
        // Task exists but is not ready yet
        return NextResponse.json({
          success: false,
          taskId: taskId,
          status: "in_progress",
          error: "Task is still in progress"
        }, { status: 202 }); // 202 Accepted
      } else if (taskGetData.status_code === 40501) {
        // Task is in progress
        return NextResponse.json({
          success: false,
          taskId: taskId,
          status: "in_progress",
          error: "Task is still in progress"
        }, { status: 202 });
      } else {
        // Task not found or other error, try live endpoint
        console.log(`Task not found or other error, trying live endpoint`);
        return await getLighthouseTaskLive(taskId);
      }
    }
  } catch (error) {
    console.error(`Error handling Lighthouse task:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}

async function getLighthouseTaskResults(taskId: string) {
  try {
    const taskGetUrl = `https://api.dataforseo.com/v3/on_page/lighthouse/task_get/${taskId}`;
    console.log(`Fetching Lighthouse results from ${taskGetUrl}`);
    
    const taskGetResponse = await fetch(taskGetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_HEADER}`,
      },
      cache: 'no-store',
    });
    
    const taskGetData = await taskGetResponse.json();
    
    if (taskGetData.status_code === 20000 && 
        taskGetData.tasks && 
        taskGetData.tasks.length > 0) {
      
      // Check if the task has results
      if (taskGetData.tasks[0].result && taskGetData.tasks[0].result.length > 0) {
        // Return the results
        return NextResponse.json(taskGetData);
      } else {
        // Task exists but no results yet
        return NextResponse.json({
          success: false,
          taskId: taskId,
          status: "in_progress",
          error: "Task exists but results are not ready yet"
        }, { status: 202 });
      }
    } else if (taskGetData.status_code === 40501) {
      // Task is in progress
      return NextResponse.json({
        success: false,
        taskId: taskId,
        status: "in_progress",
        error: "Task is still in progress"
      }, { status: 202 });
    } else {
      // Task not found or other error, try live endpoint
      return await getLighthouseTaskLive(taskId);
    }
  } catch (error) {
    console.error(`Error getting Lighthouse task results:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}

async function getLighthouseTaskLive(taskId: string) {
  try {
    // Get the URL for this task from task history
    let storedUrl = await getUrlForTaskId(taskId);
    
    // If we can't find the URL, use a default URL
    if (!storedUrl) {
      storedUrl = "example.com";
      console.log(`No URL found for task ${taskId}, using default URL: ${storedUrl}`);
    }
    
    // Ensure the URL is properly formatted
    let formattedUrl = storedUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
      console.log(`Added https:// prefix to URL: ${formattedUrl}`);
    }
    
    // Create a proper request body with all required parameters
    const requestBody = [
      {
        url: formattedUrl,
        lighthouse_version: "latest",
        device: "mobile",
        location_name: "United States",
        language_name: "English"
      }
    ];
    
    console.log(`Sending live request to https://api.dataforseo.com/v3/on_page/lighthouse/live with URL: ${formattedUrl}`);
    
    const liveResponse = await fetch("https://api.dataforseo.com/v3/on_page/lighthouse/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_HEADER}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    const liveData = await liveResponse.json();
    console.log(`Live response status: ${liveData.status_code}`);
    
    if (liveData.status_code === 20000 && 
        liveData.tasks && 
        liveData.tasks.length > 0 && 
        liveData.tasks[0].result && 
        liveData.tasks[0].result.length > 0) {
      
      // Return the results
      return NextResponse.json(liveData);
    } else {
      // Live endpoint failed, return a helpful error
      return NextResponse.json({
        success: false,
        error: "Could not retrieve Lighthouse results. The task may still be processing or may not exist."
      }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error getting Lighthouse live results:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}

async function handleRegularTask(taskId: string) {
  // Use the regular on_page/summary endpoint
  const apiEndpoint = "https://api.dataforseo.com/v3/on_page/summary";
  
  // Prepare the request to DataForSEO API
  const apiBody = [
    {
      id: taskId,
      limit: 1,
    },
  ];

  console.log(`Using API endpoint: ${apiEndpoint} for task ID: ${taskId}`);

  // Make the request to DataForSEO API
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${AUTH_HEADER}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`DataForSEO API error: ${response.status} ${errorText}`);
    return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status });
  }

  const data = await response.json();
  
  // Log the full response for debugging
  console.log(`Summary response for task ${taskId}:`, JSON.stringify(data));
  
  // If we got an error from the API, return it
  if (data.status_code !== 20000) {
    console.log(`Error from summary endpoint: ${data.status_code} - ${data.status_message}`);
    return NextResponse.json(data);
  }
  
  // Process and enhance the response data
  if (data.tasks && data.tasks.length > 0) {
    const task = data.tasks[0];
    
    // Check if the task is still in queue
    if (task.status_code === 40602) {
      // Task is in queue, create a default response with task status info
      const inQueueResponse = {
        crawl_progress: "in_progress",
        crawl_status: {
          status_code: task.status_code,
          status_message: task.status_message,
          max_crawl_pages: task.data?.max_crawl_pages || 100,
          pages_in_queue: 0,
          pages_crawled: 0,
        },
        domain_info: {
          name: task.data?.target || taskId.split("_")[0] || "Unknown Domain",
          total_pages: 0
        },
        pages_crawled: 0,
        pages_count: 0,
        page_metrics: {
          links_external: 0,
          links_internal: 0,
          duplicate_title: 0,
          duplicate_description: 0,
          duplicate_content: 0,
          broken_links: 0,
          broken_resources: 0,
          links_relation_conflict: 0,
          redirect_loop: 0,
          onpage_score: 0,
        },
      }
      
      return NextResponse.json(inQueueResponse)
    }
  }
  
  return NextResponse.json(data)
}
