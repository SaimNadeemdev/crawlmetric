"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getAuthToken, isAuthenticated } from "@/lib/api"

// Define the types for content generation
export interface ContentGenerationHistoryItem {
  id?: string
  type: string
  prompt: any
  result: string
  metadata?: any
  created_at?: string
}

export interface ContentGenerationContextType {
  // State
  isHistoryLoading: boolean
  error: string | null
  
  // History
  history: ContentGenerationHistoryItem[]
  loadHistory: (type?: string, forceRefresh?: boolean) => Promise<void>
  saveToHistory: (item: ContentGenerationHistoryItem) => Promise<void>
  deleteHistoryItem: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
}

// Create the context with undefined as default value
export const ContentGenerationContext = createContext<ContentGenerationContextType | undefined>(undefined)

export function ContentGenerationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()

  // State
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ContentGenerationHistoryItem[]>([])

  // Load history from localStorage and API if authenticated
  const loadHistory = useCallback(async (type?: string, forceRefresh = false) => {
    setIsHistoryLoading(true)
    setError(null)
    
    try {
      console.log(`Loading history${type ? ` for type: ${type}` : ''}${forceRefresh ? ' with force refresh' : ''}`)
      
      // Always try to load from localStorage first
      let localHistory: ContentGenerationHistoryItem[] = []
      
      // Safe check for browser environment
      if (typeof window !== 'undefined') {
        try {
          const storedHistory = localStorage.getItem("content_generation_history")
          if (storedHistory) {
            localHistory = JSON.parse(storedHistory)
            console.log(`Loaded ${localHistory.length} items from localStorage`)
            
            // Filter by type if specified
            if (type) {
              localHistory = localHistory.filter((item: any) => item.type === type)
              console.log(`Filtered to ${localHistory.length} items of type ${type}`)
            }
          }
        } catch (error) {
          console.error("Error loading from localStorage:", error)
        }
      }
      
      // If not authenticated, just use localStorage
      if (!isAuthenticated()) {
        console.log("User not authenticated, using only localStorage history")
        setHistory(localHistory)
        setIsHistoryLoading(false)
        return
      }
      
      // Try to load from API for authenticated users
      try {
        const token = getAuthToken()
        if (!token) {
          console.log("No auth token available, using only localStorage history")
          setHistory(localHistory)
          setIsHistoryLoading(false)
          return
        }
        
        // Build query parameters
        const queryParams = new URLSearchParams()
        queryParams.append('limit', '100') // Get more items to ensure we have a complete history
        
        if (type) {
          queryParams.append('type', type)
        }
        
        // Add cache-busting timestamp parameter
        const timestamp = Date.now()
        queryParams.append('_t', timestamp.toString())
        
        // Add a random parameter to further ensure cache busting
        queryParams.append('_r', Math.random().toString().substring(2))
        
        console.log(`Fetching history from API with params: ${queryParams.toString()}`)
        
        const response = await fetch(`/api/content-generation-history?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store',
          credentials: "include"
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.history)) {
            console.log(`Successfully fetched ${data.history.length} history items from API`)
            
            // Merge API history with localStorage history
            // For authenticated users, API history takes precedence
            const mergedHistory = [...data.history]
            
            // Add any items from localStorage that don't exist in the API response
            // (these might be items created while offline)
            if (localHistory.length > 0) {
              const apiIds = new Set(data.history.map((item: any) => item.id))
              const localOnlyItems = localHistory.filter((item: any) => !apiIds.has(item.id))
              
              if (localOnlyItems.length > 0) {
                console.log(`Adding ${localOnlyItems.length} local-only items to history`)
                mergedHistory.push(...localOnlyItems)
              }
            }
            
            // Sort by timestamp
            const sortedHistory = mergedHistory.sort((a: any, b: any) => {
              const dateA = new Date(a.created_at || a.metadata?.timestamp || 0)
              const dateB = new Date(b.created_at || b.metadata?.timestamp || 0)
              return dateB.getTime() - dateA.getTime()
            })
            
            setHistory(sortedHistory)
            
            // Update localStorage with the merged history for offline access
            try {
              // Safe check for browser environment
              if (typeof window !== 'undefined') {
                localStorage.setItem("content_generation_history", JSON.stringify(sortedHistory))
                console.log("Updated localStorage with merged history")
              }
            } catch (storageError) {
              console.error("Error updating localStorage:", storageError)
            }
          } else {
            console.error("Invalid response format from API:", data)
            // Fall back to localStorage
            setHistory(localHistory)
          }
        } else {
          console.error(`Error fetching history from API, status: ${response.status}`)
          
          // For expired tokens, try to refresh or re-authenticate
          if (response.status === 401 || response.status === 403) {
            console.log("Token expired or unauthorized")
            // Fall back to localStorage
            setHistory(localHistory)
          } else {
            // For other errors, show a toast
            toast({
              title: "Warning",
              description: "Could not load your history from the server. Using local data instead.",
              variant: "destructive",
            })
            setHistory(localHistory)
          }
        }
      } catch (fetchError) {
        console.error("Error fetching history from API:", fetchError)
        // Fall back to localStorage
        setHistory(localHistory)
        
        toast({
          title: "Warning",
          description: "Could not load your history from the server. Using local data instead.",
          variant: "destructive",
        })
      } finally {
        setIsHistoryLoading(false)
      }
    } catch (error) {
      console.error("Error loading history:", error)
      setIsHistoryLoading(false)
      setHistory([])
      
      toast({
        title: "Error",
        description: "Failed to load your content generation history.",
        variant: "destructive",
      })
    }
  }, [isAuthenticated, getAuthToken, toast])

  // Save a content generation result to the database
  const saveToHistory = useCallback(async (item: ContentGenerationHistoryItem) => {
    // Always save to local state first
    const addToLocalHistory = () => {
      setHistory(prev => {
        const newHistory = [item, ...prev].slice(0, 20) // Limit to 20 items
        // Safe check for browser environment
        if (typeof window !== 'undefined') {
          localStorage.setItem("content_generation_history", JSON.stringify(newHistory))
        }
        return newHistory
      })
    }
    
    if (!isAuthenticated()) {
      console.log("User not authenticated, skipping database save")
      addToLocalHistory()
      return
    }

    try {
      const token = getAuthToken()
      console.log("Saving content generation to database with token:", token ? "Token available" : "No token")

      // If no token is available, don't attempt to save to the database
      if (!token) {
        console.log("No authentication token available, skipping database save")
        addToLocalHistory()
        return
      }

      // Prepare the request with credentials
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: item.type,
          prompt: item.prompt,
          result: item.result,
          metadata: item.metadata || {}
        }),
        credentials: "include" as RequestCredentials
      }
      
      console.log("Sending history save request with options:", {
        url: "/api/content-generation-history",
        method: requestOptions.method,
        hasAuthHeader: !!requestOptions.headers['Authorization'],
        contentType: requestOptions.headers["Content-Type"],
        bodyKeys: Object.keys(JSON.parse(requestOptions.body as string)),
        credentials: requestOptions.credentials
      })

      const response = await fetch("/api/content-generation-history", requestOptions)

      if (!response.ok) {
        console.error(`Error saving to database: ${response.status}`)
        
        // For expired tokens, just log the error but don't show a toast
        if (response.status === 401 || response.status === 403) {
          console.log("Token expired or unauthorized - skipping database save")
          addToLocalHistory()
          return
        }
        
        // For other errors, show a toast
        toast({
          title: "Warning",
          description: "Your content generation results were displayed but couldn't be saved to your history.",
          variant: "destructive",
        })
        
        addToLocalHistory()
        return
      }

      const data = await response.json()
      
      if (!data.success) {
        console.error("Error saving to database:", data.error)
        
        // Show a toast for the error
        toast({
          title: "Warning",
          description: "Your content generation results were displayed but couldn't be saved to your history.",
          variant: "destructive",
        })
        
        addToLocalHistory()
        return
      }
      
      console.log("Saved to database:", data.record?.id)
      
      // Add the database ID to the item
      const savedItem = { ...item, id: data.record?.id }
      
      // Update the history state with the new item
      setHistory(prev => {
        const newHistory = [savedItem, ...prev].slice(0, 20) // Limit to 20 items
        // Safe check for browser environment
        if (typeof window !== 'undefined') {
          localStorage.setItem("content_generation_history", JSON.stringify(newHistory))
        }
        return newHistory
      })
      
      // Show a success toast
      toast({
        title: "Saved to History",
        description: "Your content generation results have been saved to your history.",
      })
    } catch (error) {
      console.error("Error saving to history:", error)
      
      // Show a toast for the error
      toast({
        title: "Warning",
        description: "Your content generation results were displayed but couldn't be saved to your history.",
        variant: "destructive",
      })
      
      addToLocalHistory()
    }
  }, [])

  // Clear all history
  const clearHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true)
      console.log("Clearing content generation history")
      
      // Clear localStorage
      // Safe check for browser environment
      if (typeof window !== 'undefined') {
        localStorage.removeItem("content_generation_history")
      }
      
      // If not authenticated, just clear the local state
      if (!isAuthenticated()) {
        setHistory([])
        setIsHistoryLoading(false)
        return
      }

      const token = getAuthToken()
      if (!token) {
        setHistory([])
        setIsHistoryLoading(false)
        return
      }

      // Clear history from database - using a proper "clear all" endpoint
      // For now, we'll just clear the local state and show a success message
      // since we don't have a proper "clear all" endpoint yet
      
      // Set the state to empty immediately for better UX
      setHistory([])
      
      // Show a success toast
      toast({
        title: "History Cleared",
        description: "Your content generation history has been cleared locally.",
      })
      
      // Note: In a future update, we could implement a proper "clear all" endpoint
      // that deletes all history items for the current user from the database
      console.log("Cleared history locally")
    } catch (error) {
      console.error("Error clearing history:", error)
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsHistoryLoading(false)
    }
  }, [toast, isAuthenticated, getAuthToken])

  // Delete a specific history item
  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      console.log(`Attempting to delete history item with ID: ${id}`)
      
      // Remove from local state first for immediate UI feedback
      setHistory(prev => prev.filter(item => item.id !== id))
      
      // Update localStorage
      // Safe check for browser environment
      if (typeof window !== 'undefined') {
        const localHistory = localStorage.getItem("content_generation_history")
        if (localHistory) {
          try {
            const parsedHistory = JSON.parse(localHistory)
            const updatedHistory = parsedHistory.filter((item: any) => item.id !== id)
            localStorage.setItem("content_generation_history", JSON.stringify(updatedHistory))
            console.log(`Updated localStorage after removing item ${id}`)
          } catch (e) {
            console.error("Error updating localStorage:", e)
          }
        }
      }
      
      // If not authenticated, we're done with local deletion
      if (!isAuthenticated()) {
        console.log("User not authenticated, only removing item locally")
        toast({
          title: "Item Deleted",
          description: "The item has been removed from your local history.",
        })
        return
      }

      const token = getAuthToken()
      if (!token) {
        console.log("No auth token available, only removing item locally")
        toast({
          title: "Item Deleted",
          description: "The item has been removed from your local history.",
        })
        return
      }

      // Delete from database using the dynamic route API
      console.log(`Using dynamic route API to delete item ID: ${id}`)
      
      try {
        // Add a cache-busting parameter to the URL
        const timestamp = Date.now()
        const response = await fetch(`/api/content-generation-history/${id}?_t=${timestamp}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          credentials: "include",
          cache: 'no-store'
        })
        
        console.log(`Delete response status: ${response.status}`)
        
        // Get the response data
        let responseData = null
        try {
          responseData = await response.json()
          console.log("Delete response data:", responseData)
        } catch (e) {
          console.error("Error parsing delete response:", e)
        }
        
        if (response.ok) {
          console.log(`Successfully deleted item ${id} from database`)
          
          // Force a refresh of the history data to ensure UI is in sync with database
          // Use a slight delay to ensure the deletion has propagated
          setTimeout(() => {
            console.log("Triggering history refresh after deletion")
            // Pass true to force a refresh and bypass any caching
            loadHistory(undefined, true)
            
            // Double-check after a longer delay to ensure consistency
            setTimeout(() => {
              console.log("Performing second history refresh to ensure consistency")
              loadHistory(undefined, true)
            }, 1500)
          }, 500)
          
          toast({
            title: "Item Deleted",
            description: "The history item has been deleted successfully.",
          })
        } else {
          // For 404 errors (item not found), we consider this a success since the item is already gone
          if (response.status === 404) {
            console.log(`Item with ID ${id} not found in database or already deleted`)
            toast({
              title: "Item Deleted",
              description: "The history item has been deleted successfully.",
            })
            return
          }
          
          console.error(`Error deleting item ${id}, status: ${response.status}`)
          toast({
            title: "Warning",
            description: "Item was removed from your local history but couldn't be deleted from the server.",
            variant: "destructive",
          })
          
          // Still try to refresh the history to ensure we're in sync
          setTimeout(() => loadHistory(undefined, true), 500)
        }
      } catch (fetchError) {
        console.error("Fetch error during delete operation:", fetchError)
        toast({
          title: "Warning",
          description: "Item was removed from your local history but couldn't be deleted from the server.",
          variant: "destructive",
        })
        
        // Still try to refresh the history to ensure we're in sync
        setTimeout(() => loadHistory(undefined, true), 500)
      }
    } catch (error) {
      console.error("Error deleting history item:", error)
      toast({
        title: "Warning",
        description: "Item was removed from your local history but couldn't be deleted from the server.",
        variant: "destructive",
      })
      
      // Still try to refresh the history to ensure we're in sync
      setTimeout(() => loadHistory(undefined, true), 500)
    }
  }, [toast, loadHistory, isAuthenticated, getAuthToken])

  return (
    <ContentGenerationContext.Provider
      value={{
        // State
        isHistoryLoading,
        error,
        
        // History
        history,
        loadHistory,
        saveToHistory,
        deleteHistoryItem,
        clearHistory,
      }}
    >
      {children}
    </ContentGenerationContext.Provider>
  )
}

export function useContentGeneration() {
  const context = useContext(ContentGenerationContext)
  if (context === undefined) {
    throw new Error("useContentGeneration must be used within a ContentGenerationProvider")
  }
  return context
}
