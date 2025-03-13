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

// Helper function to get month name
const getMonthName = (monthNumber: number): string => {
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  return monthNames[monthNumber - 1] || "";
};

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
    // Safe check for browser environment
    if (typeof window === 'undefined') return;
    
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
    // Safe check for browser environment
    if (typeof window === 'undefined') return;
    
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
        if (typeof window !== 'undefined') {
          localStorage.setItem("keyword_research_history", JSON.stringify(newHistory))
        }
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

      // Process historical search volume data before saving to match the format needed for display
      let processedData = result.data;
      
      // For historical search volume, expand the data to include one row per month
      if (result.mode === "historical_search_volume" && Array.isArray(result.data) && result.data.length > 0) {
        console.log("Pre-processing historical search volume data before saving to database");
        
        const expandedData: any[] = [];
        
        result.data.forEach(item => {
          // Extract months from different possible locations in the data structure
          let months = [];
          if (item.months && Array.isArray(item.months)) {
            months = item.months;
          } else if (item.keyword_data && item.keyword_data.keyword_info && 
                    item.keyword_data.keyword_info.monthly_searches && 
                    Array.isArray(item.keyword_data.keyword_info.monthly_searches)) {
            months = item.keyword_data.keyword_info.monthly_searches;
          }
          
          if (months.length > 0) {
            // Sort months by year and month (newest first)
            const sortedMonths = [...months].sort((a: any, b: any) => {
              if (a.year !== b.year) return b.year - a.year;
              return b.month - a.month;
            });
            
            // Create one row per month
            sortedMonths.forEach(month => {
              // Copy all properties from the original item
              const expandedItem = { ...item };
              
              // Add month-specific properties
              expandedItem.search_volume = month.search_volume;
              expandedItem.year = month.year;
              expandedItem.month = month.month;
              expandedItem.monthName = getMonthName(month.month);
              expandedItem.yearMonth = `${month.year}-${month.month.toString().padStart(2, '0')}`;
              
              // Ensure these specific metrics are copied from the parent item or extracted from the appropriate location
              if (!expandedItem.cpc && item.keyword_data?.keyword_info?.cpc) {
                expandedItem.cpc = item.keyword_data.keyword_info.cpc;
              }
              
              if (!expandedItem.competition && item.keyword_data?.keyword_info?.competition) {
                expandedItem.competition = item.keyword_data.keyword_info.competition;
              }
              
              if (!expandedItem.competition_level && item.keyword_data?.keyword_info?.competition_level) {
                expandedItem.competition_level = item.keyword_data.keyword_info.competition_level;
              }
              
              if (!expandedItem.keyword_difficulty && item.keyword_data?.keyword_info?.keyword_difficulty) {
                expandedItem.keyword_difficulty = item.keyword_data.keyword_info.keyword_difficulty;
              }
              
              expandedData.push(expandedItem);
            });
          } else {
            // If no months data, just add the item as is
            expandedData.push(item);
          }
        });
        
        console.log("Expanded historical data for database:", expandedData.length, "rows");
        processedData = expandedData;
      }

      const response = await fetch("/api/keyword-research-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: result.mode,
          data: processedData, // Use the processed data
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
  const runKeywordResearch = useCallback(async (params: KeywordResearchParams) => {
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
            
            if (!params.target) {
              throw new Error("Target website is required for keywords for site")
            }
            
            // Remove http://, https://, and www. from target
            let formattedTarget = params.target;
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
            
            console.log(`Formatted target: ${formattedTarget}`);
            
            // Call the API to get keywords for site
            const result = await getKeywordsForSite(
              formattedTarget, // Use formatted target
              2840, // Use location code 2840 for United States
              "en", // Use language code "en" for English
              params.limit || 50 // Default to 50 results
            )
            
            console.log("Keywords for Site API result:", {
              success: result.success,
              dataLength: result.data ? result.data.length : 0
            })
            
            // Get data directly from the result - matches the keyword suggestions pattern
            data = result.data

            // If no data was returned, throw an error
            if (!data || data.length === 0) {
              throw new Error(`No keywords found for ${params.target}. Try a different website or check that the URL is correct.`)
            }
            
            console.log(`Received ${data.length} keywords from API`)
          } catch (error: any) {
            console.error("Error in keywords_for_site mode:", error)
            throw new Error(`Error getting keywords for site: ${error.message}`)
          }
          break

        case "historical_search_volume":
          if (!params.keywords || params.keywords.length === 0)
            throw new Error("Keywords are required for historical search volume")
          const hsVolResponse = await getHistoricalSearchVolume(
            params.keywords, 
            params.locationName, 
            params.languageName
          )
          data = hsVolResponse.data
          break

        case "bulk_keyword_difficulty":
          if (!params.keywords || params.keywords.length === 0)
            throw new Error("Keywords are required for bulk keyword difficulty")
          const bkdResponse = await getBulkKeywordDifficulty(
            params.keywords, 
            params.locationName, 
            params.languageName
          )
          data = bkdResponse.data
          break

        case "keyword_ideas":
          if (!params.keyword) throw new Error("Keyword is required for keyword ideas")
          const kiResponse = await getKeywordIdeas(
            params.keyword, 
            params.locationName, 
            params.languageName, 
            params.limit || 50
          )
          data = kiResponse.data
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

  // Process API response based on the mode and response structure
  const processApiResponse = (response: any, mode: string): any[] => {
    console.log(`Processing API response for ${mode} mode`);
    
    if (!response) {
      console.log("No response from API");
      return [];
    }
    
    try {
      if (mode === "keywords_for_site") {
        // Log the structure to help with debugging
        console.log("Response structure:", {
          hasSuccess: !!response.success,
          hasData: !!response.data,
          dataIsArray: response.data ? Array.isArray(response.data) : false,
          dataLength: response.data ? response.data.length : 0,
          hasResult: !!response.result,
          hasTasks: !!response.tasks,
          statusCode: response.status_code
        });
        
        // NEW CASE: Handle our server response format (success + data)
        if (response.success && response.data && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} items in response.data array`);
          
          // Process each item in the data array
          if (response.data.length > 0) {
            return processKeywordItems(response.data);
          }
        }
        
        // CASE 1: Direct format with result array
        if (response.result && Array.isArray(response.result)) {
          console.log("Processing direct API response format with result array");
          
          // Extract items from all result objects
          let allItems: any[] = [];
          
          response.result.forEach((resultItem: any) => {
            if (resultItem.items && Array.isArray(resultItem.items)) {
              console.log(`Found ${resultItem.items.length} items in result`);
              allItems = [...allItems, ...resultItem.items];
            }
          });
          
          console.log(`Total items found from result array: ${allItems.length}`);
          
          if (allItems.length > 0) {
            return processKeywordItems(allItems);
          }
        }
        
        // CASE 2: Task-based format
        if (response.tasks && Array.isArray(response.tasks) && response.tasks.length > 0) {
          console.log("Processing task-based response format");
          
          const firstTask = response.tasks[0];
          
          if (firstTask.result) {
            // Handle nested structure where result may contain items
            if (firstTask.result.items && Array.isArray(firstTask.result.items)) {
              console.log(`Found ${firstTask.result.items.length} items in task result`);
              return processKeywordItems(firstTask.result.items);
            }
            
            // Handle flat structure where result is the array of items
            if (Array.isArray(firstTask.result)) {
              console.log(`Found ${firstTask.result.length} items in task result array`);
              return processKeywordItems(firstTask.result);
            }
          }
        }
        
        // If we got here, we couldn't process the response
        console.log("Could not extract keyword items from API response:", response);
        return [];
      } else {
        // Handle suggestions mode (using the existing task-based format)
        if (!response.tasks || !Array.isArray(response.tasks)) {
          console.log("No tasks found in API response:", response);
          return [];
        }
        
        // Extract result from first task
        const firstTask = response.tasks[0];
        if (!firstTask || !firstTask.result) {
          console.log("No result found in first task:", firstTask);
          return [];
        }
        
        return firstTask.result;
      }
    } catch (error) {
      console.error("Error processing API response:", error);
      return [];
    }
  };
  
  // Helper function to process keyword items into a standardized format
  const processKeywordItems = (items: any[]): any[] => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }
    
    return items.map((item: any) => {
      const result: any = {
        keyword: item.keyword || "",
        position: item.position || 0,
        search_volume: 0,
        traffic: 0,
        traffic_cost: 0,
        cpc: 0,
        competition: 0,
        competition_level: "LOW",
        keyword_difficulty: 0,
        difficulty_level: "Very Easy",
        url: item.url || "",
        mode: "keywords_for_site"
      };
      
      // Extract keyword_info data
      if (item.keyword_info) {
        result.search_volume = item.keyword_info.search_volume || 0;
        result.cpc = item.keyword_info.cpc || 0;
        result.competition = item.keyword_info.competition || 0;
        result.competition_level = item.keyword_info.competition_level || "LOW";
      }
      
      // Extract keyword_properties data if available
      if (item.keyword_properties) {
        result.keyword_difficulty = item.keyword_properties.keyword_difficulty || 0;
      }
      
      // Set difficulty level based on keyword_difficulty
      const kd = result.keyword_difficulty;
      if (kd >= 85) {
        result.difficulty_level = "Very Hard";
      } else if (kd >= 70) {
        result.difficulty_level = "Hard";
      } else if (kd >= 50) {
        result.difficulty_level = "Medium";
      } else if (kd >= 30) {
        result.difficulty_level = "Easy";
      } else {
        result.difficulty_level = "Very Easy";
      }
      
      return result;
    });
  };

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
