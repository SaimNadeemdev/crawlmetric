"use server"

import { getBaseUrl } from "@/lib/utils"
import type { KeywordSuggestion } from "@/types/keyword"

// Update the ENDPOINTS object to use the correct endpoint for bulk keyword difficulty
const ENDPOINTS = {
  // DataForSEO Labs API endpoints
  KEYWORD_SUGGESTIONS: "/dataforseo_labs/google/keyword_suggestions/live",
  KEYWORDS_FOR_SITE: "/dataforseo_labs/google/keywords_for_site/live",
  KEYWORDS_FOR_CATEGORIES: "/dataforseo_labs/google/keywords_for_categories/live",
  HISTORICAL_SEARCH_VOLUME: "/dataforseo_labs/google/historical_search_volume/live",
  BULK_KEYWORD_DIFFICULTY: "/dataforseo_labs/google/bulk_keyword_difficulty/live",
  KEYWORD_TRENDS: "/dataforseo_labs/google/keyword_search_volume/live", // Changed from keyword_trends
  SERP_COMPETITORS: "/dataforseo_labs/google/competitors_domain/live",
  KEYWORD_IDEAS: "/dataforseo_labs/google/related_keywords/live",
  SEARCH_INTENT: "/dataforseo_labs/google/search_intent/live",
}

// DataForSEO API credentials
// Hardcoded for development only - in production these should be environment variables
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || "saim@makewebeasy.llc";
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || "af0929d9a9ee7cad";

// Log credentials for debugging (first 4 chars only)
console.log("DataForSEO API credentials:", {
  login: DATAFORSEO_LOGIN ? DATAFORSEO_LOGIN.substring(0, 4) + "..." : "not set",
  password: DATAFORSEO_PASSWORD ? DATAFORSEO_PASSWORD.substring(0, 4) + "..." : "not set",
});

// Helper function to make API requests through our Next.js API route
async function makeRequest(endpoint: string, data?: any) {
  try {
    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/api/dataforseo`

    console.log(`Making request to DataForSEO API via: ${apiUrl}`)
    console.log(`Endpoint: ${endpoint}`)

    // Don't log sensitive data in production
    if (process.env.NODE_ENV !== "production") {
      console.log(`Request data:`, JSON.stringify(data))
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
        data,
        login: DATAFORSEO_LOGIN,
        password: DATAFORSEO_PASSWORD,
      }),
      cache: "no-store",
    })

    // Get the response text first
    const responseText = await response.text()

    console.log(`Response status: ${response.status}`)

    // Don't log potentially sensitive data in production
    if (process.env.NODE_ENV !== "production") {
      console.log(`Response preview: ${responseText.substring(0, 200)}...`)
    }

    // Check if the response starts with HTML tags, which indicates an error page
    if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
      console.error(`API returned HTML instead of JSON. Status: ${response.status}`)
      throw new Error(`API returned HTML instead of JSON. Status: ${response.status}`)
    }

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`)
      throw new Error(`API request failed with status ${response.status}: ${responseText}`)
    }

    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(responseText)
      
      // Check if the response has the expected structure
      if (!jsonResponse.success && jsonResponse.error) {
        throw new Error(`API error: ${jsonResponse.error}`)
      }
      
      // For keywords_for_site endpoint, handle the special case
      if (endpoint.includes('keywords_for_site') && jsonResponse.data) {
        // If data is directly available, return it
        return jsonResponse
      }
      
      return jsonResponse
    } catch (parseError) {
      console.error("Error parsing response as JSON:", parseError)
      throw new Error(
        `Failed to parse API response as JSON. Response starts with: ${responseText.substring(0, 100)}...`,
      )
    }
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error)
    throw error
  }
}

// Define intent types interface
interface IntentTypes {
  informational: number;
  navigational: number;
  transactional: number;
  commercial: number;
  [key: string]: number; // Add index signature to allow string indexing
}

// Define the structure for bulk keyword difficulty result
interface KeywordDifficultyResult {
  keyword: string;
  keyword_difficulty: number;
  search_volume: number;
  cpc: number;
  competition: number;
  competition_level: string;
}

// Get keyword suggestions - updated for DataForSEO Labs API
export async function getKeywordSuggestions(
  keyword: string,
  locationName: string,
  languageName: string,
  limit: number,
): Promise<KeywordSuggestion[]> {
  console.log(
    `Running keyword research with params:`,
    JSON.stringify({
      mode: "keyword_suggestions",
      locationName,
      languageName,
      keyword,
      limit,
    }),
  )

  try {
    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/api/dataforseo`

    console.log(`Making request to DataForSEO API via: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "/dataforseo_labs/google/keyword_suggestions/live",
        data: [
          {
            keyword,
            location_name: locationName,
            language_name: languageName,
            limit,
          },
        ],
        login: DATAFORSEO_LOGIN,
        password: DATAFORSEO_PASSWORD,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API response error:", response.status, errorText)
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    // Log the full response for debugging
    console.log("API response:", JSON.stringify(result, null, 2))

    if (!result.success) {
      throw new Error(result.error || "Unknown API error")
    }

    // Check if data exists and is an array
    if (!Array.isArray(result.data)) {
      console.error("Invalid data format:", result)
      throw new Error("Invalid response format: data is not an array")
    }

    return result.data
  } catch (error: any) {
    console.error("Error in getKeywordSuggestions:", error)
    throw new Error(`Error getting keyword suggestions: ${error.message}`)
  }
}

// Get keywords for a site - updated for DataForSEO Labs API
export async function getKeywordsForSite(
  target: string,
  locationName = "United States",
  languageName = "English",
  limit = 50,
) {
  try {
    // Ensure target is properly formatted
    const formattedTarget = target.trim().toLowerCase();
    // Add protocol if missing
    const targetWithProtocol = formattedTarget.startsWith('http') 
      ? formattedTarget 
      : `https://${formattedTarget}`;
    
    console.log(`[CLIENT] Making keywords_for_site request for target: ${targetWithProtocol}`);
    
    // Follow the same pattern as getKeywordSuggestions
    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/api/dataforseo`

    console.log(`Making request to DataForSEO API via: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: ENDPOINTS.KEYWORDS_FOR_SITE,
        data: [
          {
            target: targetWithProtocol,
            location_name: locationName,
            language_name: languageName,
            limit: Number(limit),
            include_serp_info: true,
            include_subdomains: true,
          },
        ],
        login: DATAFORSEO_LOGIN,
        password: DATAFORSEO_PASSWORD,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API response error:", response.status, errorText)
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    // Log the full response for debugging
    console.log("API response:", JSON.stringify(result, null, 2).substring(0, 1000) + "...")

    // Extract the items directly from the response to ensure consistent data format
    let processedResult = result;
    
    // Check if the result has a tasks array (standard DataForSEO format)
    if (result && result.tasks && Array.isArray(result.tasks) && result.tasks.length > 0) {
      // Extract items from the first task that has results
      for (const task of result.tasks) {
        if (task.result && Array.isArray(task.result) && task.result.length > 0) {
          // If task.result[0] has items, use those
          if (task.result[0].items && Array.isArray(task.result[0].items)) {
            console.log(`[CLIENT] Found ${task.result[0].items.length} items in task.result[0].items`);
            processedResult = task.result[0].items;
            break;
          }
          // Otherwise use task.result directly
          console.log(`[CLIENT] Found ${task.result.length} items in task.result`);
          processedResult = task.result;
          break;
        } else if (task.result && task.result.items && Array.isArray(task.result.items)) {
          // If task.result has items property, use that
          console.log(`[CLIENT] Found ${task.result.items.length} items in task.result.items`);
          processedResult = task.result.items;
          break;
        }
      }
    }
    
    // Ensure keyword_difficulty is correctly set
    if (Array.isArray(processedResult)) {
      processedResult = processedResult.map((item: any) => {
        // Create a copy of the item
        const enhancedItem = { ...item };
        
        // Set keyword_difficulty from the most reliable source
        if (item.keyword_properties && typeof item.keyword_properties.keyword_difficulty === 'number') {
          enhancedItem.keyword_difficulty = item.keyword_properties.keyword_difficulty;
          console.log(`[API Client] Using keyword_properties.keyword_difficulty: ${enhancedItem.keyword_difficulty}`);
        } else if (item.keyword_info && typeof item.keyword_info.keyword_difficulty === 'number') {
          enhancedItem.keyword_difficulty = item.keyword_info.keyword_difficulty;
          console.log(`[API Client] Using keyword_info.keyword_difficulty: ${enhancedItem.keyword_difficulty}`);
        } else if (typeof item.keyword_difficulty === 'number') {
          // Keep existing value
          console.log(`[API Client] Using existing keyword_difficulty: ${item.keyword_difficulty}`);
        } else {
          // Default to medium difficulty
          enhancedItem.keyword_difficulty = 50;
          console.log(`[API Client] No keyword difficulty found, using default: 50`);
        }
        
        return enhancedItem;
      });
    }
    
    console.log(`[CLIENT] Returning processed result with ${Array.isArray(processedResult) ? processedResult.length : 'unknown'} items`);
    return processedResult;
  } catch (error) {
    console.error("Error getting keywords for site:", error);
    throw error;
  }
}

// Get keywords for categories - updated for DataForSEO Labs API
export async function getKeywordsForCategories(
  category: string,
  locationName = "United States",
  languageName = "English",
  limit = 50,
) {
  try {
    const data = [
      {
        category_code: category,
        location_name: locationName,
        language_name: languageName,
        limit,
      },
    ]

    const response = await makeRequest(ENDPOINTS.KEYWORDS_FOR_CATEGORIES, data)

    if (!response || !response.tasks || !Array.isArray(response.tasks) || response.tasks.length === 0) {
      throw new Error("Invalid response from API - missing tasks array")
    }

    return response.tasks[0]
  } catch (error) {
    console.error("Error getting keywords for categories:", error)
    throw error
  }
}

// Get historical search volume - updated for DataForSEO Labs API
export async function getHistoricalSearchVolume(
  keywords: string[],
  locationName = "United States",
  languageName = "English",
) {
  try {
    const data = [
      {
        keywords,
        location_name: locationName,
        language_name: languageName,
      },
    ]

    const response = await makeRequest(ENDPOINTS.HISTORICAL_SEARCH_VOLUME, data)

    if (!response || !response.tasks || !Array.isArray(response.tasks) || response.tasks.length === 0) {
      throw new Error("Invalid response from API - missing tasks array")
    }

    return response.tasks[0]
  } catch (error) {
    console.error("Error getting historical search volume:", error)
    throw error
  }
}

// Get bulk keyword difficulty - updated for DataForSEO Labs API
export async function getBulkKeywordDifficulty(
  keywords: string[],
  locationName = "United States",
  languageName = "English",
) {
  try {
    console.log(`[CLIENT] Making bulk_keyword_difficulty request for ${keywords.length} keywords`);
    
    // First, get search volume data for all keywords
    const volumeData = await getHistoricalSearchVolume(keywords, locationName, languageName);
    
    // Create a map of keyword to volume data for easy lookup
    const volumeMap = new Map();
    volumeData.forEach((item: any) => {
      volumeMap.set(item.keyword, item);
    });
    
    // Process the keywords in batches of 100
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      batches.push(keywords.slice(i, i + batchSize));
    }
    
    console.log(`[CLIENT] Processing ${batches.length} batches of keywords`);
    
    // Process each batch
    const processedResult: { result: KeywordDifficultyResult[] } = { result: [] };
    
    for (const batch of batches) {
      console.log(`[CLIENT] Processing batch of ${batch.length} keywords`);
      
      // For each keyword in the batch
      batch.forEach((keyword) => {
        // Get the volume data for this keyword
        const volumeData = volumeMap.get(keyword) || {
          search_volume: 0,
          cpc: 0,
          competition: 0,
          competition_level: "LOW",
        };
        
        // Calculate keyword difficulty
        let keywordDifficulty = 0;
        
        if (volumeData.search_volume > 0) {
          // Standard SEO formula: higher volume + higher competition = higher difficulty
          keywordDifficulty = Math.min(
            Math.round((Math.log10(Math.max(volumeData.search_volume, 10)) * 10) + (volumeData.competition * 50)),
            100
          );
          
          console.log(`Calculated keyword_difficulty for ${keyword}: ${keywordDifficulty}`);
        }

        processedResult.result.push({
          keyword,
          keyword_difficulty: keywordDifficulty,
          search_volume: volumeData.search_volume,
          cpc: volumeData.cpc,
          competition: volumeData.competition,
          competition_level: volumeData.competition_level,
        })
      })
    }
    
    console.log("Processed combined data:", JSON.stringify(processedResult.result).substring(0, 500))
    
    return processedResult
  } catch (apiError) {
    console.error("API error for bulk keyword difficulty:", apiError)
    throw apiError
  }
}

// Get keyword trends - updated for DataForSEO Labs API
export async function getKeywordTrends(keyword: string, locationName = "United States", languageName = "English") {
  try {
    const data = [
      {
        keyword,
        location_name: locationName,
        language_name: languageName,
        include_serp_info: false, // Add this parameter to focus on trend data
        include_trends_info: true, // Add this parameter to ensure trend data is returned
      },
    ]

    const response = await makeRequest(ENDPOINTS.KEYWORD_TRENDS, data)

    if (!response || !response.tasks || !Array.isArray(response.tasks) || response.tasks.length === 0) {
      throw new Error("Invalid response from API - missing tasks array")
    }

    return response.tasks[0]
  } catch (error) {
    console.error("Error getting keyword trends:", error)
    throw error
  }
}

// Get SERP competitors - updated for DataForSEO Labs API
export async function getSerpCompetitors(keyword: string, locationName = "United States", languageName = "English") {
  try {
    const data = [
      {
        keyword,
        location_name: locationName,
        language_name: languageName,
      },
    ]

    const response = await makeRequest(ENDPOINTS.SERP_COMPETITORS, data)

    if (!response || !response.tasks || !Array.isArray(response.tasks) || response.tasks.length === 0) {
      throw new Error("Invalid response from API - missing tasks array")
    }

    return response.tasks[0]
  } catch (error) {
    console.error("Error getting SERP competitors:", error)
    throw error
  }
}

// Get keyword ideas - updated for DataForSEO Labs API
export async function getKeywordIdeas(
  keyword: string,
  locationName = "United States",
  languageName = "English",
  limit = 50,
) {
  try {
    const data = [
      {
        keyword,
        location_name: locationName,
        language_name: languageName,
        limit,
      },
    ]

    console.log("Keyword ideas request data:", JSON.stringify(data))
    const response = await makeRequest(ENDPOINTS.KEYWORD_IDEAS, data)

    if (!response || !response.tasks || !Array.isArray(response.tasks) || response.tasks.length === 0) {
      throw new Error("Invalid response from API - missing tasks array")
    }

    // Process the response to extract relevant data
    const result = response.tasks[0]
    if (!result.result || !Array.isArray(result.result) || result.result.length === 0) {
      throw new Error("No keyword ideas found")
    }

    // Extract and format the keyword ideas
    const formattedResults = result.result[0].items.map((item: any) => {
      const keywordData = item.keyword_data || {}
      const keywordInfo = keywordData.keyword_info || {}

      return {
        keyword: keywordData.keyword || "N/A",
        search_volume: keywordInfo.search_volume || 0,
        cpc: keywordInfo.cpc?.toFixed(2) || "0.00",
        competition: keywordInfo.competition || 0,
        competition_level: keywordInfo.competition_level || "N/A",
        keyword_difficulty: keywordData.keyword_properties?.keyword_difficulty || 0,
        intent: keywordData.search_intent_info?.main_intent || "N/A",
        related_keywords: item.related_keywords || [],
        trend: keywordInfo.search_volume_trend || { monthly: 0, quarterly: 0, yearly: 0 },
      }
    })

    // Update the response with formatted results
    result.result = formattedResults
    return result
  } catch (error) {
    console.error("Error getting keyword ideas:", error)
    throw error
  }
}

// Get search intent for keywords - updated for DataForSEO Labs API
export async function getSearchIntent(
  keywords: string[],
  locationName = "United States",
  languageName = "English",
) {
  try {
    console.log(`[CLIENT] Making search_intent request for ${keywords.length} keywords`);
    
    // Process the keywords in batches of 100
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      batches.push(keywords.slice(i, i + batchSize));
    }
    
    console.log(`[CLIENT] Processing ${batches.length} batches of keywords`);
    
    // Process each batch
    const transformedResult: any[] = [];
    
    for (const batch of batches) {
      console.log(`[CLIENT] Processing batch of ${batch.length} keywords`);
      
      const data = [
        {
          keywords: batch,
          location_name: locationName,
          language_name: languageName,
        },
      ]
      
      const response = await makeRequest(ENDPOINTS.SEARCH_INTENT, data)
      
      if (!response || !response.tasks || !Array.isArray(response.tasks) || response.tasks.length === 0) {
        console.error("[CLIENT] Invalid response format for search intent:", response);
        continue;
      }
      
      const task = response.tasks[0];
      
      if (task.status_code !== 20000 || !task.result || !Array.isArray(task.result)) {
        console.error("[CLIENT] Task error for search intent:", task.status_message);
        continue;
      }
      
      // Process each result
      for (const result of task.result) {
        if (!result.items || !Array.isArray(result.items)) {
          continue;
        }
        
        // Process each item
        for (const item of result.items) {
          const keyword = item.keyword || "";
          
          // Default main intent
          let mainIntent = "informational";
          
          // Initialize intent types with default values
          const intentTypes: IntentTypes = {
            informational: 0,
            navigational: 0,
            transactional: 0,
            commercial: 0,
          }
          
          // Process keyword intent data if available
          if (item.keyword_intent_data && Array.isArray(item.keyword_intent_data)) {
            for (const keywordItem of item.keyword_intent_data) {
              if (!keywordItem) continue;
              
              // Handle the primary intent
              if (keywordItem.keyword_intent && keywordItem.keyword_intent.label) {
                mainIntent = keywordItem.keyword_intent.label.toLowerCase()
                
                // Set the probability for the main intent
                if (keywordItem.keyword_intent.probability) {
                  const intentKey = mainIntent as keyof IntentTypes;
                  intentTypes[intentKey] = Math.round(keywordItem.keyword_intent.probability * 100)
                }
              }
              
              // Handle secondary intents
              if (keywordItem.secondary_keyword_intents && Array.isArray(keywordItem.secondary_keyword_intents)) {
                for (const intent of keywordItem.secondary_keyword_intents) {
                  if (intent.label && intent.probability) {
                    const intentKey = intent.label.toLowerCase();
                    if (intentTypes.hasOwnProperty(intentKey)) {
                      intentTypes[intentKey] = Math.round(intent.probability * 100)
                    }
                  }
                }
              }
            }
          }
          
          // If we have intent_types, use them
          if (item.intent_types) {
            for (const [key, value] of Object.entries(item.intent_types)) {
              if (intentTypes.hasOwnProperty(key)) {
                const intentKey = key as keyof IntentTypes;
                intentTypes[intentKey] = Math.round(Number(value))
              }
            }
          }
          
          // Create the transformed item
          transformedResult.push({
            keyword,
            main_intent: mainIntent,
            informational: intentTypes.informational,
            navigational: intentTypes.navigational,
            transactional: intentTypes.transactional,
            commercial: intentTypes.commercial,
          })
        }
      }
    }
    
    console.log(`[CLIENT] Transformed ${transformedResult.length} search intent results`);
    
    return { result: transformedResult }
  } catch (apiError) {
    console.error("API error for search intent:", apiError)
    throw apiError
  }
}
