"use server"
import type { Keyword } from "@/types/keyword"

// DataForSEO API credentials
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

// DataForSEO API endpoints
const BASE_URL = "https://api.dataforseo.com/v3"
const SERP_ENDPOINT = `${BASE_URL}/serp/google/organic/live/advanced`
const LOCATIONS_ENDPOINT = `${BASE_URL}/serp/google/locations`
const LANGUAGES_ENDPOINT = `${BASE_URL}/serp/google/languages`

// Helper function for API requests
async function makeRequest(endpoint: string, method = "GET", body?: any) {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Basic ${AUTH_HEADER}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DataForSEO API error: ${response.status} ${errorText}`)
      return { error: `API error: ${response.status}` }
    }

    return await response.json()
  } catch (error) {
    console.error("DataForSEO API request failed:", error)
    return { error: "Request failed" }
  }
}

// Get available locations
export async function getLocations() {
  try {
    const data = await makeRequest(LOCATIONS_ENDPOINT)
    if (data.error) return []
    return data.tasks?.[0]?.result || []
  } catch (error) {
    console.error("Failed to fetch locations:", error)
    return []
  }
}

// Get available languages
export async function getLanguages() {
  try {
    const data = await makeRequest(LANGUAGES_ENDPOINT)
    if (data.error) return []
    return data.tasks?.[0]?.result || []
  } catch (error) {
    console.error("Failed to fetch languages:", error)
    return []
  }
}

// Search for a keyword and get rankings
export async function searchKeyword(keyword: string, domain: string, locationCode = "2840", languageCode = "en") {
  try {
    const body = [
      {
        keyword,
        location_code: locationCode,
        language_code: languageCode,
        device: "desktop",
        os: "windows",
        depth: 100, // Get top 100 results
      },
    ]

    const data = await makeRequest(SERP_ENDPOINT, "POST", body)

    // Check if we have an error
    if (data.error) {
      return {
        ranking: null,
        url: null,
        snippet: null,
        serp_data: null,
      }
    }

    // Process the results to find the domain's ranking
    const results = data.tasks?.[0]?.result?.[0]?.items || []
    let ranking = null
    let url = null
    let snippet = null

    // Check if we have a task error
    if (data.tasks?.[0]?.status_code !== 20000) {
      console.error("DataForSEO task error:", data.tasks?.[0])
      return { ranking, url, snippet, serp_data: null }
    }

    // Find the first instance of the domain in the results
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      // Only consider organic results
      if (result.type !== "organic") continue

      // Check if the domain matches (more flexible matching)
      if (
        result.domain === domain ||
        result.domain?.includes(domain) ||
        domain.includes(result.domain || "") ||
        (result.url && result.url.includes(domain))
      ) {
        ranking = i + 1 // Position is 1-based
        url = result.url
        snippet = result.description
        break // Stop after finding the first instance
      }
    }

    return {
      ranking,
      url,
      snippet,
      serp_data: data.tasks?.[0]?.result?.[0],
    }
  } catch (error) {
    console.error("Failed to search keyword:", error)
    // Return null values instead of throwing to prevent crashes
    return {
      ranking: null,
      url: null,
      snippet: null,
      serp_data: null,
    }
  }
}

// Add a new keyword to track
export async function addKeywordToTrack(
  userId: string,
  keywordData: {
    keyword: string
    domain: string
    location_name: string
    language_name: string
    location_code?: string
    language_code?: string
  },
) {
  try {
    if (!userId || !keywordData.keyword || !keywordData.domain) {
      return null
    }

    // Default location and language codes for US/English if not provided
    const locationCode = keywordData.location_code || "2840" // US
    const languageCode = keywordData.language_code || "en"

    // Search for the keyword to get current ranking
    const searchResult = await searchKeyword(keywordData.keyword, keywordData.domain, locationCode, languageCode)

    // Create a new keyword object with the search results
    const newKeyword: Keyword = {
      id: Date.now().toString(), // In a real app, this would be a DB-generated ID
      keyword: keywordData.keyword,
      domain: keywordData.domain,
      location_name: keywordData.location_name,
      language_name: keywordData.language_name,
      location_code: locationCode,
      language_code: languageCode,
      current_rank: searchResult.ranking,
      previous_rank: null,
      best_rank: searchResult.ranking,
      url: searchResult.url,
      snippet: searchResult.snippet,
      last_updated: new Date().toISOString(),
      user_id: userId,
    }

    return newKeyword
  } catch (error) {
    console.error("Failed to add keyword:", error)
    return null
  }
}

// Get keyword history (simulated for now, would be from DB in real app)
export async function getKeywordHistory(keywordId: string, period = "30d") {
  try {
    if (!keywordId) {
      return []
    }

    // In a real app, this would fetch from a database
    // For now, we'll generate simulated data

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
    const data = []
    const today = new Date()

    // Generate random but somewhat realistic ranking data
    let rank = Math.floor(Math.random() * 20) + 1 // Start between 1-20

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Random fluctuation between -2 and +2
      const fluctuation = Math.floor(Math.random() * 5) - 2
      rank = Math.max(1, rank + fluctuation)

      data.push({
        date: date.toISOString(),
        rank,
      })
    }

    return data.reverse() // Oldest to newest
  } catch (error) {
    console.error("Failed to get keyword history:", error)
    return []
  }
}

// Update keyword rankings
export async function updateKeywordRankings(userId: string, keywords: Keyword[]) {
  try {
    if (!userId || !Array.isArray(keywords) || keywords.length === 0) {
      return []
    }

    const updatedKeywords = []

    for (const keyword of keywords) {
      try {
        if (!keyword || !keyword.keyword || !keyword.domain) {
          updatedKeywords.push(keyword)
          continue
        }

        // Search for the keyword to get current ranking
        const searchResult = await searchKeyword(
          keyword.keyword,
          keyword.domain,
          keyword.location_code || "2840",
          keyword.language_code || "en",
        )

        // Update the keyword with new ranking data
        const updatedKeyword: Keyword = {
          ...keyword,
          previous_rank: keyword.current_rank,
          current_rank: searchResult.ranking,
          best_rank:
            searchResult.ranking !== null
              ? keyword.best_rank !== null
                ? Math.min(keyword.best_rank, searchResult.ranking)
                : searchResult.ranking
              : keyword.best_rank,
          url: searchResult.url || keyword.url,
          snippet: searchResult.snippet || keyword.snippet,
          last_updated: new Date().toISOString(),
        }

        updatedKeywords.push(updatedKeyword)
      } catch (error) {
        // If there's an error updating a specific keyword, keep the original
        console.error(`Error updating keyword ${keyword.keyword}:`, error)
        updatedKeywords.push(keyword)
      }
    }

    return updatedKeywords
  } catch (error) {
    console.error("Failed to update keyword rankings:", error)
    return keywords || []
  }
}

