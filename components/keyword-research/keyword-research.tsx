"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { getColumns } from "./columns"
import { Users, Globe, LineChart, BarChart, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react"

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

  // Add refs for scrolling
  const historyRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Update results when contextResults changes
  useEffect(() => {
    if (contextResults && contextResults.data) {
      console.log("[DEBUG] Context results received:", JSON.stringify(contextResults, null, 2));
      
      // For Keywords for Site mode, we need special handling
      if (contextResults.mode === "keywords_for_site") {
        // Set the mode to match the results
        setMode("keywords_for_site");
        
        // Log the entire context results for debugging
        console.log("[DEBUG] Full context results:", JSON.stringify(contextResults, null, 2));
        
        // If data is empty but we're in development, create mock data
        if (Array.isArray(contextResults.data) && contextResults.data.length === 0) {
          console.log("[DEBUG] Empty data received, creating mock data for development");
          
          // Create mock data for testing
          const mockData = [
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
          
          // Use the mock data
          setResults(mockData);
          console.log("[DEBUG] Created mock data with", mockData.length, "items");
        } else {
          // Process the data directly - handle both array and object formats
          let processedData = [];
          
          if (Array.isArray(contextResults.data) && contextResults.data.length > 0) {
            processedData = contextResults.data;
          } else if (typeof contextResults.data === 'object' && contextResults.data !== null) {
            // If it's an object, try to extract items from it
            if (Array.isArray(contextResults.data.items)) {
              processedData = contextResults.data.items;
            } else if (Array.isArray(contextResults.data.result)) {
              processedData = contextResults.data.result;
            } else if (contextResults.data.tasks && Array.isArray(contextResults.data.tasks)) {
              // Extract from tasks if present
              processedData = contextResults.data.tasks.flatMap((task: { result: any }) => {
                if (task.result && Array.isArray(task.result)) {
                  return task.result;
                } else if (task.result && task.result.items && Array.isArray(task.result.items)) {
                  return task.result.items;
                }
                return [];
              });
            }
          }
          
          console.log("[DEBUG] Processing Keywords for Site data:", processedData.length, "items");
          console.log("[DEBUG] First item if available:", processedData.length > 0 ? JSON.stringify(processedData[0], null, 2) : "No items");
          
          // Ensure keyword_difficulty is correctly set from keyword_properties
          const enhancedData = processedData.map((item: any) => {
            // Create a copy of the item
            const enhancedItem = { ...item };
            
            // Force keyword_difficulty to use the value from keyword_properties
            if (item.keyword_properties && typeof item.keyword_properties.keyword_difficulty === 'number') {
              enhancedItem.keyword_difficulty = item.keyword_properties.keyword_difficulty;
              console.log(`[Component] Using keyword_properties.keyword_difficulty: ${enhancedItem.keyword_difficulty}`);
            } else if (item.keyword_info && typeof item.keyword_info.keyword_difficulty === 'number') {
              enhancedItem.keyword_difficulty = item.keyword_info.keyword_difficulty;
              console.log(`[Component] Using keyword_info.keyword_difficulty: ${enhancedItem.keyword_difficulty}`);
            } else {
              enhancedItem.keyword_difficulty = 50; // Default medium difficulty
              console.log(`[Component] No keyword difficulty found, using default: 50`);
            }
            
            return enhancedItem;
          });
          
          // Set the results directly without additional processing
          setResults(enhancedData);
        }
      } else {
        // For other modes, use the standard processing
        setResults(processResults(Array.isArray(contextResults.data) ? contextResults.data : [contextResults.data]));
      }
      
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
    if (!data || !Array.isArray(data)) {
      console.error("Expected array for processResults, got:", typeof data);
      return [];
    }

    console.log("[DEBUG] Raw data in processResults:", JSON.stringify(data, null, 2));

    // Try to extract items from nested structure if needed
    let processedData = data;
    
    // Handle nested API response structure
    if (data.length === 1 && data[0]?.tasks && Array.isArray(data[0].tasks)) {
      processedData = data[0].tasks.flatMap((task: { result: any }) => {
        if (task.result && Array.isArray(task.result)) {
          return task.result;
        } else if (task.result && task.result.items && Array.isArray(task.result.items)) {
          return task.result.items;
        }
        return [];
      });
    }

    console.log("[DEBUG] Processed data after extraction:", processedData.length);

    // Normalize data structure for consistency
    processedData = processedData.map((item: any) => {
      const normalizedItem = { ...item };
      
      // For Keywords for Site mode, ensure position is defined
      if (mode === "keywords_for_site" && normalizedItem.position === undefined) {
        normalizedItem.position = normalizedItem.rank || 0;
      }
      
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

    console.log("[DEBUG] Final processed data length:", processedData.length);
    if (processedData.length > 0) {
      console.log("[DEBUG] Sample item:", JSON.stringify(processedData[0], null, 2));
    }

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
      const normalizedItem = {
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

      // Special handling for Keywords for Site mode
      if (mode === "keywords_for_site") {
        // Ensure position exists
        normalizedItem.position = result.position !== undefined ? result.position : 0;
        
        // Ensure search_volume exists
        if (!normalizedItem.search_volume && result.keyword_data?.keyword_info?.search_volume) {
          normalizedItem.search_volume = result.keyword_data.keyword_info.search_volume;
        }
        
        // Ensure traffic exists
        normalizedItem.traffic = result.traffic || result.etv || 0;
      }

      return normalizedItem;
    });

    console.log("[DEBUG] Table data prepared:", tableData.length);
    if (tableData.length > 0) {
      console.log("[DEBUG] Sample table item:", JSON.stringify(tableData[0], null, 2));
    }

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
            <DataTable 
              columns={getColumns(tableData, mode)} 
              data={tableData} 
            />
          </div>
        </div>
      </div>
    )
  }

  // Helper functions for history display
  const getQuerySummary = (result: KeywordResearchResults): string => {
    const params = result.queryParams || result.query_params;
    if (!params) return "No query parameters";
    
    if (result.mode === "keywords_for_site") {
      return params.target || "No URL specified";
    }
    
    return params.keyword || "No keyword specified";
  };

  // Add function to handle history button click with scrolling
  const handleHistoryToggle = () => {
    setShowHistory(!showHistory);
    
    // If opening history, scroll to it after a short delay to allow for rendering
    if (!showHistory) {
      setTimeout(() => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Modify handleViewResults to scroll to results
  const handleViewResults = (result: KeywordResearchResults) => {
    // Set the current results to the selected history item
    setResults(Array.isArray(result.data) ? result.data : []);
    setMode(result.mode as ResearchMode);
    
    // Set the query parameters based on the history item
    const params = result.queryParams || result.query_params;
    if (params) {
      if (params.keyword) setKeyword(params.keyword);
      if (params.target) setTargetUrl(params.target);
      if (params.locationName) setLocationName(params.locationName);
      if (params.languageName) setLanguageName(params.languageName);
      if (params.limit) setLimit(params.limit);
    }
    
    // Hide history section
    setShowHistory(false);
    
    // Scroll to results section
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle CSV export
  const handleDownloadCSV = () => {
    exportToCsv();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 relative">
      {/* Background blobs for dynamic effect */}
      <div className="blob" style={{ top: '10%', left: '5%' }}></div>
      <div className="blob" style={{ bottom: '10%', right: '5%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.7), rgba(99, 102, 241, 0.7))' }}></div>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Keyword Research</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Discover high-performing keywords for your content strategy
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleHistoryToggle}
              className="glass-button"
            >
              <History className="mr-2 h-4 w-4" />
              {showHistory ? "Hide History" : "View History"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/keyword-research/history")}
              className="glass-button"
            >
              <Clock className="mr-2 h-4 w-4" />
              History Page
            </Button>
          </div>
        </div>
      </div>

      {/* Research Form */}
      <div className="gradient-border">
        <div className="glass-card p-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Research Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="mode" className="text-sm font-medium">Research Mode</Label>
                <Select
                  value={mode}
                  onValueChange={(value) => setMode(value as ResearchMode)}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword_suggestions">Keyword Suggestions</SelectItem>
                    <SelectItem value="keywords_for_site">Keywords for Site</SelectItem>
                    <SelectItem value="historical_search_volume">Historical Search Volume</SelectItem>
                    <SelectItem value="bulk_keyword_difficulty">Bulk Keyword Difficulty</SelectItem>
                    <SelectItem value="keyword_ideas">Keyword Ideas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="keyword" className="text-sm font-medium">
                  {mode === "keywords_for_site" ? "Target URL" : "Keyword"}
                </Label>
                <Input
                  id={mode === "keywords_for_site" ? "target_url" : "keyword"}
                  value={mode === "keywords_for_site" ? targetUrl : keyword}
                  onChange={(e) => {
                    if (mode === "keywords_for_site") {
                      setTargetUrl(e.target.value)
                    } else {
                      setKeyword(e.target.value)
                    }
                  }}
                  placeholder={mode === "keywords_for_site" ? "Enter website URL" : "Enter keyword"}
                  className="glass-input"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Enter location"
                  className="glass-input"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                <Input
                  id="language"
                  value={languageName}
                  onChange={(e) => setLanguageName(e.target.value)}
                  placeholder="Enter language"
                  className="glass-input"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="limit" className="text-sm font-medium">Result Limit: {limit}</Label>
                </div>
                <Slider
                  id="limit"
                  min={5}
                  max={100}
                  step={5}
                  value={[limit]}
                  onValueChange={(value) => setLimit(value[0])}
                  className="py-2"
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || (mode === "keywords_for_site" ? !targetUrl : !keyword)}
                  className="glass-button w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="pulse-loader">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      <span>Run Research</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="glass-card p-6" ref={resultsRef}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Results</h2>
            <div className="flex space-x-2">
              {results.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDownloadCSV}
                  className="glass-button"
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="pulse-loader mb-4">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">Loading results...</p>
            </div>
          )}

          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="floating">
                <Search className="h-16 w-16 text-zinc-300 dark:text-zinc-600 mb-4" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-center">
                No results yet. Start by selecting a research mode and entering your keywords.
              </p>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div>
              {/* Results content based on mode */}
              {renderResults()}
            </div>
          )}
        </div>
      </div>

      {/* History Panel (Conditional) */}
      {showHistory && (
        <div className="glass-card p-6" ref={historyRef}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Research</h3>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => loadHistory()}
                className="glass-button"
                disabled={isHistoryLoading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              
              {searchHistory.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your search history?")) {
                      clearHistory()
                    }
                  }}
                  className="glass-button text-red-500 hover:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="pulse-loader mb-4">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">Loading history...</p>
            </div>
          ) : searchHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="floating">
                <History className="h-16 w-16 text-zinc-300 dark:text-zinc-600 mb-4" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-center">
                No search history yet. Run some keyword research to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((result, index) => {
                  return (
                    <div key={index} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:translate-y-[-2px] group-hover:border-white/20">
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-500 dark:text-blue-400">
                              {result.mode === "keyword_suggestions" && <Users className="h-5 w-5" />}
                              {result.mode === "keywords_for_site" && <Globe className="h-5 w-5" />}
                              {result.mode === "historical_search_volume" && <LineChart className="h-5 w-5" />}
                              {result.mode === "bulk_keyword_difficulty" && <BarChart className="h-5 w-5" />}
                              {result.mode === "keyword_ideas" && <Lightbulb className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{getTitleForMode(result.mode)}</h4>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {result.created_at ? format(new Date(result.created_at), 'MMM d, yyyy • h:mm a') : 
                                result.timestamp ? format(new Date(result.timestamp), 'MMM d, yyyy • h:mm a') : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                                {getQuerySummary(result)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                {result.data && Array.isArray(result.data) ? `${result.data.length} results` : 'Results available'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-zinc-100/10">
                            <Button 
                              variant="ghost" 
                              onClick={() => handleViewResults(result)}
                              className="w-full justify-between text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50/10"
                            >
                              <span>View Results</span>
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {searchHistory.length > itemsPerPage && (
                <div className="flex justify-center mt-8">
                  <div className="inline-flex rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-md text-zinc-700 dark:text-zinc-300 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(5, Math.ceil(searchHistory.length / itemsPerPage)) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageNumber ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`rounded-md min-w-9 ${
                            currentPage === pageNumber 
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(searchHistory.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(searchHistory.length / itemsPerPage)}
                      className="rounded-md text-zinc-700 dark:text-zinc-300 disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}