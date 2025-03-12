"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import {
  Search,
  Download,
  ArrowRight,
  ChevronDown,
  Info,
  Calendar,
  BarChart,
  TrendingUp,
} from "lucide-react"
import { useKeywordResearch } from "@/contexts/keyword-research-context"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Download as DownloadIcon, 
  Search as SearchIcon, 
  RefreshCcw, 
  History, 
  ChevronDown as ChevronDownIcon, 
  ChevronUp, 
  AlertCircle, 
  Trash2, 
  ArrowLeft, 
  Clock,
  Users, 
  Globe, 
  LineChart, 
  BarChart as BarChartIcon, 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"
import { KeywordResearchResults } from "@/types/keyword-research"
import { getColumns } from "./columns"
import { useToast } from "@/components/ui/use-toast"
import { motion as motionFramer } from "framer-motion"

type ResearchMode = "keyword_suggestions" | "keywords_for_site" | "historical_search_volume" | "keyword_ideas" | "keywords_for_categories" | "bulk_keyword_difficulty" | "keyword_trends" | "serp_competitors" | "search_intent"

export default function KeywordResearch() {
  const { 
    runKeywordResearch, 
    isLoading: contextLoading, 
    results: contextResults,
    searchHistory,
    loadHistory,
    clearHistory,
    isHistoryLoading
  } = useKeywordResearch()

  // Canvas reference for animated background
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  // Initialize animated background
  useEffect(() => {
    setMounted(true)
    
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Create dots
    const dots: { x: number; y: number; radius: number; opacity: number; speed: number }[] = []
    
    for (let i = 0; i < 100; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.2 + 0.1
      })
    }
    
    // Animation loop
    let animationFrameId: number
    
    const animate = () => {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw dots
      dots.forEach(dot => {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 0, 0, ${dot.opacity * 0.3})`
        ctx.fill()
        
        // Move dots
        dot.y += dot.speed
        
        // Reset dots that go off screen
        if (dot.y > canvas.height) {
          dot.y = 0
          dot.x = Math.random() * canvas.width
        }
      })
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted])

  // State for form inputs
  const [mode, setMode] = useState<ResearchMode>("keyword_suggestions")
  const [keyword, setKeyword] = useState<string>("")
  const [targetUrl, setTargetUrl] = useState<string>("")
  const [locationName, setLocationName] = useState<string>("United States")
  const [languageName, setLanguageName] = useState<string>("English")
  const [limit, setLimit] = useState<number>(50)
  const [searchFilter, setSearchFilter] = useState<string>("")
  const [timestamp, setTimestamp] = useState<string>("")
  
  // State for results
  const [results, setResults] = useState<any[]>([])
  
  // Add refs for scrolling
  const historyRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast()

  // Toggle history visibility
  const toggleHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Select a history item to view
  const handleSelectHistoryItem = (item: KeywordResearchResults) => {
    setResults(item.data || []);
    setTimestamp(item.timestamp || new Date().toLocaleString());
    setMode(item.mode as ResearchMode);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Export results to CSV
  const handleExportCSV = () => {
    if (results.length === 0) return;
    
    // Create CSV content
    const headers = Object.keys(results[0]).filter(key => 
      typeof results[0][key] !== 'object' && key !== 'keyword_properties'
    );
    
    let csvContent = headers.join(',') + '\n';
    
    results.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `keyword_research_${mode}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Validate form before submission
  const isValid = () => {
    if (mode === "keywords_for_site") {
      return targetUrl.trim() !== "";
    } else {
      return keyword.trim() !== "";
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Researching",
      description: "Please wait while we process your request",
      variant: "default",
    });
    
    const params: any = {
      mode,
      locationName,
      languageName,
      limit
    };
    
    if (mode === "keywords_for_site") {
      params.targetUrl = targetUrl;
    } else {
      params.keyword = keyword;
    }
    
    runKeywordResearch(params)
      .then(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .catch(err => {
        toast({
          title: "Error",
          description: err.message || "An error occurred during research",
          variant: "destructive",
        });
      });
  };

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
          console.log("[DEBUG] Empty data received from API");
          
          // Set empty results
          setResults([]);
          
          // Display a message to the user
          toast({
            title: "No Keywords Found",
            description: "No keywords were found for this website. Try another website or check your API credentials.",
            variant: "destructive",
          });
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
        return "Bulk Keyword Difficulty"
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

  // Get competition level based on competition score
  const getCompetitionLevel = (score: number): string => {
    if (score >= 0.8) return "Very High";
    if (score >= 0.6) return "High";
    if (score >= 0.4) return "Medium";
    if (score >= 0.2) return "Low";
    return "Very Low";
  }

  // Helper function to get month name
  const getMonthName = (monthNumber: number): string => {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                         "July", "August", "September", "October", "November", "December"];
    return monthNames[monthNumber - 1] || "";
  };

  // Process results from API
  const processResults = (data: any[]): any[] => {
    console.log("[DEBUG] Processing", data.length, "items");
    
    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // For historical search volume, expand the data to include one row per month
    if (mode === "historical_search_volume" && data.length > 0) {
      const expandedData: any[] = [];
      
      data.forEach(item => {
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
            
            expandedData.push(expandedItem);
          });
        } else {
          // If no months data, just add the item as is
          expandedData.push(item);
        }
      });
      
      console.log("[DEBUG] Expanded historical data:", expandedData.length, "rows");
      if (expandedData.length > 0) {
        console.log("[DEBUG] Sample row:", JSON.stringify(expandedData[0], null, 2));
      }
      
      return expandedData;
    }
    
    // For keyword ideas, normalize the data structure
    if (mode === "keyword_ideas" && data.length > 0) {
      console.log("[DEBUG] Processing keyword ideas data");
      
      // Extract ideas from nested structure if needed
      const normalizedData = data.map(item => {
        // Create a normalized item with standard properties
        const normalizedItem: any = {
          keyword: item.keyword || "",
          search_volume: 0,
          cpc: 0,
          competition: 0,
          competition_level: "N/A",
          difficulty: 0,
          difficulty_level: "N/A",
        };
        
        // Extract from item.keyword_data if it exists
        if (item.keyword_data) {
          // Get keyword info
          if (item.keyword_data.keyword_info) {
            const info = item.keyword_data.keyword_info;
            normalizedItem.search_volume = info.search_volume || 0;
            normalizedItem.cpc = info.cpc || 0;
            normalizedItem.competition = info.competition_index || 0;
          }
          
          // Get SEO difficulty info
          if (item.keyword_data.keyword_properties && item.keyword_data.keyword_properties.serp_info) {
            normalizedItem.difficulty = item.keyword_data.keyword_properties.serp_info.seo_difficulty || 0;
          }
        }
        
        // Get search volume directly if it exists
        if (item.search_volume !== undefined) {
          normalizedItem.search_volume = item.search_volume;
        }
        
        // Get CPC directly if it exists
        if (item.cpc !== undefined) {
          normalizedItem.cpc = item.cpc;
        }
        
        // Get competition directly if it exists
        if (item.competition !== undefined) {
          normalizedItem.competition = item.competition;
        }
        
        // Set competition level based on competition value
        normalizedItem.competition_level = getCompetitionLevel(normalizedItem.competition);
        
        // Set difficulty level based on difficulty value
        normalizedItem.difficulty_level = getDifficultyLevel(normalizedItem.difficulty);
        
        return normalizedItem;
      });
      
      console.log("[DEBUG] Normalized keyword ideas data:", normalizedData.length, "items");
      if (normalizedData.length > 0) {
        console.log("[DEBUG] Sample normalized item:", JSON.stringify(normalizedData[0], null, 2));
      }
      
      return normalizedData;
    }
    
    // For other modes, process as before
    const processedData = data.map(item => {
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

  // Custom No Data component with iOS styling
  const NoDataIndicator = ({ message = "No data" }: { message?: string }) => (
    <div className="flex items-center justify-center py-2 px-3 rounded-full bg-white/90 border border-gray-100 text-gray-600 backdrop-blur-xl shadow-sm">
      <Info className="h-4 w-4 mr-2 text-gray-400" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );

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
            <Label htmlFor="target-url" className="text-gray-700 font-medium">Target URL</Label>
            <Input
              id="target-url"
              placeholder="Enter website URL (e.g., example.com)"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
              className="apple-input"
            />
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="keyword" className="text-gray-700 font-medium">Keyword</Label>
            <Input
              id="keyword"
              placeholder="Enter a keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
              className="apple-input"
            />
          </div>
        )
    }
  }

  // Render results based on mode
  const renderResults = () => {
    if (contextLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-300/10 opacity-25"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-purple-500 animate-spin"></div>
          </div>
        </div>
      )
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="floating">
            <SearchIcon className="h-16 w-16 text-gray-400 mb-4" />
          </div>
          <p className="text-gray-500 text-center">
            No results yet. Start by selecting a research mode and entering your keywords.
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
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Filter keywords..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10 rounded-[22px] border-gray-100 bg-white/50 backdrop-blur-xl shadow-sm h-10 min-w-[250px] text-sm font-medium text-gray-800 focus:border-blue-300 focus:ring-blue-100"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="rounded-[22px] border-gray-100 bg-white/50 backdrop-blur-xl shadow-sm h-10 px-4 text-sm font-medium text-gray-800 hover:bg-white/70 transition-all"
            >
              <DownloadIcon className="mr-2 h-4 w-4 text-gray-600" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-[22px] overflow-hidden border border-gray-100 shadow-sm bg-white/50 backdrop-blur-xl">
          <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
            <DataTable 
              columns={getColumns(tableData, mode)} 
              data={tableData}
            />
          </div>
          
          <style jsx global>{`
            /* iOS-style table styling */
            .data-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              table-layout: fixed;
            }
            
            .data-table th {
              background-color: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(8px);
              font-weight: 600;
              color: #6b7280;
              text-align: left;
              padding: 8px 12px;
              font-size: 0.8rem;
              border-bottom: 1px solid rgba(229, 231, 235, 0.5);
              white-space: nowrap;
              position: sticky;
              top: 0;
              z-index: 10;
            }
            
            .data-table td {
              padding: 8px 12px;
              border-bottom: 1px solid rgba(229, 231, 235, 0.3);
              transition: background-color 0.2s ease;
              vertical-align: middle;
              white-space: nowrap;
            }
            
            .data-table tr:hover td {
              background-color: rgba(249, 250, 251, 0.5);
            }
            
            .data-table tr:last-child td {
              border-bottom: none;
            }
            
            /* Animated row appearance */
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .data-table tbody tr {
              animation: fadeIn 0.3s ease forwards;
              animation-delay: calc(var(--row-index, 0) * 0.03s);
              opacity: 0;
            }
            
            /* iOS-style scrollbar */
            .overflow-auto::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }
            
            .overflow-auto::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .overflow-auto::-webkit-scrollbar-thumb {
              background: rgba(156, 163, 175, 0.3);
              border-radius: 2px;
            }
            
            .overflow-auto::-webkit-scrollbar-thumb:hover {
              background: rgba(156, 163, 175, 0.5);
            }
            
            /* Fix for table container */
            .overflow-auto {
              scrollbar-width: thin;
              scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
            }
            
            /* iOS-style hover effects */
            .data-table tr {
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            
            .data-table tr:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              z-index: 1;
              position: relative;
            }
            
            /* Fix for table container */
            .rounded-md.border {
              border: none;
              overflow: visible;
            }
            
            /* Ensure the table container fills the available space */
            .data-table-wrapper {
              width: 100%;
            }
            
            /* Fix column header spacing */
            .data-table-column-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 4px;
            }
            
            /* Ensure sort buttons don't overlap with text */
            .data-table-column-header button {
              margin-left: 8px;
              flex-shrink: 0;
            }
            
            /* Ensure column titles don't get cut off */
            .data-table-column-header span {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Function to get research mode display name
  const getResearchModeName = (mode: string): string => {
    switch (mode) {
      case "keyword_suggestions":
        return "Keyword Suggestions";
      case "keywords_for_site":
        return "Keywords for Site";
      case "historical_search_volume":
        return "Historical Search Volume";
      case "keyword_ideas":
        return "Keyword Ideas";
      case "keywords_for_categories":
        return "Keywords for Categories";
      case "bulk_keyword_difficulty":
        return "Bulk Keyword Difficulty";
      case "keyword_trends":
        return "Keyword Trends";
      case "serp_competitors":
        return "SERP Competitors";
      case "search_intent":
        return "Search Intent";
      default:
        return mode;
    }
  };

  // Function to get query summary for history items
  const getQuerySummary = (result: KeywordResearchResults): string => {
    const params = result.queryParams || result.query_params;
    if (!params) return "Unknown query";

    if (result.mode === "keyword_suggestions" && params.keyword) {
      return `"${params.keyword}"`;
    } else if (result.mode === "keywords_for_site" && params.target) {
      return `Site: ${params.target}`;
    } else if (params.keyword) {
      return `"${params.keyword}"`;
    } else if (params.target) {
      return `Site: ${params.target}`;
    }

    return "Unknown query";
  };

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Function to handle deleting a history item
  const handleDeleteHistory = (index: number) => {
    // Create a new array without the item at the specified index
    const newHistory = [...searchHistory];
    newHistory.splice(index, 1);
    
    // Save the updated history to localStorage
    localStorage.setItem("keywordResearchHistory", JSON.stringify(newHistory));
    
    // Update the state in the parent context
    // Note: We're not calling loadHistory here as it doesn't accept parameters
    // Instead, we'll rely on the context to update its state
    toast({
      title: "History item deleted",
      description: "The selected history item has been removed.",
    });
  };

  // Function to handle loading a history item
  const handleLoadHistory = (result: KeywordResearchResults) => {
    loadHistory([result, ...searchHistory]);
  };

  // Load search history from local storage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("keywordResearchHistory");
    if (savedHistory) {
      try {
        // We don't need to do anything here as the context already loads the history
        console.log("History will be loaded by the context");
      } catch (error) {
        console.error("Error parsing search history:", error);
      }
    }
  }, []);

  return (
    <div className="relative bg-white">
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full opacity-50 pointer-events-none" />
      {/* Main content with responsive width */}
      <div className="relative z-10 pr-6 py-6">
        <motionFramer.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">Keyword Research</span>
          </h1>
          <p className="text-gray-500 text-lg">Discover high-value keywords and analyze search trends to optimize your content strategy.</p>
          
          {/* Gradient line */}
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-blue-300 rounded-full mt-4 mb-8"></div>
        </motionFramer.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Form */}
          <div className="lg:col-span-1">
            <motionFramer.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <Card className="overflow-hidden border border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-medium">Research Options</CardTitle>
                  <CardDescription>Configure your keyword research parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Research Mode */}
                  <div className="space-y-2">
                    <Label htmlFor="mode" className="text-gray-700 font-medium">Research Mode</Label>
                    <Select 
                      value={mode} 
                      onValueChange={(value) => setMode(value as ResearchMode)}
                    >
                      <SelectTrigger id="mode" className="w-full rounded-xl border-gray-200 bg-white text-gray-900 h-11">
                        <SelectValue placeholder="Select research mode" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-lg bg-white">
                        <SelectItem value="keyword_suggestions" className="rounded-lg hover:bg-gray-50 text-gray-900">Keyword Suggestions</SelectItem>
                        <SelectItem value="keywords_for_site" className="rounded-lg hover:bg-gray-50 text-gray-900">Keywords for Site</SelectItem>
                        <SelectItem value="historical_search_volume" className="rounded-lg hover:bg-gray-50 text-gray-900">Historical Search Volume</SelectItem>
                        <SelectItem value="keyword_ideas" className="rounded-lg hover:bg-gray-50 text-gray-900">Keyword Ideas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Keyword Input */}
                  {mode !== "keywords_for_site" && (
                    <div className="space-y-2">
                      <Label htmlFor="keyword" className="text-gray-700 font-medium">Keyword</Label>
                      <Input
                        id="keyword"
                        placeholder="Enter a keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        required
                        className="rounded-xl border-gray-200 bg-white text-gray-900 h-11"
                      />
                    </div>
                  )}

                  {/* URL Input for Keywords for Site */}
                  {mode === "keywords_for_site" && (
                    <div className="space-y-2">
                      <Label htmlFor="targetUrl" className="text-gray-700 font-medium">Target Website</Label>
                      <Input
                        id="targetUrl"
                        placeholder="Enter website URL (e.g., example.com)"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        required
                        className="rounded-xl border-gray-200 bg-white text-gray-900 h-11"
                      />
                    </div>
                  )}

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700 font-medium">Location</Label>
                    <Select 
                      value={locationName} 
                      onValueChange={setLocationName}
                    >
                      <SelectTrigger id="location" className="w-full rounded-xl border-gray-200 bg-white text-gray-900 h-11">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-lg bg-white">
                        <SelectItem value="United States" className="rounded-lg hover:bg-gray-50 text-gray-900">United States</SelectItem>
                        <SelectItem value="United Kingdom" className="rounded-lg hover:bg-gray-50 text-gray-900">United Kingdom</SelectItem>
                        <SelectItem value="Canada" className="rounded-lg hover:bg-gray-50 text-gray-900">Canada</SelectItem>
                        <SelectItem value="Australia" className="rounded-lg hover:bg-gray-50 text-gray-900">Australia</SelectItem>
                        <SelectItem value="Global" className="rounded-lg hover:bg-gray-50 text-gray-900">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-gray-700 font-medium">Language</Label>
                    <Select 
                      value={languageName} 
                      onValueChange={setLanguageName}
                    >
                      <SelectTrigger id="language" className="w-full rounded-xl border-gray-200 bg-white text-gray-900 h-11">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-lg bg-white">
                        <SelectItem value="English" className="rounded-lg hover:bg-gray-50 text-gray-900">English</SelectItem>
                        <SelectItem value="Spanish" className="rounded-lg hover:bg-gray-50 text-gray-900">Spanish</SelectItem>
                        <SelectItem value="French" className="rounded-lg hover:bg-gray-50 text-gray-900">French</SelectItem>
                        <SelectItem value="German" className="rounded-lg hover:bg-gray-50 text-gray-900">German</SelectItem>
                        <SelectItem value="Japanese" className="rounded-lg hover:bg-gray-50 text-gray-900">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Result Limit */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="limit" className="text-gray-700 font-medium">Result Limit: {limit}</Label>
                    </div>
                    <Slider
                      id="limit"
                      min={5}
                      max={100}
                      step={5}
                      value={[limit]}
                      onValueChange={(value) => setLimit(value[0])}
                      className="py-4"
                    />
                  </div>

                  {/* Submit Button */}
                  <motionFramer.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-2"
                  >
                    <Button 
                      onClick={handleSubmit} 
                      disabled={contextLoading || !isValid()}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-300 hover:from-blue-700 hover:to-blue-400 text-white font-medium shadow-sm transition-all hover:shadow-md"
                    >
                      {(contextLoading) ? (
                        <div className="flex items-center">
                          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                          Researching...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <SearchIcon className="mr-2 h-4 w-4" />
                          Run Research
                        </div>
                      )}
                    </Button>
                  </motionFramer.div>

                  {/* History Toggle Button */}
                  <motionFramer.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setShowHistoryModal(true)}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <History className="mr-2 h-4 w-4" />
                      View Search History
                    </Button>
                  </motionFramer.div>
                </CardContent>
              </Card>
            </motionFramer.div>

            {/* History Section */}
            {showHistoryModal && (
              <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="sm:max-w-[600px] rounded-[22px] border-gray-100 bg-white/90 backdrop-blur-xl p-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6">
                    <DialogTitle className="text-xl font-semibold text-white mb-2">Search History</DialogTitle>
                    <DialogDescription className="text-blue-100">
                      View and reuse your previous keyword research queries
                    </DialogDescription>
                  </div>
                  
                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isHistoryLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-10 w-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4"></div>
                        <p className="text-gray-500">Loading history...</p>
                      </div>
                    ) : searchHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <History className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-center">No search history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchHistory.map((result, index) => (
                          <motionFramer.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="group"
                          >
                            <Card className="overflow-hidden border border-gray-100 rounded-[18px] shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{getResearchModeName(result.mode)}</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {getQuerySummary(result)}
                                    </p>
                                    <div className="flex items-center mt-2 space-x-2">
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-100">
                                        {(result.data?.length || 0)} results
                                      </Badge>
                                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-100">
                                        {new Date(result.timestamp).toLocaleDateString()}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteHistory(index)}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        handleSelectHistoryItem(result);
                                        setShowHistoryModal(false);
                                      }}
                                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-8 w-8 p-0"
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motionFramer.div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 p-4 bg-gray-50/80 backdrop-blur-sm flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowHistoryModal(false)}
                      className="rounded-full px-4 border-gray-200 text-gray-700 hover:bg-gray-100"
                    >
                      Close
                    </Button>
                    {searchHistory.length > 0 && (
                      <Button 
                        variant="destructive" 
                        onClick={clearHistory}
                        className="rounded-full px-4 ml-2 bg-red-500 hover:bg-red-600 text-white"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Right column: Results */}
          <div className="lg:col-span-2">
            <motionFramer.div
              ref={resultsRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              {renderResults()}
            </motionFramer.div>
          </div>
        </div>
      </div>
    </div>
  )
}