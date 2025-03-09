import { type NextRequest, NextResponse } from "next/server"
import { adaptDataForSeoResponse } from "@/lib/ai-data-adapter"

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

    // For debugging only - log first few characters of credentials
    if (process.env.NODE_ENV !== 'production') {
      console.log("Credential debug info:", {
        loginPrefix: login ? login.substring(0, 4) + '...' : 'undefined',
        passwordPrefix: password ? password.substring(0, 4) + '...' : 'undefined',
      });
    }

    if (!login || !password) {
      console.error("DataForSEO credentials missing or invalid");
      return NextResponse.json(
        { error: "DataForSEO credentials not configured" },
        { status: 500 }
      )
    }

    // Log the request details (without credentials)
    console.log("DataForSEO API Request:", {
      endpoint,
      dataLength: data ? data.length : 0,
      firstItemSample: data && data.length > 0 ? JSON.stringify(data[0], null, 2) : "No data",
    })

    // Construct the API URL with the correct version path
    const apiUrl = `https://api.dataforseo.com/v3${endpoint}`
    console.log("DataForSEO API URL:", apiUrl)

    // Create authorization token
    const auth = Buffer.from(`${login}:${password}`).toString("base64")

    // Make request to DataForSEO API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(data),
    })

    // Check if the response is OK
    if (!response.ok) {
      console.error("DataForSEO API Error:", {
        status: response.status,
        statusText: response.statusText,
      })
      const errorText = await response.text()
      console.error(`[SERVER] DataForSEO API error: ${response.status} ${errorText}`)
      return NextResponse.json(
        { error: `DataForSEO API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const result = await response.json()

    // Log the response structure (for debugging)
    console.log("DataForSEO API Response Structure:", {
      hasStatus: !!result.status_code,
      statusCode: result.status_code,
      hasTasks: !!result.tasks,
      tasksLength: result.tasks ? result.tasks.length : 0,
      firstTaskSample: result.tasks && result.tasks.length > 0 
        ? {
            id: result.tasks[0].id,
            status: result.tasks[0].status_code,
            hasResult: !!result.tasks[0].result,
            resultType: result.tasks[0].result ? typeof result.tasks[0].result : null,
            isResultArray: result.tasks[0].result ? Array.isArray(result.tasks[0].result) : null,
            resultLength: result.tasks[0].result && Array.isArray(result.tasks[0].result) 
              ? result.tasks[0].result.length 
              : (result.tasks[0].result && result.tasks[0].result.items ? result.tasks[0].result.items.length : 0),
          }
        : "No tasks",
    })

    // Process the API response based on the endpoint
    let processedData = processApiResponse(result, endpoint);
    
    // For Keywords for Site mode, add extra validation and logging
    if (endpoint === "/dataforseo_labs/google/keywords_for_site/live") {
      console.log("[SERVER] Final processed data for Keywords for Site:", {
        isArray: Array.isArray(processedData),
        length: Array.isArray(processedData) ? processedData.length : 'not an array',
        firstItem: Array.isArray(processedData) && processedData.length > 0 
          ? JSON.stringify(processedData[0], null, 2).substring(0, 500) + '...' 
          : 'no items'
      });
      
      // If data is empty, create mock data for testing in development
      if ((!processedData || (Array.isArray(processedData) && processedData.length === 0)) && 
          process.env.NODE_ENV !== 'production') {
        console.log("[SERVER] Creating mock data for Keywords for Site in development environment");
        processedData = [
          {
            se_type: "google",
            keyword: "netflix shows",
            location_code: 2840,
            language_code: "en",
            keyword_info: {
              search_volume: 12000,
              cpc: 2.5,
              competition: 0.8,
              competition_level: "HIGH"
            },
            keyword_properties: {
              keyword_difficulty: 65
            }
          },
          {
            se_type: "google",
            keyword: "netflix movies",
            location_code: 2840,
            language_code: "en",
            keyword_info: {
              search_volume: 18000,
              cpc: 2.1,
              competition: 0.7,
              competition_level: "HIGH"
            },
            keyword_properties: {
              keyword_difficulty: 72
            }
          },
          {
            se_type: "google",
            keyword: "netflix login",
            location_code: 2840,
            language_code: "en",
            keyword_info: {
              search_volume: 25000,
              cpc: 1.8,
              competition: 0.5,
              competition_level: "MEDIUM"
            },
            keyword_properties: {
              keyword_difficulty: 45
            }
          }
        ];
      }
    }
    
    // Return the processed data
    return NextResponse.json({
      success: true,
      data: processedData,
    })
  } catch (error) {
    console.error("[SERVER] Error in DataForSEO API route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
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
        // Log the entire item structure for debugging
        console.log("[SERVER] Processing keyword item:", JSON.stringify(item, null, 2));
        
        // Create a new object with the correct structure
        const processedItem = {
          ...item,
          // Force keyword_difficulty to use the value from keyword_properties
          keyword_difficulty: item.keyword_properties?.keyword_difficulty || 
                             item.keyword_info?.keyword_difficulty || 
                             (item.keyword_difficulty !== 0 ? item.keyword_difficulty : 50)
        };
        
        // Log the processed item
        console.log(`[SERVER] Processed keyword_difficulty: ${processedItem.keyword_difficulty}`);
        
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
      
      // Log the structure of the first item
      console.log("[SERVER] First item structure:", JSON.stringify(items[0], null, 2));
      
      return items.map((item) => {
        // Log the item being processed
        console.log(`[SERVER] Processing item for keyword: ${item.keyword}`);
        
        // Create a new object with the correct structure
        const processedItem = {
          ...item,
          // Force keyword_difficulty to use the value from keyword_properties
          keyword_difficulty: item.keyword_properties?.keyword_difficulty || 
                             item.keyword_info?.keyword_difficulty || 
                             (item.keyword_difficulty !== 0 ? item.keyword_difficulty : 50)
        };
        
        // Log the processed item
        console.log(`[SERVER] Processed keyword_difficulty: ${processedItem.keyword_difficulty}`);
        
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
      });

    case "historical_search_volume":
      return items.map((item) => ({
        keyword: item.keyword || "",
        search_volume: item.keyword_info?.search_volume || 0,
        months: item.keyword_info?.monthly_searches || [],
      }))

    case "bulk_keyword_difficulty":
      console.log("[SERVER] Processing bulk_keyword_difficulty data");
      
      return items.map((item) => {
        // Log the complete item structure for debugging
        console.log(`[SERVER] Processing bulk_keyword_difficulty item:`, JSON.stringify(item, null, 2));
        
        // Create a new object with the correct structure
        const processedItem = {
          ...item,
          // Force keyword_difficulty to use the value from keyword_properties
          keyword_difficulty: item.keyword_properties?.keyword_difficulty || 
                             item.keyword_info?.keyword_difficulty || 
                             (item.keyword_difficulty !== 0 ? item.keyword_difficulty : 50)
        };
        
        // Log the processed item
        console.log(`[SERVER] Processed keyword_difficulty: ${processedItem.keyword_difficulty}`);
        
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
  // Check for API-level errors
  if (result.status_code !== 20000) {
    console.error(`[SERVER] DataForSEO API error: ${result.status_code} ${result.status_message}`)
    return [];
  }

  // Process tasks and results
  if (!result.tasks || !Array.isArray(result.tasks)) {
    console.error("[SERVER] Invalid response format: tasks not found or not an array")
    return [];
  }

  // Extract all items from all tasks
  let allItems: any[] = []

  for (const task of result.tasks) {
    // Check for task-level errors
    if (task.status_code !== 20000) {
      console.error(`[SERVER] Task error: ${task.status_code} ${task.status_message}`)
      continue
    }

    // Skip tasks with no results
    if (!task.result || !Array.isArray(task.result) || task.result.length === 0) {
      console.log("[SERVER] Task has no results, skipping")
      continue
    }

    // Process each result in the task
    for (const resultItem of task.result) {
      // Some endpoints have items nested inside result items
      if (resultItem.items && Array.isArray(resultItem.items)) {
        allItems = [...allItems, ...resultItem.items]
      } else {
        // If not nested, add the result item directly
        allItems.push(resultItem)
      }
    }
  }

  console.log(`[SERVER] Extracted ${allItems.length} items from all tasks`)

  // Transform data based on the endpoint
  const transformedData = transformData(allItems, extractModeFromEndpoint(endpoint));
  
  // Special handling for keywords_for_site mode
  if (endpoint === "/dataforseo_labs/google/keywords_for_site/live") {
    console.log(`[SERVER] Returning keywords_for_site data with ${transformedData.length} items`);
    
    // Add mode to the response for client-side processing
    return transformedData.map(item => ({...item, mode: "keywords_for_site"}));
  }

  // Return transformed data
  return transformedData;
}
