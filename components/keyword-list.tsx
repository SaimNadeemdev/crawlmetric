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
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search keywords..."
          className="pl-9 bg-black/30 border-white/5 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[500px] pr-4 apple-scrollbar">
        {filteredKeywords.length > 0 ? (
          <div className="space-y-2">
            {filteredKeywords.map((keyword, index) => {
              // Skip rendering if keyword is invalid
              if (!keyword || !keyword.id) return null;

              return (
                <div
                  key={keyword.id}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/5 animate-fade-in ${
                    selectedKeywordId === keyword.id 
                      ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 shadow-sm" 
                      : "border border-transparent"
                  }`}
                  onClick={() => handleSelectKeyword(keyword)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-white tracking-tight">{keyword.keyword || "Unnamed Keyword"}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {keyword.domain || "No domain"} • {keyword.location_name || "No location"}
                    </p>
                  </div>
                  <div className="flex items-center ml-2">
                    {keyword.current_rank ? (
                      <span
                        className={`text-sm font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${
                          keyword.previous_rank && keyword.current_rank < keyword.previous_rank
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : keyword.previous_rank && keyword.current_rank > keyword.previous_rank
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-black/40 text-gray-300 border border-white/5"
                        }`}
                      >
                        {keyword.current_rank}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}

                    {onRefreshKeyword && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-full transition-all duration-300 transform hover:scale-110"
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
                          className="ml-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-300 transform hover:scale-110"
                          onClick={(e) => handleDeleteClick(keyword.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Keyword</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete this keyword? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-black/50 text-white border border-white/10 hover:bg-black/70 transition-all duration-300">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/20 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300"
                            onClick={handleConfirmDelete}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <Search className="h-8 w-8 text-gray-400 mb-2 opacity-50" />
            <p className="text-gray-400">No keywords found</p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
                className="mt-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-300 border border-purple-500/20 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 rounded-xl transition-all duration-300"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
