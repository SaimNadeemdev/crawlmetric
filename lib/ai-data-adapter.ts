"use server"

/**
 * AI-powered data adapter for transforming API responses
 * This module provides intelligent transformation of various API response formats
 * into standardized structures for the application.
 */

import { z } from "zod"

// Define the expected output schema for keyword research data
const KeywordDataSchema = z.object({
  keyword: z.string(),
  search_volume: z.number().default(0),
  keyword_difficulty: z.number().default(0),
  cpc: z.number().default(0),
  competition: z.number().nullable().default(0),
  competition_level: z.string().optional(),
  categories: z.array(z.any()).default([]),
  trend: z.array(z.any()).default([]),
})

type KeywordData = z.infer<typeof KeywordDataSchema>

/**
 * Intelligent path finder that searches for a value in a nested object
 * using various common property naming patterns
 */
async function findValueInObject(obj: any, targetKey: string): Promise<any> {
  // Direct match
  if (obj[targetKey] !== undefined) {
    return obj[targetKey]
  }

  // Check for common nested structures
  const commonContainers = [
    "keyword_info",
    "keyword_properties",
    "info",
    "properties",
    "data",
    "metrics",
    "stats"
  ]

  // Check in common containers
  for (const container of commonContainers) {
    if (obj[container] && obj[container][targetKey] !== undefined) {
      return obj[container][targetKey]
    }
  }

  // Check for camelCase, snake_case, and kebab-case variations
  const camelCase = targetKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  const snakeCase = targetKey.replace(/([A-Z])/g, "_$1").toLowerCase()
  const kebabCase = targetKey.replace(/([A-Z])/g, "-$1").toLowerCase()

  const variations = [camelCase, snakeCase, kebabCase]
  
  for (const variation of variations) {
    if (obj[variation] !== undefined) {
      return obj[variation]
    }
    
    // Check in common containers with variations
    for (const container of commonContainers) {
      if (obj[container] && obj[container][variation] !== undefined) {
        return obj[container][variation]
      }
    }
  }

  // Recursive search in nested objects (but not arrays to avoid performance issues)
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const result = await findValueInObject(obj[key], targetKey)
      if (result !== undefined) {
        return result
      }
    }
  }

  return undefined
}

/**
 * Intelligently transforms any keyword data object into a standardized format
 * This function will search through nested structures to find the relevant data
 */
export async function transformKeywordData(item: any): Promise<KeywordData> {
  try {
    // Special handling for keyword difficulty which can be in multiple places
    // DataForSEO uses different field names across their API endpoints
    let keywordDifficulty = 0;
    
    // Direct object access for common DataForSEO structures
    if (item.keyword_properties && item.keyword_properties.keyword_difficulty !== undefined) {
      keywordDifficulty = Number(item.keyword_properties.keyword_difficulty);
      console.log("[AI-ADAPTER] Found keyword_difficulty in keyword_properties:", keywordDifficulty);
    } else if (item.keyword_info && item.keyword_info.keyword_difficulty !== undefined) {
      keywordDifficulty = Number(item.keyword_info.keyword_difficulty);
      console.log("[AI-ADAPTER] Found keyword_difficulty in keyword_info:", keywordDifficulty);
    } else if (item.keyword_data && item.keyword_data.keyword_difficulty !== undefined) {
      keywordDifficulty = Number(item.keyword_data.keyword_difficulty);
      console.log("[AI-ADAPTER] Found keyword_difficulty in keyword_data:", keywordDifficulty);
    } else if (item.difficulty !== undefined) {
      keywordDifficulty = Number(item.difficulty);
      console.log("[AI-ADAPTER] Found difficulty directly on item:", keywordDifficulty);
    } else if (item.keyword_difficulty !== undefined) {
      keywordDifficulty = Number(item.keyword_difficulty);
      console.log("[AI-ADAPTER] Found keyword_difficulty directly on item:", keywordDifficulty);
    } else if (item.seo_difficulty !== undefined) {
      keywordDifficulty = Number(item.seo_difficulty);
      console.log("[AI-ADAPTER] Found seo_difficulty directly on item:", keywordDifficulty);
    }
    
    // If still no value, try the generic finder
    if (keywordDifficulty === 0) {
      // Try all possible locations and names for keyword difficulty
      const difficultyOptions = [
        await findValueInObject(item, "keyword_difficulty"),
        await findValueInObject(item, "difficulty"),
        await findValueInObject(item, "seo_difficulty"),
        await findValueInObject(item, "difficulty_index"),
        await findValueInObject(item, "serp_difficulty"),
      ];
      
      // Use the first non-null value
      for (const option of difficultyOptions) {
        if (option !== undefined && option !== null) {
          keywordDifficulty = Number(option);
          console.log("[AI-ADAPTER] Found difficulty via deep search:", keywordDifficulty);
          break;
        }
      }
    }
    
    // Create a base object with default values
    const transformedData: Partial<KeywordData> = {
      keyword: await findValueInObject(item, "keyword") || "",
      search_volume: Number(await findValueInObject(item, "search_volume")) || 0,
      keyword_difficulty: keywordDifficulty,
      cpc: Number(await findValueInObject(item, "cpc")) || 0,
      competition: Number(await findValueInObject(item, "competition")) || 0,
      competition_level: await findValueInObject(item, "competition_level") || "",
    }

    // Handle categories (could be under different names)
    const categories = 
      await findValueInObject(item, "categories") || 
      await findValueInObject(item, "category") || 
      await findValueInObject(item, "tags") || 
      []
    
    transformedData.categories = Array.isArray(categories) ? categories : [categories].filter(Boolean)

    // Handle trend data (could be under different names)
    const trend = 
      await findValueInObject(item, "trend") || 
      await findValueInObject(item, "monthly_searches") || 
      await findValueInObject(item, "historical_data") || 
      []
    
    transformedData.trend = Array.isArray(trend) ? trend : [trend].filter(Boolean)

    // Validate and return the data
    return KeywordDataSchema.parse(transformedData)
  } catch (error) {
    console.error("Error transforming keyword data:", error)
    // Return a valid object with defaults even if transformation fails
    return KeywordDataSchema.parse({ keyword: item.keyword || "Unknown keyword" })
  }
}

/**
 * Process an array of keyword items from any API response
 */
export async function processKeywordItems(items: any[]): Promise<KeywordData[]> {
  if (!Array.isArray(items)) {
    console.warn("Expected array of items but received:", typeof items)
    return []
  }
  
  return Promise.all(items.map(transformKeywordData))
}

/**
 * Intelligent adapter for DataForSEO API responses
 * This function handles different endpoint responses and extracts the relevant data
 */
export async function adaptDataForSeoResponse(response: any, endpoint: string): Promise<any[]> {
  try {
    // Validate response structure
    if (!response || !response.tasks || !Array.isArray(response.tasks) || response.tasks.length === 0) {
      console.warn("Invalid DataForSEO response structure:", response)
      return []
    }

    const task = response.tasks[0]
    
    // Check if task has results
    if (!task.result || !Array.isArray(task.result) || task.result.length === 0) {
      console.warn("No results found in DataForSEO task:", task)
      return []
    }

    // Extract items based on common DataForSEO response patterns
    let items: any[] = []
    
    if (task.result[0].items && Array.isArray(task.result[0].items)) {
      // Most common pattern
      items = task.result[0].items
    } else if (Array.isArray(task.result)) {
      // Some endpoints return results directly
      items = task.result
    } else {
      console.warn("Could not find items array in response:", task.result)
      return []
    }

    // Process the items using our intelligent transformer
    return await processKeywordItems(items)
  } catch (error) {
    console.error("Error adapting DataForSEO response:", error)
    return []
  }
}
