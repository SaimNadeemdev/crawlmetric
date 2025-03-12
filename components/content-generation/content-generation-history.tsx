"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Search, Filter } from "lucide-react"
import { useContentGenerationContext } from "@/hooks/use-content-generation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { HistoryCard } from "./history-card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function ContentGenerationHistory() {
  const router = useRouter()
  const { history, loadHistory, isHistoryLoading, error: contextError } = useContentGenerationContext()
  const [searchFilter, setSearchFilter] = useState<string>("")
  const [error, setError] = useState<string | null>(contextError)

  // Load history on component mount
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Refresh history data
  const refreshHistory = useCallback(async () => {
    console.log("Refreshing history data with force refresh...")
    // Force a reload from the server with a slight delay
    setTimeout(() => {
      loadHistory(undefined, true)
    }, 300)
  }, [loadHistory])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        await loadHistory()
      } catch (error) {
        setError("Failed to load history. Please try again.")
      }
    }

    fetchHistory()
  }, [loadHistory])

  // Update error state when context error changes
  useEffect(() => {
    if (contextError) {
      setError(contextError)
    }
  }, [contextError])

  const filteredHistory = searchFilter
    ? history.filter((item: any) => {
        const promptText = typeof item.prompt === 'object' 
          ? JSON.stringify(item.prompt) 
          : String(item.prompt)
        
        const searchTerms = [
          promptText,
          item.result,
          item.type
        ].join(" ").toLowerCase()
        
        return searchTerms.includes(searchFilter.toLowerCase())
      })
    : history

  // Get latest 100 items
  const currentItems = filteredHistory.slice(0, 100)

  return (
    <div className="space-y-6 pt-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search your history..."
            className="pl-9 rounded-full bg-white/80 backdrop-blur-sm border-gray-200"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-sm"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
      </div>

      {/* History Items */}
      {isHistoryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-[22px] border-gray-200 overflow-hidden">
              <div className="h-1.5 w-full bg-gray-200"></div>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card className="rounded-[22px] border-gray-200 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>No History Found</CardTitle>
            <CardDescription>
              {searchFilter
                ? "No results match your search. Try a different search term."
                : "You haven't generated any content yet. Try out our content generation tools."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                {searchFilter
                  ? "No matching history items found."
                  : "Your content generation history will appear here."}
              </p>
              {!searchFilter && (
                <Button
                  onClick={() => router.push("/dashboard/content-generation")}
                  className="rounded-full"
                >
                  Try Content Generation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentItems.map((item: any) => (
              <motion.div
                key={item.id || `${item.type}-${item.created_at || Date.now()}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <HistoryCard item={item} onDelete={refreshHistory} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
