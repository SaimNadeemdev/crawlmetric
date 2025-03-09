"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Calendar, Search, Trash2, ArrowRight, Filter } from "lucide-react"
import { useKeywordResearch } from "@/contexts/keyword-research-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import type { KeywordResearchResults } from "@/types/keyword-research"

export default function KeywordResearchHistory() {
  const router = useRouter()
  const { searchHistory, clearHistory, loadHistory } = useKeywordResearch()
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchFilter, setSearchFilter] = useState<string>("")
  const [showClearDialog, setShowClearDialog] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        await loadHistory()
        setIsLoading(false)
      } catch (error) {
        setError("Failed to load history. Please try again.")
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [loadHistory])

  const handleClearHistory = async () => {
    try {
      await clearHistory()
      setShowClearDialog(false)
    } catch (error) {
      setError("Failed to clear history. Please try again.")
    }
  }

  const filteredHistory = searchFilter
    ? searchHistory.filter((item: KeywordResearchResults) => {
        const queryParams = item.query_params || {}
        const keyword = typeof queryParams === 'object' && 'keyword' in queryParams 
          ? String(queryParams.keyword) 
          : ""
        const targetUrl = typeof queryParams === 'object' && 'target_url' in queryParams 
          ? String(queryParams.target_url) 
          : typeof queryParams === 'object' && 'target' in queryParams 
            ? String(queryParams.target) 
            : ""
        const searchTerms = [keyword, targetUrl, item.mode].join(" ").toLowerCase()
        return searchTerms.includes(searchFilter.toLowerCase())
      })
    : searchHistory

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem)

  // Get research mode display name
  const getResearchModeDisplay = (mode: string) => {
    const modeMap: Record<string, string> = {
      keyword_suggestions: "Keyword Suggestions",
      keywords_for_site: "Keywords for Site",
      keyword_ideas: "Keyword Ideas",
      historical_search_volume: "Historical Search Volume",
      bulk_keyword_difficulty: "Bulk Keyword Difficulty",
      keyword_difficulty: "Keyword Difficulty",
    }
    return modeMap[mode] || mode
  }

  // Get query summary
  const getQuerySummary = (item: KeywordResearchResults) => {
    const queryParams = item.query_params || {}
    if (item.mode === "keywords_for_site") {
      return typeof queryParams === 'object' && 'target_url' in queryParams 
        ? String(queryParams.target_url) 
        : typeof queryParams === 'object' && 'target' in queryParams 
          ? String(queryParams.target) 
          : "No URL provided"
    }
    return typeof queryParams === 'object' && 'keyword' in queryParams 
      ? String(queryParams.keyword) 
      : "No keyword provided"
  }

  // Get result count
  const getResultCount = (item: KeywordResearchResults) => {
    const data = item.data || {}
    if (Array.isArray(data)) {
      return data.length
    }
    if (data.tasks && Array.isArray(data.tasks)) {
      const task = data.tasks[0] || {}
      const result = task.result || {}
      const items = result.items || []
      return items.length
    }
    return 0
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Keyword Research History</h1>
            <p className="text-muted-foreground mt-1">
              View your past keyword research queries and results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push("/dashboard/keyword-research")}
              variant="outline"
              className="ios-button"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              New Research
            </Button>
            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="ios-button">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear History
                </Button>
              </DialogTrigger>
              <DialogContent className="ios-dialog animate-scale-up">
                <DialogHeader>
                  <DialogTitle>Clear History</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to clear your keyword research history? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleClearHistory}>
                    Clear History
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter by keyword or domain..."
              className="pl-8 rounded-full"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className="ios-card animate-pulse"
              >
                <div className="p-6 h-48"></div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item: KeywordResearchResults, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="ios-card"
                >
                  <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="ios-badge">
                          {getResearchModeDisplay(item.mode)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : 
                          item.timestamp ? format(new Date(item.timestamp), "MMM d, yyyy") : "Unknown date"}
                        </span>
                      </div>
                      <CardTitle className="text-lg truncate">
                        {getQuerySummary(item)}
                      </CardTitle>
                      <CardDescription>
                        {getResultCount(item)} results found
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="text-sm text-muted-foreground">
                        {item.query_params?.locationName && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Location:</span>
                            <span>{item.query_params.locationName}</span>
                          </div>
                        )}
                        {item.query_params?.languageName && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Language:</span>
                            <span>{item.query_params.languageName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full ios-button"
                        onClick={() => router.push(`/dashboard/keyword-research?id=${item.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredHistory.length > itemsPerPage && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {Math.ceil(filteredHistory.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredHistory.length / itemsPerPage)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {filteredHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No history found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchFilter
                    ? "No results match your search criteria. Try a different search term."
                    : "You haven't performed any keyword research yet."}
                </p>
                {searchFilter && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchFilter("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
