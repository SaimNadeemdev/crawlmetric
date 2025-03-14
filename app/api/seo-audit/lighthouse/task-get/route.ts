"use client"

import { NextRequest, NextResponse } from "next/server";

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
    
    // If we can't determine readiness, assume it's not ready yet
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

// Helper function to get results using the live endpoint
async function getLiveResults(url: string): Promise<any> {
  try {
    // Ensure the URL is properly formatted
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
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
    
    console.log(`Trying live endpoint for URL: ${formattedUrl}`);
    
    const apiUrl = `https://api.dataforseo.com/v3/on_page/lighthouse/live`;
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
      console.error(`Error getting live Lighthouse results: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `Error getting live Lighthouse results: ${response.status}`
      };
    }
    
    const data = await response.json();
    console.log(`Live endpoint response status code: ${data.status_code}`);
    
    if (data.status_code === 20000 && 
        data.tasks && 
        data.tasks.length > 0 && 
        data.tasks[0].result) {
      
      // Log the structure of the result to help with debugging
      const resultSample = JSON.stringify(data.tasks[0].result).substring(0, 300);
      console.log(`Live endpoint result structure: ${resultSample}...`);
      
      // Check if we have results and they're in the expected format
      if (data.tasks[0].result.length > 0) {
        const result = data.tasks[0].result[0];
        
        // Check if the result has lighthouse_result directly
        if (result.lighthouse_result) {
          console.log('Live endpoint: Found lighthouse_result directly in result');
          return {
            success: true,
            data: result
          };
        }
        
        // Check if the result itself is a Lighthouse result (has categories and audits)
        if (result.categories && result.audits) {
          console.log('Live endpoint: Found categories and audits directly in result - this is a Lighthouse result');
          // Wrap the result in the expected structure
          return {
            success: true,
            data: {
              lighthouse_result: result
            }
          };
        }
        
        // Check if the result has items with lighthouse_result
        if (result.items && Array.isArray(result.items) && result.items.length > 0) {
          if (result.items[0].lighthouse_result) {
            console.log('Live endpoint: Found lighthouse_result in items[0]');
            return {
              success: true,
              data: result.items[0]
            };
          }
          
          // Check if any item has categories and audits (DataForSEO format)
          if (result.items[0].categories && result.items[0].audits) {
            console.log('Live endpoint: Found categories and audits in items[0] - this is a Lighthouse result');
            return {
              success: true,
              data: {
                lighthouse_result: result.items[0]
              }
            };
          }
        }
        
        // If we still don't have lighthouse_result, return the raw result wrapped as lighthouse_result
        console.log('Live endpoint: Could not find lighthouse_result in standard locations, wrapping raw result as lighthouse_result');
        return {
          success: true,
          data: {
            lighthouse_result: result
          }
        };
      }
    }
    
    // If we get here, we didn't find any usable results
    console.error(`No usable results from live endpoint: ${data.status_message || 'Unknown error'}`);
    return {
      success: false,
      error: data.status_message || "No results from live endpoint"
    };
  } catch (error) {
    console.error(`Error getting live Lighthouse results:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting live results"
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
    
    // Remove path if present
    domain = domain.split('/')[0];
    
    console.log(`Trying alternative URL formats for domain: ${domain}`);
    
    // Try different URL formats
    const urlFormats = [
      `https://${domain}`,
      `https://www.${domain}`,
      `http://${domain}`,
      `http://www.${domain}`
    ];
    
    // Try each URL format
    for (const formatUrl of urlFormats) {
      if (formatUrl !== url) {
        console.log(`Trying alternative URL: ${formatUrl}`);
        const result = await getLiveResults(formatUrl);
        
        if (result.success) {
          console.log(`Successfully got results for alternative URL: ${formatUrl}`);
          let formattedData;
          
          // Check if alternativeResults.data already has the right structure
          if (result.data.lighthouse_result) {
            console.log('Alternative URL result already has lighthouse_result');
            formattedData = result.data;
          } else if (result.data.categories && result.data.audits) {
            console.log('Alternative URL result has categories and audits directly');
            formattedData = {
              lighthouse_result: result.data
            };
          } else {
            console.log('Wrapping alternative URL result in standard format');
            formattedData = {
              lighthouse_result: result.data
            };
          }
          
          return {
            success: true,
            data: {
              result: [{
                items: [formattedData]
              }]
            }
          };
        }
      }
    }
    
    return {
      success: false,
      error: "Could not get results for any alternative URL format"
    };
  } catch (error) {
    console.error(`Error trying alternative URLs:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error trying alternative URLs"
    };
  }
}

// Handle GET requests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  
  if (!taskId) {
    return NextResponse.json({
      success: false,
      error: "Missing taskId parameter"
    }, { status: 400 });
  }
  
  try {
    console.log(`Getting Lighthouse results for task ID: ${taskId}`);
    
    // Implementation strategy:
    // 1. Check if the task is ready
    // 2. If ready, fetch results from task_get endpoint
    // 3. If not ready or task_get fails, try the live endpoint using the URL associated with the task
    // 4. If live endpoint fails, try alternative URL formats
    
    // Step 1: Check if the task is ready
    const taskReadyCheck = await checkIfTaskIsReady(taskId);
    console.log(`Task ${taskId} ready status from tasks_ready endpoint: ${taskReadyCheck.isReady}`);
    
    // Step 2: Try to get task results directly
    // Even if the task is not reported as ready, we'll try to get the results anyway
    // as sometimes the tasks_ready endpoint might not be up-to-date
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
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Task get response status: ${data.status_code}`);
      
      if (data.status_code === 20000 && 
          data.tasks && 
          data.tasks.length > 0) {
        
        // Check if the task has results
        if (data.tasks[0].result && data.tasks[0].result.length > 0) {
          // Success case - we have results
          console.log(`Successfully retrieved results for task ${taskId}`);
          console.log(`Result structure:`, JSON.stringify(data.tasks[0].result[0], null, 2).substring(0, 200) + '...');
          
          // Ensure the response has the expected structure
          const resultData = data.tasks[0].result[0];
          
          // Check if we have the lighthouse_result directly
          if (resultData.lighthouse_result) {
            console.log('Found lighthouse_result directly in the response');
            return NextResponse.json({
              success: true,
              data: resultData,
              status: "completed"
            });
          }
          
          // Check if the result has categories and audits directly (DataForSEO format)
          if (resultData.categories && resultData.audits) {
            console.log('Found categories and audits directly in the response - this is a Lighthouse result');
            // Wrap the result in the expected structure
            return NextResponse.json({
              success: true,
              data: {
                lighthouse_result: resultData
              },
              status: "completed"
            });
          }
          
          // If we don't have lighthouse_result directly, check if it's in the items array
          if (resultData.items && Array.isArray(resultData.items) && resultData.items.length > 0) {
            console.log('Found items array in the response');
            if (resultData.items[0].lighthouse_result) {
              console.log('Found lighthouse_result in the first item');
              return NextResponse.json({
                success: true,
                data: {
                  result: [{
                    items: [resultData.items[0]]
                  }]
                },
                status: "completed"
              });
            }
            
            // Check if any item has categories and audits (DataForSEO format)
            if (resultData.items[0].categories && resultData.items[0].audits) {
              console.log('Found categories and audits in the first item - this is a Lighthouse result');
              return NextResponse.json({
                success: true,
                data: {
                  lighthouse_result: resultData.items[0]
                },
                status: "completed"
              });
            }
          }
          
          // If we still don't have the lighthouse_result, return the data wrapped as lighthouse_result
          console.log('Could not find lighthouse_result in standard locations, wrapping raw data as lighthouse_result');
          return NextResponse.json({
            success: true,
            data: {
              lighthouse_result: resultData
            },
            status: "completed"
          });
        } else {
          console.log(`Task exists but no results yet`);
          
          // Task exists but no results yet - check if we can get the URL to try live endpoint
          if (data.tasks[0].data && data.tasks[0].data.url) {
            const taskUrl = data.tasks[0].data.url;
            console.log(`Got URL from task: ${taskUrl}, trying live endpoint`);
            
            // Try the live endpoint with this URL
            const liveResults = await getLiveResults(taskUrl);
            
            if (liveResults.success) {
              console.log(`Successfully retrieved results from live endpoint for URL: ${taskUrl}`);
              
              // Format the response to match the expected structure
              const formattedData = {
                result: [{
                  items: [liveResults.data]
                }]
              };
              
              return NextResponse.json({
                success: true,
                data: formattedData,
                status: "completed",
                note: "Results from live endpoint"
              });
            }
            
            // Try alternative URLs
            console.log(`Live endpoint failed, trying alternative URL formats for: ${taskUrl}`);
            const alternativeResults = await tryAlternativeURLs(taskUrl);
            
            if (alternativeResults.success) {
              console.log(`Successfully retrieved results from alternative URL format`);
              
              // Format the response to match the expected structure
              let formattedData;
              
              // Check if alternativeResults.data already has the right structure
              if (alternativeResults.data.result[0].items[0].lighthouse_result) {
                console.log('Alternative URL result already has lighthouse_result');
                formattedData = alternativeResults.data.result[0].items[0];
              } else if (alternativeResults.data.result[0].items[0].categories && alternativeResults.data.result[0].items[0].audits) {
                console.log('Alternative URL result has categories and audits directly');
                formattedData = {
                  lighthouse_result: alternativeResults.data.result[0].items[0]
                };
              } else {
                console.log('Wrapping alternative URL result in standard format');
                formattedData = {
                  lighthouse_result: alternativeResults.data.result[0].items[0]
                };
              }
              
              return NextResponse.json({
                success: true,
                data: {
                  result: [{
                    items: [formattedData]
                  }]
                },
                status: "completed",
                note: "Results from live endpoint with alternative URL format"
              });
            }
            
            console.log(`All attempts to get results failed for task ${taskId}`);
          }
          
          // If we get here, we couldn't get results from any source
          return NextResponse.json({
            success: false,
            error: "Task exists but results are not ready yet",
            status: "in_progress",
            taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
            taskReadyError: taskReadyCheck.error
          }, { status: 202 });
        }
      } else if (data.status_code === 40400) {
        console.log(`Task not found (404), trying to get URL from task history`);
        
        // Try to get the URL from task history
        try {
          const { loadTaskHistory, getUrlForTaskId } = await import("@/lib/task-history");
          await loadTaskHistory(taskId); // Ensure task history is loaded
          const url = getUrlForTaskId(taskId);
          
          if (url) {
            console.log(`Found URL ${url} for task ${taskId} in history, trying live endpoint`);
            
            // Try the live endpoint with this URL
            const liveResults = await getLiveResults(url);
            
            if (liveResults.success) {
              console.log(`Successfully retrieved results from live endpoint for URL from history: ${url}`);
              
              // Format the response to match the expected structure
              const formattedData = {
                result: [{
                  items: [liveResults.data]
                }]
              };
              
              return NextResponse.json({
                success: true,
                data: formattedData,
                status: "completed",
                note: "Results from live endpoint (task not found)"
              });
            }
            
            // Try alternative URLs
            console.log(`Live endpoint failed for history URL, trying alternative URL formats`);
            const alternativeResults = await tryAlternativeURLs(url);
            
            if (alternativeResults.success) {
              console.log(`Successfully retrieved results from alternative URL format for history URL`);
              
              // Format the response to match the expected structure
              let formattedData;
              
              // Check if alternativeResults.data already has the right structure
              if (alternativeResults.data.result[0].items[0].lighthouse_result) {
                console.log('Alternative URL result already has lighthouse_result');
                formattedData = alternativeResults.data.result[0].items[0];
              } else if (alternativeResults.data.result[0].items[0].categories && alternativeResults.data.result[0].items[0].audits) {
                console.log('Alternative URL result has categories and audits directly');
                formattedData = {
                  lighthouse_result: alternativeResults.data.result[0].items[0]
                };
              } else {
                console.log('Wrapping alternative URL result in standard format');
                formattedData = {
                  lighthouse_result: alternativeResults.data.result[0].items[0]
                };
              }
              
              return NextResponse.json({
                success: true,
                data: {
                  result: [{
                    items: [formattedData]
                  }]
                },
                status: "completed",
                note: "Results from live endpoint with alternative URL format (task not found)"
              });
            }
            
            console.log(`All attempts to get results failed for history URL ${url}`);
          } else {
            console.log(`No URL found in history for task ${taskId}`);
          }
        } catch (error) {
          console.error(`Error getting URL from task history:`, error);
        }
        
        return NextResponse.json({
          success: false,
          error: "Task not found and could not retrieve results using alternative methods",
          status: "not_found",
          taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
          taskReadyError: taskReadyCheck.error
        }, { status: 404 });
      } else if (data.status_code === 40501) {
        console.log(`Task is still in progress (status code: 40501)`);
        return NextResponse.json({
          success: false,
          error: "Task is still in progress",
          status: "in_progress",
          taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
          taskReadyError: taskReadyCheck.error
        }, { status: 202 });
      } else {
        console.error(`Unexpected API response: ${data.status_code} - ${data.status_message || 'Unknown error'}`);
        return NextResponse.json({
          success: false,
          error: `Unexpected API response: ${data.status_code} - ${data.status_message || 'Unknown error'}`,
          status: "error",
          taskReadyStatus: taskReadyCheck.isReady ? "ready" : "not_ready",
          taskReadyError: taskReadyCheck.error
        }, { status: 500 });
      }
    } else {
      console.error(`Error getting task results: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      
      // If we get a 404, try to get the URL from task history and use the live endpoint
      if (response.status === 404) {
        console.log(`Task not found (404), trying to get URL from task history`);
        
        try {
          const { loadTaskHistory, getUrlForTaskId } = await import("@/lib/task-history");
          await loadTaskHistory(taskId); // Ensure task history is loaded
          const url = getUrlForTaskId(taskId);
          
          if (url) {
            console.log(`Found URL ${url} for task ${taskId} in history, trying live endpoint`);
            
            // Try the live endpoint with this URL
            const liveResults = await getLiveResults(url);
            
            if (liveResults.success) {
              console.log(`Successfully retrieved results from live endpoint for URL from history: ${url}`);
              
              // Format the response to match the expected structure
              const formattedData = {
                result: [{
                  items: [liveResults.data]
                }]
              };
              
              return NextResponse.json({
                success: true,
                data: formattedData,
                status: "completed",
                note: "Results from live endpoint (task not found)"
              });
            }
            
            // Try alternative URLs
            console.log(`Live endpoint failed for history URL, trying alternative URL formats`);
            const alternativeResults = await tryAlternativeURLs(url);
            
            if (alternativeResults.success) {
              console.log(`Successfully retrieved results from alternative URL format for history URL`);
              
              // Format the response to match the expected structure
              let formattedData;
              
              // Check if alternativeResults.data already has the right structure
              if (alternativeResults.data.result[0].items[0].lighthouse_result) {
                console.log('Alternative URL result already has lighthouse_result');
                formattedData = alternativeResults.data.result[0].items[0];
              } else if (alternativeResults.data.result[0].items[0].categories && alternativeResults.data.result[0].items[0].audits) {
                console.log('Alternative URL result has categories and audits directly');
                formattedData = {
                  lighthouse_result: alternativeResults.data.result[0].items[0]
                };
              } else {
                console.log('Wrapping alternative URL result in standard format');
                formattedData = {
                  lighthouse_result: alternativeResults.data.result[0].items[0]
                };
              }
              
              return NextResponse.json({
                success: true,
                data: {
                  result: [{
                    items: [formattedData]
                  }]
                },
                status: "completed",
                note: "Results from live endpoint with alternative URL format (task not found)"
              });
            }
            
            console.log(`All attempts to get results failed for history URL ${url}`);
          } else {
            console.log(`No URL found in history for task ${taskId}`);
          }
        } catch (error) {
          console.error(`Error getting URL from task history:`, error);
        }
        
        return NextResponse.json({
          success: false,
          error: "Task not found and could not retrieve results using alternative methods",
          status: "not_found"
        }, { status: 404 });
      } else if (response.status === 202) {
        // Task is still processing
        return NextResponse.json({
          success: false,
          error: "Task is still processing",
          status: "in_progress"
        }, { status: 202 });
      } else {
        // Other error
        return NextResponse.json({
          success: false,
          error: `Error getting task results: ${response.status} - ${errorText}`,
          status: "error"
        }, { status: response.status });
      }
    }
  } catch (error) {
    console.error(`Error in Lighthouse task get:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in Lighthouse task get",
      status: "error"
    }, { status: 500 });
  }
}
