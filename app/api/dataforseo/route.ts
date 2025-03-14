"use client"

import { type NextRequest, NextResponse } from "next/server"
import { adaptDataForSeoResponse } from "@/lib/ai-data-adapter"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


const DATAFORSEO_API_URL = "https://api.dataforseo.com/v3"
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || ""
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || ""

export async function POST(req: NextRequest) {
  try {
    const { endpoint, data, login: requestLogin, password: requestPassword } = await req.json()

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 })
    }

    // Extract mode from endpoint
    const mode = extractModeFromEndpoint(endpoint);
    console.log(`[SERVER] Extracted mode: ${mode}`);

    // Get DataForSEO credentials from environment variables or request body
    const login = requestLogin || process.env.DATAFORSEO_LOGIN
    const password = requestPassword || process.env.DATAFORSEO_PASSWORD

    // Log environment variables (without values for security)
    console.log("Environment variables check:", {
      hasLogin: !!login,
      hasPassword: !!password,
      loginLength: login ? login.length : 0,
      passwordLength: password ? password.length : 0,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATAFORSEO')).join(', '),
    })

    if (!login || !password) {
      console.error("DataForSEO credentials missing")
      return NextResponse.json(
        { error: "API credentials are required" },
        { status: 401 }
      )
    }

    // Log the request details
    console.log("DataForSEO API request:", {
      mode,
      endpoint,
      dataLength: data ? data.length : 0,
      firstItemSample: data && data.length > 0 ? JSON.stringify(data[0], null, 2) : "No data",
    })

    // Construct the API URL with the correct version path
    const apiUrl = `${DATAFORSEO_API_URL}${endpoint}`
    console.log("DataForSEO API URL:", apiUrl)

    // Create authorization token
    const auth = Buffer.from(`${login}:${password}`).toString("base64")

    // Make the API request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("DataForSEO API Error:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500),
      })
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      )
    }

    // Parse the response
    const result = await response.json()
    
    // Log the raw response structure to debug the issue
    console.log("DataForSEO API raw response structure:", JSON.stringify({
      status_code: result.status_code,
      status_message: result.status_message,
      tasks: result.tasks ? `Array with ${result.tasks.length} items` : "No tasks array",
      task_structure: result.tasks && result.tasks.length > 0 ? Object.keys(result.tasks[0]) : "N/A",
      result_structure: result.tasks && result.tasks.length > 0 && result.tasks[0].result ? 
        (Array.isArray(result.tasks[0].result) ? 
          `Array with ${result.tasks[0].result.length} items` : 
          "Not an array") : "No result in task",
      items_structure: result.tasks && result.tasks.length > 0 && result.tasks[0].result && 
        Array.isArray(result.tasks[0].result) && result.tasks[0].result.length > 0 && 
        result.tasks[0].result[0].items ? 
          `Array with ${result.tasks[0].result[0].items.length} items` : "No items array"
    }, null, 2).substring(0, 1000))
    
    if (result.status_code !== 20000) {
      console.error("DataForSEO API Error:", {
        statusCode: result.status_code,
        statusMessage: result.status_message || "Unknown error",
      })
      return NextResponse.json(
        { error: result.status_message || "API error" },
        { status: 400 }
      )
    }

    // Process the API response based on the endpoint
    const processedResult = processApiResponse(result, endpoint)
    
    // Log the processed response length
    console.log("Processed response:", {
      dataType: typeof processedResult,
      isArray: Array.isArray(processedResult),
      length: Array.isArray(processedResult) ? processedResult.length : 0,
    })

    // Return a consistent response format for all endpoints
    return NextResponse.json({
      success: true,
      data: processedResult,
    })
  } catch (error: any) {
    console.error("Error in DataForSEO API route:", error)
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    )
  }
}

// Helper function to determine the mode based on the endpoint
function extractModeFromEndpoint(endpoint: string): string {
  if (endpoint.includes("keyword_suggestions")) return "keyword_suggestions"
  if (endpoint.includes("keywords_for_site")) return "keywords_for_site"
  if (endpoint.includes("historical_search_volume")) return "historical_search_volume"
  if (endpoint.includes("bulk_keyword_difficulty")) return "bulk_keyword_difficulty"
  if (endpoint.includes("related_keywords")) return "keyword_ideas"
  if (endpoint.includes("search_intent")) return "search_intent"
  
  // Default fallback
  return endpoint.split("/").filter(Boolean).pop() || "unknown"
}

// Helper function to transform data based on the mode
function transformData(items: any[], mode: string): any[] {
  console.log(`Transforming data for mode: ${mode}`);
  console.log(`Number of items: ${items.length}`);
  
  switch (mode) {
    case "keyword_suggestions":
    case "keyword_ideas":
      return items.map((item) => {
        // Create a new object with the correct structure
        const processedItem = {
          ...item,
          // Force keyword_difficulty to use the value from keyword_properties
          keyword_difficulty: item.keyword_properties?.keyword_difficulty || 
                             item.keyword_info?.keyword_difficulty || 
                             (item.keyword_difficulty !== 0 ? item.keyword_difficulty : 50)
        };
        
        // Set difficulty level based on keyword difficulty
        let difficultyLevel = "Very Easy";
        const kd = processedItem.keyword_difficulty;
        
        if (kd >= 85) {
          difficultyLevel = "Very Hard";
        } else if (kd >= 70) {
          difficultyLevel = "Hard";
        } else if (kd >= 50) {
          difficultyLevel = "Medium";
        } else if (kd >= 30) {
          difficultyLevel = "Easy";
        }
        
        // Add difficulty level to the processed item
        processedItem.difficulty_level = difficultyLevel;
        
        // Ensure search_volume is available
        if (item.keyword_info && typeof item.keyword_info.search_volume !== 'undefined') {
          processedItem.search_volume = item.keyword_info.search_volume;
        }
        
        // Ensure competition data is available
        if (item.keyword_info) {
          processedItem.competition = item.keyword_info.competition;
          processedItem.competition_level = item.keyword_info.competition_level;
          processedItem.cpc = item.keyword_info.cpc;
        }
        
        return processedItem;
      })

    case "keywords_for_site":
      // Add extra logging for debugging
      console.log("[SERVER] Processing keywords_for_site data");
      console.log(`[SERVER] Items length: ${items.length}`);
      
      if (items.length === 0) {
        console.log("[SERVER] No items found for keywords_for_site");
        return [];
      }
      
      // Log the complete first item for debugging
      console.log("[SERVER] First item complete structure:", JSON.stringify(items[0], null, 2));
      
      return items.map((item) => {
        // Create a comprehensive processed item with all possible fields
        const processedItem: any = {
          keyword: item.keyword || "",  // Should be directly available in the item for keywords_for_site endpoint
          position: item.position || item.rank_position || item.rank_absolute || item.rank || 0,
          search_volume: 0,
          traffic: 0,
          traffic_cost: 0,
          cpc: 0,
          competition: 0,
          competition_level: "LOW",
          keyword_difficulty: 0,
          url: item.url || item.result_url || item.url_path || "",
          mode: "keywords_for_site"
        };
        
        // Log the keyword extraction for debugging
        console.log(`[SERVER] Processing keyword: ${processedItem.keyword} from:`, {
          hasKeyword: !!item.keyword,
          directKeyword: item.keyword,
          itemKeys: Object.keys(item)
        });
        
        // Extract keyword_info data
        if (item.keyword_info) {
          processedItem.search_volume = item.keyword_info.search_volume || 0;
          processedItem.cpc = item.keyword_info.cpc || 0;
          processedItem.competition = item.keyword_info.competition || 0;
          processedItem.competition_level = item.keyword_info.competition_level || "LOW";
        }
        
        // Extract traffic data
        if (typeof item.traffic !== 'undefined') {
          processedItem.traffic = item.traffic;
        }
        
        // Extract traffic cost data
        if (typeof item.traffic_cost !== 'undefined') {
          processedItem.traffic_cost = item.traffic_cost;
        }
        
        // Extract keyword_properties for keyword difficulty
        if (item.keyword_properties && typeof item.keyword_properties.keyword_difficulty !== 'undefined') {
          processedItem.keyword_difficulty = item.keyword_properties.keyword_difficulty;
        } else if (typeof item.keyword_difficulty !== 'undefined') {
          processedItem.keyword_difficulty = item.keyword_difficulty;
        }
        
        // Set difficulty level based on keyword difficulty
        let difficultyLevel = "Very Easy";
        const kd = processedItem.keyword_difficulty;
        
        if (kd >= 85) {
          difficultyLevel = "Very Hard";
        } else if (kd >= 70) {
          difficultyLevel = "Hard";
        } else if (kd >= 50) {
          difficultyLevel = "Medium";
        } else if (kd >= 30) {
          difficultyLevel = "Easy";
        }
        
        // Add difficulty level to the processed item
        processedItem.difficulty_level = difficultyLevel;
        
        // If all metrics are 0, add some mock data in development mode
        if (process.env.NODE_ENV !== 'production' && 
            processedItem.search_volume === 0 && 
            processedItem.cpc === 0 && 
            processedItem.competition === 0 && 
            processedItem.keyword_difficulty === 0) {
          console.log(`[SERVER] Adding mock data for keyword: ${processedItem.keyword}`);
          
          // Generate random but realistic values
          processedItem.search_volume = Math.floor(Math.random() * 10000) + 1000;
          processedItem.cpc = (Math.random() * 5).toFixed(2);
          processedItem.competition = Math.random().toFixed(2);
          processedItem.keyword_difficulty = Math.floor(Math.random() * 100);
          
          // Set competition level based on competition value
          if (processedItem.competition > 0.7) {
            processedItem.competition_level = "HIGH";
          } else if (processedItem.competition > 0.3) {
            processedItem.competition_level = "MEDIUM";
          } else {
            processedItem.competition_level = "LOW";
          }
          
          // Set difficulty level based on keyword difficulty
          if (processedItem.keyword_difficulty >= 85) {
            processedItem.difficulty_level = "Very Hard";
          } else if (processedItem.keyword_difficulty >= 70) {
            processedItem.difficulty_level = "Hard";
          } else if (processedItem.keyword_difficulty >= 50) {
            processedItem.difficulty_level = "Medium";
          } else if (processedItem.keyword_difficulty >= 30) {
            processedItem.difficulty_level = "Easy";
          } else {
            processedItem.difficulty_level = "Very Easy";
          }
          
          // Generate traffic based on search volume and position
          processedItem.traffic = Math.floor(processedItem.search_volume * 0.3);
          processedItem.traffic_cost = (processedItem.traffic * parseFloat(processedItem.cpc as string)).toFixed(2);
        }
        
        return processedItem;
      });

    case "historical_search_volume":
      console.log("[SERVER] Processing historical_search_volume data");
      console.log(`[SERVER] Items length: ${items.length}`);
      
      if (items.length === 0) {
        console.log("[SERVER] No items found for historical_search_volume");
        return [];
      }
      
      // Log the first item structure for debugging
      console.log("[SERVER] Historical Search Volume first item:", JSON.stringify(items[0], null, 2));
      
      return items.map((item) => {
        console.log(`[SERVER] Processing historical search volume for keyword: ${item.keyword}`);
        return {
          keyword: item.keyword || "",
          search_volume: item.keyword_info?.search_volume || 0,
          months: item.keyword_info?.monthly_searches || [],
          competition: item.keyword_info?.competition || 0,
          competition_level: item.keyword_info?.competition_level || "LOW",
          cpc: item.keyword_info?.cpc || 0,
          keyword_difficulty: item.keyword_properties?.keyword_difficulty || 0,
        };
      });

    case "bulk_keyword_difficulty":
      console.log("[SERVER] Processing bulk_keyword_difficulty data");
      console.log(`[SERVER] Items length: ${items.length}`);
      
      if (items.length === 0) {
        console.log("[SERVER] No items found for bulk_keyword_difficulty");
        return [];
      }
      
      // Log the first item structure for debugging
      console.log("[SERVER] Bulk Keyword Difficulty first item:", JSON.stringify(items[0], null, 2));
      
      return items.map((item) => {
        // Log the keyword being processed
        console.log(`[SERVER] Processing bulk_keyword_difficulty for keyword: ${item.keyword}`);
        
        // Create a new object with the correct structure
        const processedItem: any = {
          keyword: item.keyword || "",
          // Force keyword_difficulty to use the value from keyword_properties
          keyword_difficulty: item.keyword_difficulty || 50
        };
        
        // Set difficulty level based on keyword difficulty
        let difficultyLevel = "Very Easy";
        const kd = processedItem.keyword_difficulty;
        
        if (kd >= 85) {
          difficultyLevel = "Very Hard";
        } else if (kd >= 70) {
          difficultyLevel = "Hard";
        } else if (kd >= 50) {
          difficultyLevel = "Medium";
        } else if (kd >= 30) {
          difficultyLevel = "Easy";
        }
        
        // Add difficulty level to the processed item
        processedItem.difficulty_level = difficultyLevel;
        
        return processedItem;
      });

    case "keyword_ideas":
      console.log("[SERVER] Processing keyword_ideas data");
      console.log(`[SERVER] Items length: ${items.length}`);
      
      if (items.length === 0) {
        console.log("[SERVER] No items found for keyword_ideas");
        return [];
      }
      
      // Log the first item structure for debugging
      console.log("[SERVER] Keyword Ideas first item:", JSON.stringify(items[0], null, 2));
      
      return items.map((item) => {
        // Log the keyword being processed
        console.log(`[SERVER] Processing keyword ideas for keyword: ${item.keyword}`);
        
        // Create a comprehensive processed item with all possible fields
        const processedItem: any = {
          keyword: item.keyword || "",
          search_volume: 0,
          cpc: 0,
          competition: 0,
          competition_level: "LOW",
          keyword_difficulty: 0,
          mode: "keyword_ideas"
        };
        
        // Extract keyword_info data
        if (item.keyword_info) {
          processedItem.search_volume = item.keyword_info.search_volume || 0;
          processedItem.cpc = item.keyword_info.cpc || 0;
          processedItem.competition = item.keyword_info.competition || 0;
          processedItem.competition_level = item.keyword_info.competition_level || "LOW";
        }
        
        // Extract keyword_properties for keyword difficulty
        if (item.keyword_properties && typeof item.keyword_properties.keyword_difficulty !== 'undefined') {
          processedItem.keyword_difficulty = item.keyword_properties.keyword_difficulty;
        } else if (typeof item.keyword_difficulty !== 'undefined') {
          processedItem.keyword_difficulty = item.keyword_difficulty;
        }
        
        // Set difficulty level based on keyword difficulty
        let difficultyLevel = "Very Easy";
        const kd = processedItem.keyword_difficulty;
        
        if (kd >= 85) {
          difficultyLevel = "Very Hard";
        } else if (kd >= 70) {
          difficultyLevel = "Hard";
        } else if (kd >= 50) {
          difficultyLevel = "Medium";
        } else if (kd >= 30) {
          difficultyLevel = "Easy";
        }
        
        // Add difficulty level to the processed item
        processedItem.difficulty_level = difficultyLevel;
        
        return processedItem;
      });

    case "keyword_search_volume":
      return items.map((item) => ({
        keyword: item.keyword || "",
        search_volume: item.keyword_info?.search_volume || 0,
        trend: item.keyword_info?.monthly_searches || [],
      }))

    default:
      // For unknown modes, return the raw items
      return items
  }
}

// Helper function to determine difficulty level
function getDifficultyLevel(score: number): string {
  if (score >= 80) return "very hard"
  if (score >= 60) return "hard"
  if (score >= 40) return "moderate"
  if (score >= 20) return "easy"
  return "very easy"
}

// Helper function to process API response
function processApiResponse(result: any, endpoint: string): any[] {
  // Extract mode from endpoint
  const mode = extractModeFromEndpoint(endpoint);
  console.log(`[SERVER] Processing API response for mode: ${mode}, endpoint: ${endpoint}`);
  
  if (!result) {
    console.error("[SERVER] No result from API");
    return [];
  }
  
  // Log the full response for keywords_for_site to debug
  if (mode === "keywords_for_site") {
    console.log("[SERVER] Full keywords_for_site API response:", JSON.stringify(result, null, 2));
  }
  
  // Log the response structure
  console.log("[SERVER] Response structure:", {
    statusCode: result.status_code,
    hasTasks: !!result.tasks,
    hasResult: !!result.result
  });

  // For the live DataForSEO Labs endpoints (more direct format)
  if (endpoint.includes('/live')) {
    // Check for API errors
    if (result.status_code !== 20000) {
      console.error(`[SERVER] API error: ${result.status_code} ${result.status_message}`);
      return [];
    }
    
    let allItems: any[] = [];
    
    // Case 1: Result object contains items inside tasks -> result -> items (most common format)
    if (result.tasks && Array.isArray(result.tasks) && result.tasks.length > 0) {
      for (const task of result.tasks) {
        if (task.result && Array.isArray(task.result) && task.result.length > 0) {
          // This is the structure for keywords_for_site: tasks[0].result[0].items
          for (const resultItem of task.result) {
            if (resultItem.items && Array.isArray(resultItem.items)) {
              console.log(`[SERVER] Found ${resultItem.items.length} items in task.result[].items array`);
              allItems = [...allItems, ...resultItem.items];
            } else {
              console.log(`[SERVER] No items array in task.result item, adding directly`);
              allItems.push(resultItem);
            }
          }
        } else if (task.result && task.result.items && Array.isArray(task.result.items)) {
          // Alternative structure: tasks[0].result.items
          console.log(`[SERVER] Found ${task.result.items.length} items in task.result.items array`);
          allItems = [...allItems, ...task.result.items];
        }
      }
    }
    
    // Case 2: Direct access to result array
    if (result.result && Array.isArray(result.result)) {
      for (const resultItem of result.result) {
        if (resultItem.items && Array.isArray(resultItem.items)) {
          console.log(`[SERVER] Found ${resultItem.items.length} items in result[].items array`);
          allItems = [...allItems, ...resultItem.items];
        } else {
          console.log(`[SERVER] No items array in result item, adding directly`);
          allItems.push(resultItem);
        }
      }
    }
    
    console.log(`[SERVER] Extracted ${allItems.length} items from response`);
    
    // Transform data based on endpoint/mode
    return transformData(allItems, mode);
  }

  // Process tasks and results (for non-live endpoints)
  if (!result.tasks || !Array.isArray(result.tasks)) {
    console.error("[SERVER] Invalid response format: tasks not found or not an array");
    return [];
  }

  // Extract all items from all tasks
  let allItems: any[] = [];

  for (const task of result.tasks) {
    // Check for task-level errors
    if (task.status_code !== 20000) {
      console.error(`[SERVER] Task error: ${task.status_code} ${task.status_message}`);
      continue;
    }

    // Skip tasks with no results
    if (!task.result || !Array.isArray(task.result) || task.result.length === 0) {
      console.log("[SERVER] Task has no results, skipping");
      continue;
    }

    // Process each result in the task
    for (const resultItem of task.result) {
      // Some endpoints have items nested inside result items
      if (resultItem.items && Array.isArray(resultItem.items)) {
        allItems = [...allItems, ...resultItem.items];
      } else {
        // If not nested, add the result item directly
        allItems.push(resultItem);
      }
    }
  }

  console.log(`[SERVER] Extracted ${allItems.length} items from all tasks`);

  // Transform data based on the endpoint
  const transformedData = transformData(allItems, mode);
  
  // Return transformed data
  return transformedData;
}
