"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Trash2, AlertTriangle, RefreshCw } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Keyword } from "@/types/keyword"

interface KeywordListProps {
  keywords: Keyword[]
  onRemoveKeyword: (id: string) => void
  onSelectKeyword: (keyword: Keyword) => void
  onRefreshKeyword?: (id: string) => Promise<void>
  selectedKeywordId?: string
}

export function KeywordList({ keywords, onRemoveKeyword, onSelectKeyword, onRefreshKeyword, selectedKeywordId }: KeywordListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [keywordToDelete, setKeywordToDelete] = useState<string | null>(null)
  const [filteredKeywords, setFilteredKeywords] = useState<Keyword[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshingKeywords, setRefreshingKeywords] = useState<Record<string, boolean>>({})

  // Safely filter keywords whenever dependencies change
  useEffect(() => {
    try {
      // Ensure keywords is always an array
      const safeKeywords = Array.isArray(keywords) ? keywords : []

      // Filter keywords based on search query
      const filtered = safeKeywords.filter((keyword) => {
        try {
          return keyword && keyword.keyword && keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase())
        } catch (e) {
          console.error("Error filtering keyword:", e)
          return false
        }
      })

      setFilteredKeywords(filtered)
      setError(null)
    } catch (e) {
      console.error("Error in keyword filtering:", e)
      setFilteredKeywords([])
      setError("Error filtering keywords")
    }
  }, [keywords, searchQuery])

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    try {
      e.stopPropagation()
      setKeywordToDelete(id)
    } catch (error) {
      console.error("Error in handleDeleteClick:", error)
    }
  }

  const handleConfirmDelete = () => {
    try {
      if (keywordToDelete) {
        onRemoveKeyword(keywordToDelete)
        setKeywordToDelete(null)
      }
    } catch (error) {
      console.error("Error in handleConfirmDelete:", error)
      setKeywordToDelete(null)
    }
  }

  const handleSelectKeyword = (keyword: Keyword) => {
    try {
      onSelectKeyword(keyword)
    } catch (error) {
      console.error("Error in handleSelectKeyword:", error)
    }
  }

  const handleRefreshKeyword = async (id: string, e: React.MouseEvent) => {
    try {
      e.stopPropagation()
      
      if (!onRefreshKeyword) return
      
      setRefreshingKeywords(prev => ({ ...prev, [id]: true }))
      
      await onRefreshKeyword(id)
      
      setRefreshingKeywords(prev => ({ ...prev, [id]: false }))
    } catch (error) {
      console.error("Error refreshing keyword:", error)
      setRefreshingKeywords(prev => ({ ...prev, [id]: false }))
    }
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => setError(null)} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search keywords..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[500px]">
        {filteredKeywords.length > 0 ? (
          <div className="space-y-1">
            {filteredKeywords.map((keyword) => {
              // Skip rendering if keyword is invalid
              if (!keyword || !keyword.id) return null

              return (
                <div
                  key={keyword.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                    selectedKeywordId === keyword.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSelectKeyword(keyword)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{keyword.keyword || "Unnamed Keyword"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {keyword.domain || "No domain"} • {keyword.location_name || "No location"}
                    </p>
                  </div>
                  <div className="flex items-center ml-2">
                    {keyword.current_rank ? (
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          keyword.previous_rank && keyword.current_rank < keyword.previous_rank
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : keyword.previous_rank && keyword.current_rank > keyword.previous_rank
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                        }`}
                      >
                        {keyword.current_rank}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}

                    {onRefreshKeyword && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 text-muted-foreground hover:text-primary"
                        onClick={(e) => handleRefreshKeyword(keyword.id, e)}
                        disabled={refreshingKeywords[keyword.id]}
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingKeywords[keyword.id] ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                      </Button>
                    )}

                    <AlertDialog
                      open={keywordToDelete === keyword.id}
                      onOpenChange={(open) => {
                        if (!open) setKeywordToDelete(null)
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDeleteClick(keyword.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Keyword</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{keyword.keyword}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-2">No keywords found</p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Add your first keyword to start tracking</p>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
