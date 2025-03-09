"use client"
import type { Keyword } from "@/types/keyword"
import {
  addKeywordToTrack,
  updateKeywordRankings,
  getKeywordHistory as fetchKeywordHistoryFromServer,
} from "./dataseo-api"

// Local storage keys
const KEYWORDS_STORAGE_KEY = "tracked_keywords"
const LAST_UPDATE_KEY = "last_keywords_update"

// Get user ID from localStorage with safety checks
function getUserId(): string {
  if (typeof window === "undefined") return ""

  try {
    // First try to get user ID from Supabase token
    const tokenData = localStorage.getItem("supabase.auth.token")
    if (tokenData) {
      try {
        const parsedToken = JSON.parse(tokenData)
        if (parsedToken && parsedToken.user && parsedToken.user.id) {
          return parsedToken.user.id
        }
      } catch (parseError) {
        console.error("Error parsing token data for user ID:", parseError)
      }
    }
    
    // Fallback to checking for user object
    const user = localStorage.getItem("user")
    if (!user) return ""

    const userData = JSON.parse(user)
    return userData && userData.id ? userData.id : ""
  } catch (e: unknown) {
    console.error("Error parsing user data:", e)
    return ""
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  try {
    // Check for the newer Supabase token format first
    const supabaseSession = localStorage.getItem('sb-nzxgnnpthtefahosnolm-auth-token')
    if (supabaseSession) {
      try {
        const parsedSession = JSON.parse(supabaseSession)
        return !!parsedSession.access_token
      } catch (parseError) {
        console.error("Error parsing newer token format:", parseError)
      }
    }
    
    // Fallback to older format if needed
    const tokenData = localStorage.getItem("supabase.auth.token")
    if (tokenData) {
      try {
        const parsedToken = JSON.parse(tokenData)
        return !!parsedToken.access_token || 
               (parsedToken.currentSession && !!parsedToken.currentSession.access_token)
      } catch (parseError) {
        console.error("Error parsing token data:", parseError)
      }
    }
    
    // Try additional known Supabase token formats
    const sbAuthToken = localStorage.getItem('supabase.auth.data')
    if (sbAuthToken) {
      try {
        const parsedAuthData = JSON.parse(sbAuthToken)
        return !!parsedAuthData.session?.access_token
      } catch (parseError) {
        console.error("Error parsing auth.data format:", parseError)
      }
    }
    
    // Fallback to checking for user object
    const user = localStorage.getItem("user")
    return !!user
  } catch (e: unknown) {
    console.error("Error checking authentication:", e)
    return false
  }
}

// Load keywords from localStorage with safety checks
function loadKeywordsFromStorage(): Keyword[] {
  if (typeof window === "undefined") return []

  try {
    const storedKeywords = localStorage.getItem(KEYWORDS_STORAGE_KEY)
    if (!storedKeywords) return []

    const keywords = JSON.parse(storedKeywords)
    return Array.isArray(keywords) ? keywords : []
  } catch (e: unknown) {
    console.error("Error parsing stored keywords:", e)
    return []
  }
}

// Save keywords to localStorage with safety checks
function saveKeywordsToStorage(keywords: Keyword[]): void {
  if (typeof window === "undefined") return

  try {
    if (!Array.isArray(keywords)) {
      console.error("Attempted to save non-array keywords to storage")
      return
    }
    localStorage.setItem(KEYWORDS_STORAGE_KEY, JSON.stringify(keywords))
  } catch (e: unknown) {
    console.error("Error saving keywords to storage:", e)
  }
}

// Check if we should update rankings (limit to once per hour)
function shouldUpdateRankings(): boolean {
  if (typeof window === "undefined") return false

  try {
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY)
    if (!lastUpdate) return true

    const lastUpdateTime = Number.parseInt(lastUpdate, 10)
    if (isNaN(lastUpdateTime)) return true

    const currentTime = Date.now()

    // Only update if it's been more than 1 hour since the last update
    return currentTime - lastUpdateTime > 60 * 60 * 1000
  } catch (e: unknown) {
    console.error("Error checking update time:", e)
    return false
  }
}

// Mark that we've updated rankings
function markRankingsUpdated(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString())
  } catch (e: unknown) {
    console.error("Error marking rankings updated:", e)
  }
}

// Helper function to get the current auth token with debug logging
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // Server-side
  }
  
  let token = null;
  
  try {
    // Try the newer Supabase token format first
    const supabaseSession = localStorage.getItem('sb-nzxgnnpthtefahosnolm-auth-token');
    if (supabaseSession) {
      try {
        const parsedSession = JSON.parse(supabaseSession);
        if (parsedSession?.access_token) {
          token = parsedSession.access_token;
          return token;
        }
      } catch (e) {
        console.error("Error parsing newer token format:", e);
      }
    }
    
    // Fallback to older format if needed
    const oldSession = localStorage.getItem('supabase.auth.token');
    if (oldSession) {
      try {
        const parsedOldSession = JSON.parse(oldSession);
        if (parsedOldSession?.access_token) {
          token = parsedOldSession.access_token;
          return token;
        }
        if (parsedOldSession?.currentSession?.access_token) {
          token = parsedOldSession.currentSession.access_token;
          return token;
        }
      } catch (e) {
        console.error("Error parsing older token format:", e);
      }
    }
    
    // Try additional known Supabase token formats
    const sbAuthToken = localStorage.getItem('supabase.auth.data');
    if (sbAuthToken) {
      try {
        const parsedAuthData = JSON.parse(sbAuthToken);
        if (parsedAuthData?.session?.access_token) {
          token = parsedAuthData.session.access_token;
          return token;
        }
      } catch (e) {
        console.error("Error parsing auth.data format:", e);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

// Helper function to get authentication headers for API requests
function getAuthHeaders(): HeadersInit {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    try {
      // Try to get the session directly from Supabase storage
      // The format is sb-{project-ref}-auth-token
      const supabaseSession = localStorage.getItem('sb-nzxgnnpthtefahosnolm-auth-token')
      
      if (supabaseSession) {
        try {
          const parsedSession = JSON.parse(supabaseSession)
          if (parsedSession?.access_token) {
            return {
              'Authorization': `Bearer ${parsedSession.access_token}`
            }
          }
        } catch (error) {
          console.error("Error parsing Supabase session:", error)
        }
      }
      
      // Fallback to checking other storage keys
      const token = localStorage.getItem('supabase.auth.token')
      
      if (token) {
        try {
          const parsedToken = JSON.parse(token)
          if (parsedToken?.currentSession?.access_token) {
            return {
              'Authorization': `Bearer ${parsedToken.currentSession.access_token}`
            }
          }
        } catch (error) {
          console.error("Error parsing auth token:", error)
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
  }
  
  // Return empty object if no token found
  return {}
}

// API functions
export async function fetchKeywords() {
  try {
    // Get auth token from localStorage as a fallback
    let authHeader = {}
    try {
      const tokenData = localStorage.getItem("supabase.auth.token")
      if (tokenData) {
        const { access_token } = JSON.parse(tokenData)
        if (access_token) {
          authHeader = {
            Authorization: `Bearer ${access_token}`,
          }
        }
      }
    } catch (e) {
      console.warn("Could not get auth token from localStorage:", e)
    }

    // Make the request with auth headers
    const response = await fetch("/api/keywords", {
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      // Include credentials to send cookies
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API error:", errorData)
      throw new Error(errorData.error || "Failed to fetch keywords")
    }

    const data = await response.json()
    return data.keywords || []
  } catch (error) {
    console.error("Error in fetchKeywords:", error)
    throw error
  }
}

export async function addKeyword(keywordData: Partial<Keyword>): Promise<Keyword> {
  // Check authentication first
  if (!isAuthenticated()) {
    throw new Error("User not authenticated")
  }

  try {
    // Get the current session token using our helper function
    const token = getAuthToken()
    console.log("Adding keyword with token:", token ? "Token available" : "No token")
    
    const userId = getUserId()
    if (!userId) {
      console.error("User ID not found despite authentication check passing")
      throw new Error("User not authenticated")
    }

    // Make API request to add keyword
    const response = await fetch("/api/keywords", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        ...keywordData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      credentials: "include",
    })

    const responseData = await response.json()
    
    if (!response.ok) {
      console.error("API error adding keyword:", responseData)
      
      // Handle duplicate keyword error specifically
      if (response.status === 409 && responseData.code === "DUPLICATE_KEYWORD") {
        throw new Error("This keyword is already being tracked for this domain.")
      }
      
      throw new Error(responseData.error || "Failed to add keyword")
    }

    // Add to localStorage
    const keywords = loadKeywordsFromStorage() || []
    keywords.push(responseData)
    saveKeywordsToStorage(keywords)

    console.log("Successfully added keyword:", responseData)
    return responseData
  } catch (error) {
    console.error("Error in addKeyword:", error)
    throw error
  }
}

export async function removeKeyword(id: string): Promise<void> {
  // Check authentication first
  if (!isAuthenticated()) {
    throw new Error("User not authenticated")
  }

  try {
    if (!id) {
      throw new Error("Invalid keyword ID")
    }

    // Get the current session token
    const token = getAuthToken();
    
    // Make API call to delete the keyword
    const response = await fetch(`/api/keywords/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: token ? JSON.stringify({ token }) : undefined,
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to delete keyword: ${response.status}`)
    }

    // Remove from localStorage
    const keywords = loadKeywordsFromStorage()
    if (Array.isArray(keywords)) {
      const updatedKeywords = keywords.filter(k => k && k.id !== id)
      saveKeywordsToStorage(updatedKeywords)
    }
  } catch (error) {
    console.error("Error removing keyword:", error)
    throw error
  }
}

export async function fetchKeywordHistory(keywordId: string, period: string): Promise<any[]> {
  // Check authentication first
  if (!isAuthenticated()) {
    throw new Error("User not authenticated")
  }

  try {
    if (!keywordId) {
      console.error("Invalid keyword ID for history")
      return []
    }

    try {
      const result = await fetchKeywordHistoryFromServer(keywordId, period)
      return Array.isArray(result) ? result : []
    } catch (serverError: unknown) {
      console.error("Server error fetching keyword history:", serverError)
      return []
    }
  } catch (error: unknown) {
    console.error("Error fetching keyword history:", error)
    return []
  }
}

export async function getApiKeys(): Promise<{ login: string; password: string }> {
  // Check authentication first
  if (!isAuthenticated()) {
    throw new Error("User not authenticated")
  }

  // Return the hardcoded API keys
  return {
    login: "saim@makewebeasy.llc",
    password: "af0929d9a9ee7cad",
  }
}

export async function updateApiKeys(login: string, password: string): Promise<void> {
  // Check authentication first
  if (!isAuthenticated()) {
    throw new Error("User not authenticated")
  }

  // This is a no-op since we're using hardcoded credentials
  return Promise.resolve()
}

// Function to manually trigger a refresh of keyword rankings
export async function refreshKeywordRankings(): Promise<Keyword[]> {
  // Check authentication first
  if (!isAuthenticated()) {
    throw new Error("User not authenticated")
  }

  try {
    const userId = getUserId()
    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Load keywords from localStorage
    let keywords = loadKeywordsFromStorage()
    if (!Array.isArray(keywords)) {
      console.error("Invalid keywords format in storage")
      return []
    }

    // Filter keywords for the current user
    keywords = keywords.filter((k) => k && k.user_id === userId)

    if (keywords.length === 0) return []

    const updatedKeywords = await updateKeywordRankings(userId, keywords)
    if (!Array.isArray(updatedKeywords)) {
      console.error("Invalid response from updateKeywordRankings")
      return keywords
    }

    // Update localStorage with the new rankings
    const allKeywords = loadKeywordsFromStorage()
    if (Array.isArray(allKeywords)) {
      const updatedAllKeywords = allKeywords.map((k) => {
        const updated = updatedKeywords.find((uk) => uk && uk.id === k.id)
        return updated || k
      })

      saveKeywordsToStorage(updatedAllKeywords)
      markRankingsUpdated() // Mark that we've updated rankings
    }

    return updatedKeywords
  } catch (error: unknown) {
    console.error("Error in refreshKeywordRankings:", error)
    return []
  }
}

export async function refreshKeywordRanking(keywordId: string): Promise<Keyword | null> {
  // Check authentication first
  if (!isAuthenticated()) {
    console.error("refreshKeywordRanking - User not authenticated");
    throw new Error("User not authenticated");
  }

  try {
    if (!keywordId) {
      console.error("refreshKeywordRanking - Invalid keyword ID for refresh");
      return null;
    }

    // Get the current session token
    const token = getAuthToken();
    const userId = getUserId();
    
    console.log("refreshKeywordRanking - Refreshing keyword with token:", token ? "Token available" : "No token");
    console.log("refreshKeywordRanking - User ID:", userId);
    
    // Make API call to refresh the keyword ranking
    console.log(`refreshKeywordRanking - Making API call to /api/keywords/${keywordId}/refresh`);
    const response = await fetch(`/api/keywords/${keywordId}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        token: token,
        user_id: userId
      }),
      credentials: 'include'
    });

    console.log(`refreshKeywordRanking - API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`refreshKeywordRanking - Error response: ${errorText}`);
      
      let errorData: { error?: string } = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error("refreshKeywordRanking - Failed to parse error response as JSON");
      }
      
      throw new Error(errorData.error || `Failed to update keyword ranking: ${response.status}`);
    }

    console.log("refreshKeywordRanking - Successfully received response");
    const data = await response.json();
    console.log("refreshKeywordRanking - Parsed response data:", data);
    
    if (!data.keyword) {
      console.error("refreshKeywordRanking - Invalid response format from refresh API:", data);
      throw new Error("Invalid response from server");
    }
    
    // Update in localStorage if available
    const keywords = loadKeywordsFromStorage();
    if (Array.isArray(keywords)) {
      const updatedKeywords = keywords.map(k => {
        if (k && k.id === keywordId) {
          return { ...k, ...data.keyword };
        }
        return k;
      });
      
      saveKeywordsToStorage(updatedKeywords);
      console.log("refreshKeywordRanking - Updated keyword in localStorage");
    }
    
    return data.keyword;
  } catch (error) {
    console.error("Error refreshing keyword ranking:", error);
    throw error;
  }
}
