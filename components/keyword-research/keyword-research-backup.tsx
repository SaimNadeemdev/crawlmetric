"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Download, Search, History, ChevronDown, ChevronUp, Clock, Trash2, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { useKeywordResearch } from "@/contexts/keyword-research-context"
import { formatNumber } from "@/lib/utils"
import { isAuthenticated } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
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
import { KeywordResearchHistoryItem } from "./keyword-research-history-item"
import type { KeywordResearchResults } from "@/types/keyword-research"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

type ResearchMode = "keyword_suggestions" | "keywords_for_site" | "historical_search_volume" | "keyword_ideas"

export default function KeywordResearch() {
  const router = useRouter()
  const { 
    runKeywordResearch, 
    isLoading: contextLoading, 
    results: contextResults,
    searchHistory,
    loadHistory,
    clearHistory,
    isHistoryLoading
  } = useKeywordResearch()

  // Form state
  const [mode, setMode] = useState<ResearchMode>("keyword_suggestions")
  const [keyword, setKeyword] = useState("")
  const [locationName, setLocationName] = useState("United States")
  const [languageName, setLanguageName] = useState("English")
  const [limit, setLimit] = useState(10)
  const [targetUrl, setTargetUrl] = useState("")

  // Results state
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timestamp, setTimestamp] = useState("")
  const [searchFilter, setSearchFilter] = useState("")
  
  // History state
  const [showHistory, setShowHistory] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<KeywordResearchResults | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 6

  // Update results when contextResults changes
  useEffect(() => {
    if (contextResults && contextResults.data) {
      setResults(processResults(Array.isArray(contextResults.data) ? contextResults.data : [contextResults.data]));
      setTimestamp(contextResults.timestamp || new Date().toLocaleString());
    }
  }, [contextResults]);

  // Get the appropriate DataForSEO endpoint for each mode
  const getEndpoint = (mode: ResearchMode) => {
    switch (mode) {
      case "keyword_suggestions":
        return "/dataforseo_labs/google/keyword_suggestions/live"
      case "keywords_for_site":
        return "/dataforseo_labs/google/keywords_for_site/live"
      case "historical_search_volume":
        return "/dataforseo_labs/google/historical_search_volume/live"
      case "keyword_ideas":
        return "/dataforseo_labs/google/keyword_ideas/live"
    }
  }

  // Function to get a readable title for the research mode
  const getTitleForMode = (mode: string) => {
    switch (mode) {
      case "keyword_suggestions":
        return "Keyword Suggestions"
      case "keywords_for_site":
        return "Keywords for Site"
      case "keywords_for_categories":
        return "Keywords for Categories"
      case "historical_search_volume":
        return "Historical Search Volume"
      case "bulk_keyword_difficulty":
        return "Keyword Difficulty"
      case "keyword_trends":
        return "Keyword Trends"
      case "serp_competitors":
        return "SERP Competitors"
      case "keyword_ideas":
        return "Keyword Ideas"
      case "search_intent":
        return "Search Intent"
      default:
        return "Research Results"
    }
  }

  // Function to get a summary of the research
  const getResearchSummary = (result: KeywordResearchResults) => {
    try {
      if (!result.queryParams) return "No parameters available"
      
      switch (result.mode) {
        case "keyword_suggestions":
        case "keyword_ideas":
          return `Keyword: ${result.queryParams.keyword || "N/A"}`
        case "keywords_for_site":
          return `Domain: ${result.queryParams.target || "N/A"}`
        case "keywords_for_categories":
          return `Category: ${result.queryParams.category || "N/A"}`
        case "historical_search_volume":
        case "bulk_keyword_difficulty":
        case "search_intent":
          return `Keywords: ${result.queryParams.keywords?.length || 0} keywords`
        case "keyword_trends":
          return `Keyword: ${result.queryParams.keyword || "N/A"}`
        case "serp_competitors":
          return `Keyword: ${result.queryParams.keyword || "N/A"}`
        default:
          return "No summary available"
      }
    } catch (error) {
      return "No summary available"
    }
  }

  // Function to get the result count
  const getResultCount = (result: KeywordResearchResults) => {
    try {
      if (result.data && Array.isArray(result.data)) {
        return result.data.length
      }
      return 0
    } catch (error) {
      return 0
    }
  }

  // Get difficulty level based on score
  const getDifficultyLevel = (score: number): string => {
    if (score >= 80) return "Very Hard"
    if (score >= 60) return "Hard"
    if (score >= 40) return "Medium"
    if (score >= 20) return "Easy"
    return "Very Easy"
  }

  // Process results from API
  const processResults = (data: any[]): any[] => {
    if (!Array.isArray(data)) {
      console.error("Expected array for processResults, got:", typeof data);
      return [];
    }

    // Try to extract items from nested structure if needed
    let processedData = data;
    
    // Handle nested API response structure
    if (data.length === 1 && data[0]?.tasks && Array.isArray(data[0].tasks)) {
      processedData = data[0].tasks.flatMap((task: any) => {
        if (task.result && Array.isArray(task.result)) {
          return task.result;
        } else if (task.result && task.result.items && Array.isArray(task.result.items)) {
          return task.result.items;
        }
        return [];
      });
    }

    // Normalize data structure for consistency
    processedData = processedData.map((item: any) => {
      const normalizedItem = { ...item };
      
      // Normalize keyword_difficulty from various possible sources
      if (item.difficulty && typeof item.difficulty === 'number' && !item.keyword_difficulty) {
        normalizedItem.keyword_difficulty = item.difficulty;
      }
      
      if (!normalizedItem.keyword_difficulty && item.seo_difficulty && typeof item.seo_difficulty === 'number') {
        normalizedItem.keyword_difficulty = item.seo_difficulty;
      }
      
      // Handle nested structures from DataForSEO
      if (!normalizedItem.keyword_difficulty && 
          item.keyword_data && 
          item.keyword_data.keyword_info && 
          typeof item.keyword_data.keyword_info.keyword_difficulty === 'number') {
        normalizedItem.keyword_difficulty = item.keyword_data.keyword_info.keyword_difficulty;
      }
      
      // Ensure keyword_difficulty is a number
      if (typeof normalizedItem.keyword_difficulty !== 'number') {
        normalizedItem.keyword_difficulty = 0;
      }
      
      // Add difficulty level based on the keyword_difficulty score
      normalizedItem.difficulty_level = getDifficultyLevel(normalizedItem.keyword_difficulty);
      
      return normalizedItem;
    });

    return processedData;
  }

  // Helper function to render difficulty badge
  const renderDifficultyBadge = (difficultyLevel: string, score: number) => {
    let variant = "outline";
    let bgColor = "";
    
    if (difficultyLevel === "Very Hard" || difficultyLevel === "Hard") {
      variant = "destructive";
      bgColor = "bg-red-100 dark:bg-red-900/20";
    } else if (difficultyLevel === "Medium") {
      variant = "warning";
      bgColor = "bg-yellow-100 dark:bg-yellow-900/20";
    } else if (difficultyLevel === "Easy" || difficultyLevel === "Very Easy") {
      variant = "success";
      bgColor = "bg-green-100 dark:bg-green-900/20";
    }
    
    return (
      <div className={`flex flex-col items-center rounded-md py-1.5 px-3 ${bgColor}`}>
        <Badge variant={variant as any} className="mb-1">
          {score ? Math.round(score) : "N/A"}
        </Badge>
        <span className="text-xs font-medium">{difficultyLevel}</span>
      </div>
    );
  };

  // Helper function to render competition badge
  const renderCompetitionBadge = (competitionLevel: string) => {
    let variant = "outline";
    let bgColor = "";
    
    if (competitionLevel === "Very High" || competitionLevel === "High") {
      variant = "destructive";
      bgColor = "bg-red-100 dark:bg-red-900/20";
    } else if (competitionLevel === "Medium") {
      variant = "warning";
      bgColor = "bg-yellow-100 dark:bg-yellow-900/20";
    } else if (competitionLevel === "Low" || competitionLevel === "Very Low") {
      variant = "success";
      bgColor = "bg-green-100 dark:bg-green-900/20";
    }
    
    return (
      <div className={`rounded-md py-1.5 px-3 ${bgColor}`}>
        <Badge variant={variant as any}>
          {competitionLevel}
        </Badge>
      </div>
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form based on mode
    if (mode === "keyword_suggestions" || mode === "keyword_ideas" || mode === "historical_search_volume") {
      if (!keyword) {
        setError("Keyword is required")
        return
      }
    } else if (mode === "keywords_for_site") {
      if (!targetUrl) {
        setError("Target URL is required")
        return
      }
    }

    setIsLoading(true)
    setError("")

    try {
      // Prepare params based on mode
      const params = {
        mode,
        locationName,
        languageName,
        limit,
      } as any

      // Add mode-specific params
      if (mode === "keyword_suggestions" || mode === "keyword_ideas" || mode === "historical_search_volume") {
        params.keyword = keyword
      } else if (mode === "keywords_for_site") {
        params.target = targetUrl
      }

      // For historical search volume, we need to pass keywords as an array
      if (mode === "historical_search_volume") {
        params.keywords = [keyword]
      }

      // Run the research
      await runKeywordResearch(params)

      // Set timestamp
      setTimestamp(new Date().toLocaleString())
    } catch (err: any) {
      setError(err.message || "An error occurred during research")
    } finally {
      setIsLoading(false)
    }
  }

  // Format number with commas
  const formatNumber = (num: number) => {
    return num ? num.toLocaleString() : "0"
  }

  // Export results to CSV
  const exportToCsv = () => {
    if (!results.length) return

    // Create CSV content based on mode
    let csvContent = ""

    switch (mode) {
      case "keywords_for_site":
        csvContent = "Keyword,Position,Search Volume,Traffic,Traffic Cost,CPC,URL\n"
        csvContent += results
          .map(
            (item: any) =>
              `"${item.keyword}",${item.position},${item.search_volume},${item.traffic},${item.traffic_cost},${item.cpc},"${item.url}"`,
          )
          .join("\n")
        break

      case "historical_search_volume":
        // For historical data, we'll create a flattened CSV
        csvContent = "Keyword,Year,Month,Search Volume\n"
        results.forEach((item: any) => {
          if (item.historical_data) {
            item.historical_data.forEach((entry: any) => {
              csvContent += `"${item.keyword}",${entry.year},${entry.month},${entry.search_volume}\n`
            })
          }
        })
        break

      case "keyword_suggestions":
      case "keyword_ideas":
      default:
        csvContent = "Keyword,Search Volume,CPC,Ad Competition,SEO Difficulty,Ad Competition Level\n"
        csvContent += results
          .map(
            (item: any) =>
              `"${item.keyword}",${item.search_volume},${item.cpc},${(item.competition || 0) * 100}%,"${item.difficulty_level}","${item.competition_level}"`,
          )
          .join("\n")
    }

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${mode}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter results based on search query
  const filteredResults = searchFilter
    ? results.filter((item) => item.keyword.toLowerCase().includes(searchFilter.toLowerCase()))
    : results

  // Render form fields based on mode
  const renderModeSpecificFields = () => {
    switch (mode) {
      case "keywords_for_site":
        return (
          <div className="space-y-2">
            <Label htmlFor="target-url">Target URL</Label>
            <Input
              id="target-url"
              placeholder="Enter website URL (e.g., example.com)"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              placeholder="Enter a keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
          </div>
        )
    }
  }

  // Render results based on mode
  const renderResults = () => {
    if (isLoading || contextLoading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800 opacity-25"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-black dark:border-white animate-spin"></div>
            </div>
            <p className="text-lg font-medium animate-pulse">Running keyword research...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4 animate-slide-up">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    // Apply search filter if provided
    const filteredResults = searchFilter
      ? results.filter((result: any) => 
          result.keyword && result.keyword.toLowerCase().includes(searchFilter.toLowerCase())
        )
      : results;

    if (filteredResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Try adjusting your search query or run a new research with different parameters
          </p>
        </div>
      )
    }

    // Prepare data for the DataTable
    const tableData = filteredResults.map((result: any) => {
      // Normalize data structure for consistency
      return {
        ...result,
        // Ensure keyword_difficulty exists
        keyword_difficulty: result.keyword_difficulty || 
                          result.difficulty || 
                          (result.keyword_data?.keyword_info?.keyword_difficulty) || 0,
        // Ensure competition exists
        competition: result.competition || 
                    (result.competition_level === 'HIGH' ? 0.8 : 
                    result.competition_level === 'MEDIUM' ? 0.5 : 
                    result.competition_level === 'LOW' ? 0.2 : undefined)
      };
    });

    return (
      <div className="space-y-6 animate-scale-up">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter keywords..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 ios-button border-0 w-[200px]"
              />
              {searchFilter && (
                <button 
                  onClick={() => setSearchFilter("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCsv}
              className="ios-button border-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="ios-card overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={tableData} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Keyword Research</h1>
        <p className="text-muted-foreground">
          Research keywords and get insights for your SEO strategy
        </p>
      </div>

      {/* Research Form */}
      <div className="ios-card p-6 animate-scale-up">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="research-mode">Research Mode</Label>
              <Select
                value={mode}
                onValueChange={(value) => setMode(value as ResearchMode)}
              >
                <SelectTrigger id="research-mode" className="ios-button border-0">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword_suggestions">Keyword Suggestions</SelectItem>
                  <SelectItem value="keywords_for_site">Keywords for Site</SelectItem>
                  <SelectItem value="historical_search_volume">Historical Search Volume</SelectItem>
                  <SelectItem value="keyword_ideas">Keyword Ideas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={locationName}
                onValueChange={setLocationName}
              >
                <SelectTrigger id="location" className="ios-button border-0">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={languageName}
                onValueChange={setLanguageName}
              >
                <SelectTrigger id="language" className="ios-button border-0">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Result Limit</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="limit"
                  min={10}
                  max={100}
                  step={10}
                  value={[limit]}
                  onValueChange={(value) => setLimit(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center font-medium">{limit}</span>
              </div>
            </div>
          </div>

          {renderModeSpecificFields()}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || contextLoading}
              className="ios-button bg-black text-white dark:bg-white dark:text-black border-0 flex-1"
            >
              {(isLoading || contextLoading) ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Run Research
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="ios-button border-0 flex-1"
            >
              <History className="mr-2 h-4 w-4" />
              {showHistory ? "Hide History" : "View History"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/keyword-research/history")}
              className="ios-button border-0 flex-1"
            >
              <Clock className="mr-2 h-4 w-4" />
              History Page
            </Button>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="ios-card p-6 animate-scale-up">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Results</h2>
            {timestamp && <p className="text-sm text-muted-foreground">Generated at {timestamp}</p>}
          </div>

          {renderResults()}
        </div>
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="ios-card p-6 animate-scale-up">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Research History</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={loadHistory}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Research History</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to clear your research history? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearHistory}>Clear History</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            {isHistoryLoading ? (
              <div className="flex items-center justify-center p-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground animate-pulse mr-2" />
                <p className="text-lg font-medium">Loading research history...</p>
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No research history</p>
                <p className="text-sm text-muted-foreground mb-4">Your research history will appear here</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {searchHistory
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((result: KeywordResearchResults, index: number) => {
                    // Format the date
                    const formattedDate = result.created_at 
                      ? format(new Date(result.created_at), "MMM d, yyyy h:mm a")
                      : result.timestamp 
                        ? format(new Date(result.timestamp), "MMM d, yyyy h:mm a") 
                        : "Unknown date";
                    
                    return (
                      <div 
                        key={index}
                        className="group relative overflow-hidden rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2"
                        data-state="open"
                      >
                        {/* Top border accent with animation */}
                        <div className="absolute inset-x-0 top-0 h-[2px] bg-black dark:bg-white before:absolute before:inset-0 before:bg-black dark:before:bg-white before:origin-left before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:duration-300"></div>
                        
                        {/* Card content */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                {result.mode === "keyword_suggestions" && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-zinc-100"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                )}
                                {result.mode === "keywords_for_site" && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-zinc-100"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                                )}
                                {result.mode === "historical_search_volume" && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-zinc-100"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                )}
                                {result.mode === "bulk_keyword_difficulty" && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-zinc-100"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                )}
                                {result.mode === "keyword_ideas" && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-zinc-100"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                )}
                              </div>
                              <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 transition-all duration-300 group-hover:translate-x-1">
                                {getTitleForMode(result.mode)}
                              </h3>
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                              {formattedDate}
                            </span>
                          </div>
                          
                          <div className="space-y-4 mt-2">
                            <div className="space-y-2">
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                {getResearchSummary(result)}
                              </p>
                              
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {getResultCount(result)} results found
                              </p>
                            </div>
                            
                            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                              <button 
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-md transition-all duration-300 hover:bg-zinc-800 dark:hover:bg-zinc-200 group-hover:shadow-lg relative overflow-hidden before:absolute before:inset-0 before:bg-black/10 dark:before:bg-white/10 before:translate-x-[-100%] hover:before:translate-x-0 before:transition-transform before:duration-300"
                                onClick={() => {
                                  // Set the selected history item for detailed view
                                  setSelectedHistoryItem(result);
                                  
                                  // Load the data into the main results view
                                  if (result.data) {
                                    setResults(processResults(Array.isArray(result.data) ? result.data : [result.data]));
                                    setMode(result.mode as ResearchMode);
                                    setTimestamp(result.timestamp || result.created_at || '');
                                  }
                                }}
                              >
                                <span>View Results</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform transition-transform duration-300 group-hover:translate-x-1">
                                  <path d="M5 12h14"></path>
                                  <path d="m12 5 7 7-7 7"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination Controls */}
                {searchHistory.length > itemsPerPage && (
                  <div className="flex justify-center mt-8 space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M15 18L9 12L15 6" />
                      </svg>
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.ceil(searchHistory.length / itemsPerPage) }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                            currentPage === i + 1
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(searchHistory.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(searchHistory.length / itemsPerPage)}
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:pointer-events-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Next
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M9 18L15 12L9 6" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
</div>

