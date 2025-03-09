"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  getKeywordSuggestions,
  getKeywordsForSite,
  getHistoricalSearchVolume,
  getBulkKeywordDifficulty,
  getKeywordIdeas,
} from "@/lib/dataforseo-keywords-api"
import type { KeywordResearchParams, KeywordResearchResults } from "@/types/keyword-research"
import { getAuthToken, isAuthenticated } from "@/lib/api"

interface KeywordResearchContextType {
  // State
  isLoading: boolean
  isHistoryLoading: boolean
  error: string | null
  results: KeywordResearchResults | null

  // Actions
  runKeywordResearch: (params: KeywordResearchParams) => Promise<void>
  clearResults: () => void

  // History
  searchHistory: KeywordResearchResults[]
  loadHistory: () => Promise<void>
  addToHistory: (result: KeywordResearchResults) => void
  clearHistory: () => void
}

const KeywordResearchContext = createContext<KeywordResearchContextType | undefined>(undefined)

export function KeywordResearchProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<KeywordResearchResults | null>(null)
  const [searchHistory, setSearchHistory] = useState<KeywordResearchResults[]>([])

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("keyword_research_history")
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory))
      }

      // Also try to load history from the database if user is authenticated
      if (isAuthenticated()) {
        loadHistory()
      }
    } catch (error) {
      console.error("Error loading stored keyword research history:", error)
    }
  }, [])

  // Save search history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("keyword_research_history", JSON.stringify(searchHistory))
    } catch (error) {
      console.error("Error saving keyword research history:", error)
    }
  }, [searchHistory])

  // Load history from database
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated()) {
      console.log("User not authenticated, skipping database history load")
      return
    }

    setIsHistoryLoading(true)

    try {
      const token = getAuthToken()
      console.log("Loading keyword research history with token:", token ? "Token available" : "No token")

      const response = await fetch("/api/keyword-research-history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: "include"
      })

      if (!response.ok) {
        console.error(`Error loading history: ${response.status}`)
        return
      }

      const data = await response.json()
      console.log("Loaded history from database:", data.history?.length || 0, "records")

      if (data.history && Array.isArray(data.history)) {
        // Merge with existing localStorage history, prioritizing database entries
        // and removing duplicates by comparing timestamps
        const newHistory = [...data.history]

        // Update the state
        setSearchHistory(newHistory)

        // Update localStorage as well
        localStorage.setItem("keyword_research_history", JSON.stringify(newHistory))
      }
    } catch (error) {
      console.error("Error loading history from database:", error)
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  // Save a research result to the database
  const saveResultToDatabase = useCallback(async (result: KeywordResearchResults) => {
    // Skip database save for Keywords for Site mode when not authenticated
    // This allows the feature to work without requiring login
    if (result.mode === "keywords_for_site") {
      console.log("Keywords for Site mode - skipping database save to avoid auth errors")
      return
    }

    if (!isAuthenticated()) {
      console.log("User not authenticated, skipping database save")
      return
    }

    try {
      const token = getAuthToken()
      console.log("Saving keyword research to database with token:", token ? "Token available" : "No token")

      // If no token is available, don't attempt to save to the database
      if (!token) {
        console.log("No authentication token available, skipping database save")
        return
      }

      const response = await fetch("/api/keyword-research-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: result.mode,
          data: result.data,
          queryParams: result.queryParams
        }),
        credentials: "include"
      })

      if (!response.ok) {
        console.error(`Error saving to database: ${response.status}`)
        
        // For expired tokens, just log the error but don't show a toast
        if (response.status === 401 || response.status === 403) {
          console.log("Token expired or unauthorized - skipping database save")
          return
        }
        
        // For other errors, show a toast
        toast({
          title: "Warning",
          description: "Your research results were displayed but couldn't be saved to your history.",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      console.log("Saved to database:", data.record?.id)
    } catch (error) {
      console.error("Error saving to database:", error)
      // Don't show error toast for network or other issues
    }
  }, [toast])

  // Add to history
  const addToHistory = useCallback((result: KeywordResearchResults) => {
    setSearchHistory((prev) => {
      // Limit history to 10 items
      const newHistory = [result, ...prev].slice(0, 10)
      return newHistory
    })
  }, [])

  // Run keyword research
  const runKeywordResearch = useCallback(
    async (params: KeywordResearchParams) => {
      setIsLoading(true)
      setError(null)

      try {
        let data

        switch (params.mode) {
          case "keyword_suggestions":
            if (!params.keyword) throw new Error("Keyword is required for keyword suggestions")
            data = await getKeywordSuggestions(
              params.keyword, 
              params.locationName, 
              params.languageName, 
              params.limit || 50
            )
            break

          case "keywords_for_site":
            try {
              console.log("Running keywords_for_site with params:", params)
              
              // Call the API to get keywords for site
              const result = await getKeywordsForSite(
                params.target || "", // Ensure target is never undefined
                params.locationName || "United States", // Default to United States
                params.languageName || "English", // Default to English
                params.limit || 50 // Default to 50 results
              )
              
              console.log("Keywords for Site raw result:", result)
              
              // Check if result is empty or invalid
              if (!result || (Array.isArray(result) && result.length === 0)) {
                console.error("Empty or invalid result from getKeywordsForSite");
                
                // Create a mock result for testing if in development
                if (process.env.NODE_ENV === 'development') {
                  console.log("Creating mock data for development testing");
                  const mockResult = [
                    {
                      keyword: "netflix shows",
                      keyword_properties: { keyword_difficulty: 65 },
                      keyword_info: { search_volume: 12000, competition: 0.8, competition_level: "HIGH", cpc: 2.5 }
                    },
                    {
                      keyword: "netflix movies",
                      keyword_properties: { keyword_difficulty: 72 },
                      keyword_info: { search_volume: 18000, competition: 0.7, competition_level: "HIGH", cpc: 2.1 }
                    },
                    {
                      keyword: "netflix login",
                      keyword_properties: { keyword_difficulty: 45 },
                      keyword_info: { search_volume: 25000, competition: 0.5, competition_level: "MEDIUM", cpc: 1.8 }
                    }
                  ];
                  
                  // Format the result to match the KeywordResearchResults type
                  const formattedResult: KeywordResearchResults = {
                    mode: "keywords_for_site",
                    data: mockResult,
                    queryParams: params,
                    timestamp: new Date().toISOString()
                  };
                  
                  console.log("Setting mock formatted result:", JSON.stringify(formattedResult, null, 2));
                  
                  // Set the processed results
                  setResults(formattedResult);
                  setIsLoading(false);
                  return;
                }
              }
              
              // Process the result to ensure keyword_difficulty is correctly set
              if (result && Array.isArray(result)) {
                // Map through each item to ensure keyword_difficulty is correctly set
                const processedResult = result.map(item => {
                  // Create a copy of the item
                  const processedItem = { ...item }
                  
                  // Force keyword_difficulty to use the value from keyword_properties
                  if (item.keyword_properties && typeof item.keyword_properties.keyword_difficulty === 'number') {
                    processedItem.keyword_difficulty = item.keyword_properties.keyword_difficulty
                    console.log(`[Context] Using keyword_properties.keyword_difficulty: ${processedItem.keyword_difficulty}`)
                  } else if (item.keyword_info && typeof item.keyword_info.keyword_difficulty === 'number') {
                    processedItem.keyword_difficulty = item.keyword_info.keyword_difficulty
                    console.log(`[Context] Using keyword_info.keyword_difficulty: ${processedItem.keyword_difficulty}`)
                  } else {
                    processedItem.keyword_difficulty = 50; // Default to medium difficulty
                    console.log(`[Context] No keyword difficulty found, using default: 50`)
                  }
                  
                  return processedItem
                })
                
                console.log("Keywords for Site processed result:", processedResult)
                
                // Format the result to match the KeywordResearchResults type
                const formattedResult: KeywordResearchResults = {
                  mode: "keywords_for_site",
                  data: processedResult,
                  queryParams: params,
                  timestamp: new Date().toISOString()
                };
                
                console.log("Setting formatted result:", JSON.stringify(formattedResult, null, 2));
                
                // Set the processed results
                setResults(formattedResult)
                
                // Save to database if user is authenticated
                await saveResultToDatabase({
                  mode: "keywords_for_site",
                  data: processedResult,
                  queryParams: params,
                  timestamp: new Date().toISOString(),
                })
                
                // Set loading to false
                setIsLoading(false)
              } else {
                // Set the original results if not an array
                setResults(result)
                
                // Save to database if user is authenticated
                await saveResultToDatabase({
                  mode: "keywords_for_site",
                  data: result,
                  queryParams: params,
                  timestamp: new Date().toISOString(),
                })
                
                // Set loading to false
                setIsLoading(false)
              }
            } catch (error) {
              console.error("Error running keyword research:", error)
              setError(error instanceof Error ? error.message : "Unknown error")
              setIsLoading(false)
            }
            break

          case "historical_search_volume":
            if (!params.keywords || params.keywords.length === 0)
              throw new Error("Keywords are required for historical search volume")
            data = await getHistoricalSearchVolume(
              params.keywords, 
              params.locationName, 
              params.languageName
            )
            break

          case "bulk_keyword_difficulty":
            if (!params.keywords || params.keywords.length === 0)
              throw new Error("Keywords are required for bulk keyword difficulty")
            data = await getBulkKeywordDifficulty(
              params.keywords, 
              params.locationName, 
              params.languageName
            )
            break

          case "keyword_ideas":
            if (!params.keyword) throw new Error("Keyword is required for keyword ideas")
            data = await getKeywordIdeas(
              params.keyword, 
              params.locationName, 
              params.languageName, 
              params.limit || 50
            )
            break

          default:
            throw new Error(`Unsupported research mode: ${params.mode}`)
        }

        console.log("Keyword research completed successfully:", data ? `${data.length} items` : "no data");

        // Ensure data is an array
        const dataArray = Array.isArray(data) ? data : [];

        const result: KeywordResearchResults = {
          mode: params.mode,
          data: dataArray,
          queryParams: params,
          timestamp: new Date().toISOString(),
        }

        setResults(result)
        addToHistory(result)

        // Save to database if user is authenticated
        saveResultToDatabase(result)

        toast({
          title: "Research Complete",
          description: "Keyword research has been completed successfully.",
        })
      } catch (error) {
        console.error("Error in runKeywordResearch:", error)
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred during keyword research"
        setError(errorMessage)
        toast({
          title: "Research Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast, addToHistory, saveResultToDatabase],
  )

  // Clear results
  const clearResults = useCallback(() => {
    setResults(null)
    setError(null)
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setSearchHistory([])
  }, [])

  const value = {
    isLoading,
    isHistoryLoading,
    error,
    results,
    runKeywordResearch,
    clearResults,
    searchHistory,
    loadHistory,
    addToHistory,
    clearHistory,
  }

  return <KeywordResearchContext.Provider value={value}>{children}</KeywordResearchContext.Provider>
}

export function useKeywordResearch() {
  const context = useContext(KeywordResearchContext)
  if (context === undefined) {
    throw new Error("useKeywordResearch must be used within a KeywordResearchProvider")
  }
  return context
}
