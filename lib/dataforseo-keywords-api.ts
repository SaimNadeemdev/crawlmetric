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
  KEYWORD_IDEAS: "/dataforseo_labs/google/keyword_ideas/live",
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

    // Log response text for debugging
    console.log(`Raw API response: ${responseText.substring(0, 200)}...`)

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
      
      // Additional validation for the expected structure
      if (!jsonResponse) {
        throw new Error("Empty JSON response")
      }
      
      return jsonResponse
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError)
      console.error("Raw response text:", responseText.substring(0, 500))
      throw new Error(`Failed to parse JSON response: ${parseError}`)
    }
  } catch (error) {
    console.error("API request error:", error)
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
      cache: "no-store",
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
  locationCode: number = 2840, // Default to United States (2840)
  languageCode: string = "en", // Default to English
  limit: number = 50
): Promise<any> {
  try {
    console.log(`[API] Getting keywords for site: ${target}, location code: ${locationCode}, language code: ${languageCode}, limit: ${limit}`);
    
    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/api/dataforseo`
    
    // Ensure target is properly formatted - remove https:// or http:// as the API expects just the domain
    let formattedTarget = target;
    if (formattedTarget.startsWith("https://")) {
      formattedTarget = formattedTarget.replace("https://", "");
    } else if (formattedTarget.startsWith("http://")) {
      formattedTarget = formattedTarget.replace("http://", "");
    }
    
    // Remove www. prefix if present
    if (formattedTarget.startsWith("www.")) {
      formattedTarget = formattedTarget.replace("www.", "");
    }
    
    // Remove trailing slash if present
    if (formattedTarget.endsWith("/")) {
      formattedTarget = formattedTarget.slice(0, -1);
    }
    
    console.log(`[API] Formatted target: ${formattedTarget}`);
    
    // Make a request using the same structure as getKeywordSuggestions
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: "/dataforseo_labs/google/keywords_for_site/live",
        data: [
          {
            target: formattedTarget,
            language_code: languageCode,
            location_code: locationCode,
            include_serp_info: true,
            include_subdomains: true,
            limit: limit
          }
        ],
        login: DATAFORSEO_LOGIN,
        password: DATAFORSEO_PASSWORD,
      }),
      cache: "no-store",
    });
    
    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] HTTP error: ${response.status} ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const result = await response.json();
    
    // Log the response structure similar to getKeywordSuggestions
    console.log("[API] Response received:", JSON.stringify({
      success: result.success,
      dataLength: result.data ? result.data.length : 0
    }, null, 2));
    
    // Check if the request was successful
    if (!result.success) {
      throw new Error(result.error || "Unknown API error");
    }
    
    // Check if data exists and is an array
    if (!Array.isArray(result.data)) {
      console.error("[API] Invalid data format:", result);
      throw new Error("Invalid response format: data is not an array");
    }
    
    return result;
  } catch (error) {
    console.error("[API] Error getting keywords for site:", error);
    throw error;
  }
}

// Get keywords for categories - updated for DataForSEO Labs API
export async function getKeywordsForCategories(
  category: string,
  locationName: string = "United States",
  languageName: string = "English",
  limit: number = 50,
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
  locationName: string = "United States",
  languageName: string = "English",
) {
  try {
    if (!keywords || keywords.length === 0) {
      throw new Error("Keywords array cannot be empty");
    }

    console.log(`[CLIENT] Making historical_search_volume request for ${keywords.length} keywords`);
    
    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/api/dataforseo`
    
    // Make a direct request like the working endpoints do
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: ENDPOINTS.HISTORICAL_SEARCH_VOLUME,
        data: [
          {
            keywords, // This is an array of keywords
            location_name: locationName,
            language_name: languageName,
          },
        ],
        login: DATAFORSEO_LOGIN,
        password: DATAFORSEO_PASSWORD,
      }),
      cache: "no-store",
    });

    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CLIENT] HTTP error: ${response.status} ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const result = await response.json();
    
    // Log the response structure
    console.log("[CLIENT] Response received:", JSON.stringify({
      success: result.success,
      dataLength: result.data ? result.data.length : 0
    }, null, 2));
    
    // Check if the request was successful
    if (!result.success) {
      throw new Error(result.error || "Unknown API error");
    }
    
    // Check if data exists and is an array
    if (!Array.isArray(result.data)) {
      console.error("[CLIENT] Invalid data format:", result);
      throw new Error("Invalid response format: data is not an array");
    }
    
    return { data: result.data };
  } catch (error) {
    console.error("Error getting historical search volume:", error);
    throw error;
  }
}

// Get bulk keyword difficulty - updated for DataForSEO Labs API
export async function getBulkKeywordDifficulty(
  keywords: string[],
  locationName: string = "United States",
  languageName: string = "English",
) {
  try {
    if (!keywords || keywords.length === 0) {
      throw new Error("Keywords array cannot be empty");
    }
    
    console.log(`[CLIENT] Making bulk_keyword_difficulty request for ${keywords.length} keywords`);
    
    // Process the keywords in batches of 100
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      batches.push(keywords.slice(i, i + batchSize));
    }
    
    console.log(`[CLIENT] Processing ${batches.length} batches of keywords`);
    
    // Just process the first batch for now to test the API
    const batch = batches[0];
    console.log(`[CLIENT] Processing batch of ${batch.length} keywords`);
    
    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/api/dataforseo`
    
    // Make a direct request like the working endpoints do
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: ENDPOINTS.BULK_KEYWORD_DIFFICULTY,
        data: [
          {
            keywords: batch,
            location_name: locationName,
            language_name: languageName,
          },
        ],
        login: DATAFORSEO_LOGIN,
        password: DATAFORSEO_PASSWORD,
      }),
      cache: "no-store",
    });

    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CLIENT] HTTP error: ${response.status} ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const result = await response.json();
    
    // Log the response structure
    console.log("[CLIENT] Response received:", JSON.stringify({
      success: result.success,
      dataLength: result.data ? result.data.length : 0
    }, null, 2));
    
    // Check if the request was successful
    if (!result.success) {
      throw new Error(result.error || "Unknown API error");
    }
    
    // Check if data exists and is an array
    if (!Array.isArray(result.data)) {
      console.error("[CLIENT] Invalid data format:", result);
      throw new Error("Invalid response format: data is not an array");
    }
    
    return { data: result.data };
  } catch (apiError) {
    console.error("API error for bulk keyword difficulty:", apiError);
    throw apiError;
  }
}

// Get keyword trends - updated for DataForSEO Labs API
export async function getKeywordTrends(keyword: string, locationName: string = "United States", languageName: string = "English") {
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
export async function getSerpCompetitors(keyword: string, locationName: string = "United States", languageName: string = "English") {
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
  locationName: string = "United States",
  languageName: string = "English",
  limit: number = 50,
) {
  try {
    if (!keyword || keyword.trim() === "") {
      throw new Error("Keyword cannot be empty");
    }
    
    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/api/dataforseo`
    
    // Make a direct request like the working endpoints do
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: ENDPOINTS.KEYWORD_IDEAS,
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
      cache: "no-store",
    });

    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CLIENT] HTTP error: ${response.status} ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const result = await response.json();
    
    // Log the response structure
    console.log("[CLIENT] Response received:", JSON.stringify({
      success: result.success,
      dataLength: result.data ? result.data.length : 0
    }, null, 2));
    
    // Check if the request was successful
    if (!result.success) {
      throw new Error(result.error || "Unknown API error");
    }
    
    // Check if data exists and is an array
    if (!Array.isArray(result.data)) {
      console.error("[CLIENT] Invalid data format:", result);
      throw new Error("Invalid response format: data is not an array");
    }
    
    return { data: result.data };
  } catch (error) {
    console.error("Error getting keyword ideas:", error);
    throw error;
  }
}

// Get search intent for keywords - updated for DataForSEO Labs API
export async function getSearchIntent(
  keywords: string[],
  locationName: string = "United States",
  languageName: string = "English",
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
