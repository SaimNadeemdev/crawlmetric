"use client"

import { useState, useEffect } from "react"
import { useKeywordResearch } from "@/contexts/keyword-research-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { formatNumber } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { KeywordResearchResults } from "@/types/keyword-research"
import { ArrowLeft, Clock } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { getColumns } from "./columns"
import { Search, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

interface KeywordResearchHistoryItemProps {
  result: KeywordResearchResults
  onBack: () => void
}

export function KeywordResearchHistoryItem({ result, onBack }: KeywordResearchHistoryItemProps) {
  const [activeTab, setActiveTab] = useState("table")
  const [chartData, setChartData] = useState<any[]>([])

  // Log the result data when component mounts
  useEffect(() => {
    console.log("KeywordResearchHistoryItem - Result:", result)
    console.log("KeywordResearchHistoryItem - Result data:", result.data)
    
    // Process chart data on mount
    const chartData = processChartData()
    setChartData(chartData)
    console.log("KeywordResearchHistoryItem - Chart data:", chartData)
  }, [result])

  // Process the data for display
  const processData = () => {
    if (!result || !result.data) {
      console.log("KeywordResearchHistoryItem - No result data")
      return []
    }
    
    console.log("KeywordResearchHistoryItem - FULL RESULT:", JSON.stringify(result, null, 2));
    
    // Helper function to flatten nested API responses
    const flattenApiResponse = (data: any): any[] => {
      console.log("KeywordResearchHistoryItem - Original data structure:", JSON.stringify(data, null, 2));
      
      // Check if data is already an array
      if (Array.isArray(data)) {
        console.log("KeywordResearchHistoryItem - Data is already an array with", data.length, "items");
        return data;
      }

      // Check if data has a result property that is an array
      if (data && data.result && Array.isArray(data.result)) {
        console.log("KeywordResearchHistoryItem - Found result array with", data.result.length, "items");
        return data.result;
      }
      
      // Check if data has a tasks property that contains result arrays
      if (data && data.tasks && Array.isArray(data.tasks)) {
        console.log("KeywordResearchHistoryItem - Found tasks array with", data.tasks.length, "items");
        // Flatten tasks data
        const flattenedData = data.tasks.flatMap((task: any) => {
          if (task.result && Array.isArray(task.result)) {
            return task.result;
          } else if (task.result && task.result.items && Array.isArray(task.result.items)) {
            // Some DataForSEO endpoints nest items under result
            return task.result.items;
          }
          return [];
        });
        console.log("KeywordResearchHistoryItem - Flattened tasks data:", flattenedData.length, "items");
        return flattenedData;
      }

      // If we can't find an array, return an empty array
      console.log("KeywordResearchHistoryItem - Could not find array structure, returning empty array");
      return [];
    }
    
    // Ensure data is an array
    const data = flattenApiResponse(result.data);
    console.log("KeywordResearchHistoryItem - Flattened data:", data.length, "items");
    if (data.length > 0) {
      console.log("KeywordResearchHistoryItem - First item in flattened data:", JSON.stringify(data[0], null, 2));
    }
    
    // SPECIAL HANDLING FOR HISTORICAL DATA - ROBUST VERSION
    if (result.mode === "historical_search_volume") {
      console.log("KeywordResearchHistoryItem - SPECIAL HANDLING for historical search volume");
      console.log("KeywordResearchHistoryItem - Original data structure:", JSON.stringify(data, null, 2));
      const expandedData: any[] = [];
      
      // Process each item in the data array
      data.forEach((item, index) => {
        console.log(`KeywordResearchHistoryItem - Processing item ${index}:`, JSON.stringify(item, null, 2));
        
        // Extract the keyword
        const keyword = item.keyword || "";
        
        // Extract months from different possible locations in the data structure
        let months = [];
        if (item.months && Array.isArray(item.months)) {
          console.log(`KeywordResearchHistoryItem - Found months array in item ${index} with ${item.months.length} entries`);
          months = item.months;
        } else if (item.keyword_data && item.keyword_data.keyword_info && 
                  item.keyword_data.keyword_info.monthly_searches && 
                  Array.isArray(item.keyword_data.keyword_info.monthly_searches)) {
          console.log(`KeywordResearchHistoryItem - Found monthly_searches array in item ${index} with ${item.keyword_data.keyword_info.monthly_searches.length} entries`);
          months = item.keyword_data.keyword_info.monthly_searches;
        }
        
        console.log(`KeywordResearchHistoryItem - Extracted months for item ${index}:`, JSON.stringify(months, null, 2));
        
        if (months.length > 0) {
          // Sort months by year and month (newest first)
          const sortedMonths = [...months].sort((a: any, b: any) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          });
          
          console.log(`KeywordResearchHistoryItem - Sorted months for item ${index}:`, JSON.stringify(sortedMonths, null, 2));
          
          // Create one row per month
          sortedMonths.forEach((month, monthIndex) => {
            // Create a new object for each month instead of copying the entire item
            const expandedItem = {
              keyword: keyword,
              year: month.year,
              month: month.month,
              monthName: getMonthName(month.month),
              search_volume: month.search_volume || 0,
              cpc: item.cpc || (item.keyword_data?.keyword_info?.cpc) || 0,
              competition: item.competition || (item.keyword_data?.keyword_info?.competition) || 0,
              competition_level: item.competition_level || (item.keyword_data?.keyword_info?.competition_level) || "",
              keyword_difficulty: item.keyword_difficulty || (item.keyword_data?.keyword_info?.keyword_difficulty) || 0,
              yearMonth: `${month.year}-${month.month.toString().padStart(2, '0')}`
            };
            
            console.log(`KeywordResearchHistoryItem - Created expanded item for month ${monthIndex}:`, JSON.stringify(expandedItem, null, 2));
            
            expandedData.push(expandedItem);
          });
        } else {
          // If no months data, just add the item as is
          console.log(`KeywordResearchHistoryItem - No months data for item ${index}, using as is`);
          expandedData.push(item);
        }
      });
      
      console.log("KeywordResearchHistoryItem - Final historical data has", expandedData.length, "items");
      console.log("KeywordResearchHistoryItem - Sample of expanded data (first 3 items):", 
        JSON.stringify(expandedData.slice(0, 3), null, 2));
      return expandedData;
    }
    
    // For keyword ideas, normalize the data structure
    if (result.mode === "keyword_ideas" && data.length > 0) {
      console.log("KeywordResearchHistoryItem - Processing keyword ideas data");
      
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
      
      console.log("KeywordResearchHistoryItem - Normalized keyword ideas data:", normalizedData.length, "items");
      return normalizedData;
    }
    
    // Normalize data structure for consistency
    const normalizedData = data.map((item: any) => {
      // Make a copy of the item to avoid mutating the original
      const normalizedItem = { ...item }
      
      // Handle nested difficulty field if present
      if (item.difficulty && typeof item.difficulty === 'number' && !normalizedItem.keyword_difficulty) {
        normalizedItem.keyword_difficulty = item.difficulty
      }
      
      // Handle seo_difficulty field if present
      if (item.seo_difficulty && typeof item.seo_difficulty === 'number' && !normalizedItem.keyword_difficulty) {
        normalizedItem.keyword_difficulty = item.seo_difficulty
      }
      
      // Handle DataForSEO's nested structure for keyword difficulty
      if (item.keyword_data && item.keyword_data.keyword_info && 
          item.keyword_data.keyword_info.keyword_difficulty && 
          !normalizedItem.keyword_difficulty) {
        normalizedItem.keyword_difficulty = item.keyword_data.keyword_info.keyword_difficulty
      }
      
      // Handle DataForSEO's nested structure for search volume
      if (item.keyword_data && item.keyword_data.keyword_info && 
          item.keyword_data.keyword_info.search_volume && 
          !normalizedItem.search_volume) {
        normalizedItem.search_volume = item.keyword_data.keyword_info.search_volume
      }
      
      // Handle DataForSEO's nested structure for CPC
      if (item.keyword_data && item.keyword_data.keyword_info && 
          item.keyword_data.keyword_info.cpc && 
          !normalizedItem.cpc) {
        normalizedItem.cpc = item.keyword_data.keyword_info.cpc
      }
      
      // Handle DataForSEO's nested structure for competition
      if (item.keyword_data && item.keyword_data.keyword_info && 
          item.keyword_data.keyword_info.competition && 
          !normalizedItem.competition) {
        normalizedItem.competition = item.keyword_data.keyword_info.competition
      }
      
      // Convert competition_level to competition if needed
      if (item.competition_level && !normalizedItem.competition) {
        if (item.competition_level === 'HIGH' || item.competition_level === 'High') {
          normalizedItem.competition = 0.8;
        } else if (item.competition_level === 'MEDIUM' || item.competition_level === 'Medium') {
          normalizedItem.competition = 0.5;
        } else if (item.competition_level === 'LOW' || item.competition_level === 'Low') {
          normalizedItem.competition = 0.2;
        }
        
        // Remove the competition_level field to avoid duplication
        delete normalizedItem.competition_level;
      }
      
      return normalizedItem
    })
    
    console.log("KeywordResearchHistoryItem - Normalized data:", normalizedData)
    return normalizedData
  }

  // Process chart data if available
  const processChartData = () => {
    if (!result || !result.data) return []
    
    const data = processData().flatMap((item: any) => item);
    
    if (data.length === 0) return []
    
    // Check for trend data in the first item
    const firstItem = data[0]
    
    if (firstItem.trend && Array.isArray(firstItem.trend)) {
      return firstItem.trend.map((item: any) => ({
        name: `${item.year}-${item.month}`,
        volume: item.search_volume,
      }))
    }
    
    // Check for months data (historical search volume)
    if (firstItem.months && Array.isArray(firstItem.months)) {
      return firstItem.months.map((item: any) => ({
        name: `${item.year}-${item.month}`,
        volume: item.search_volume,
      }))
    }
    
    return []
  }

  // Get mode title
  const getModeTitle = (mode: string) => {
    switch (mode) {
      case "keyword_suggestions":
        return "Keyword Suggestions"
      case "keywords_for_site":
        return "Keywords for Site"
      case "historical_search_volume":
        return "Historical Search Volume"
      case "bulk_keyword_difficulty":
        return "Keyword Difficulty"
      case "keyword_ideas":
        return "Keyword Ideas"
      default:
        return "Research Results"
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

  // Helper function to get difficulty color
  const getDifficultyColor = (score: number): string => {
    if (score >= 80) return "bg-red-500"
    if (score >= 60) return "bg-orange-500"
    if (score >= 40) return "bg-yellow-500"
    if (score >= 20) return "bg-green-500"
    return "bg-emerald-500"
  }

  // Helper function to get competition color
  const getCompetitionColor = (score: number): string => {
    if (score >= 0.7) return "bg-red-500"
    if (score >= 0.4) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Helper function to render cell content with appropriate formatting
  const renderCellContent = (key: string, value: any) => {
    if (key === "keyword") {
      return value
    } else if (key === "search_volume") {
      return formatNumber(value || 0)
    } else if (key === "keyword_difficulty") {
      if (value === undefined || value === null) return "N/A"
      
      const color = getDifficultyColor(value)
      
      return (
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[140px] h-4 bg-muted rounded-md overflow-hidden">
            <div 
              className={cn(
                "absolute left-0 top-0 h-full rounded-md animate-progress", 
                color
              )}
              style={{ 
                width: `${value}%`,
                animation: "progress 1s ease-in-out"
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              {Math.round(value)}
            </div>
          </div>
        </div>
      )
    } else if (key === "competition") {
      if (value === undefined || value === null) return "N/A"
      
      const color = getCompetitionColor(value)
      
      return (
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[140px] h-4 bg-muted rounded-md overflow-hidden">
            <div 
              className={cn(
                "absolute left-0 top-0 h-full rounded-md animate-progress", 
                color
              )}
              style={{ 
                width: `${value * 100}%`,
                animation: "progress 1s ease-in-out"
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              {Math.round(value * 100)}
            </div>
          </div>
        </div>
      )
    } else if (key === "cpc") {
      return `$${(value || 0).toFixed(2)}`
    } else if (key === "position") {
      const color = value <= 3 ? "bg-green-100 text-green-800" : value <= 10 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {value}
        </span>
      )
    } else if (key === "url") {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline truncate block max-w-xs"
        >
          {value}
        </a>
      )
    } else if (key === "traffic" || key === "traffic_cost") {
      return formatNumber(value || 0)
    } else if (typeof value === "number") {
      return value.toLocaleString()
    }
    return value
  }

  // Get the actual data to display in the table
  const tableData = processData();
  console.log("KeywordResearchHistoryItem - Table data:", tableData);
  console.log("KeywordResearchHistoryItem - Table data structure:", JSON.stringify(tableData, null, 2));
  console.log("KeywordResearchHistoryItem - Is table data an array?", Array.isArray(tableData));
  if (Array.isArray(tableData) && tableData.length > 0) {
    console.log("KeywordResearchHistoryItem - First table data item:", JSON.stringify(tableData[0], null, 2));
    console.log("KeywordResearchHistoryItem - Number of table data items:", tableData.length);
    console.log("KeywordResearchHistoryItem - Table data columns:", Object.keys(tableData[0]));
  }

  // Chart data for visualization
  const chartDataProcessed = processChartData();
  console.log("KeywordResearchHistoryItem - Chart data:", chartDataProcessed);
  
  // Filter results based on search query
  const [searchFilter, setSearchFilter] = useState("");
  
  const filteredTableData = searchFilter
    ? tableData.filter((item) => item.keyword?.toLowerCase().includes(searchFilter.toLowerCase()))
    : tableData;

  // Use the imported getColumns function from columns.tsx
  console.log("KeywordResearchHistoryItem - Using imported getColumns with mode:", result.mode);
  const columns = getColumns(filteredTableData, result.mode)
  console.log("KeywordResearchHistoryItem - Final columns:", columns)

  // Format column names for display
  const formatColumnName = (column: string) => {
    switch (column) {
      case "keyword_difficulty":
        return "Difficulty"
      case "search_volume":
        return "Search Volume"
      case "competition":
        return "Competition"
      case "cpc":
        return "CPC"
      default:
        return column
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
    }
  }

  // Export data to CSV
  const exportToCsv = (data: any[]) => {
    if (!data || data.length === 0) return;
    
    // Get headers from first item
    const headers = Object.keys(data[0]).filter(key => 
      key !== 'keyword_data' && 
      key !== 'months' && 
      key !== 'tasks' && 
      key !== 'result'
    );
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add rows
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        // Handle strings with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value !== undefined && value !== null ? value : '';
      });
      csvContent += row.join(',') + '\n';
    });
    
    // Use client-side utility for downloading
    import('@/utils/client-utils').then(({ downloadFile }) => {
      downloadFile(
        csvContent,
        `keyword-research-${result.mode}-${new Date().toISOString().slice(0, 10)}.csv`,
        'text/csv;charset=utf-8;'
      );
    });
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white dark:bg-gray-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pb-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-white/20" 
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-xl font-bold">{getModeTitle(result.mode)}</CardTitle>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>
        
        <CardDescription className="text-white/80 mt-2">
          {result.created_at && (
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {format(new Date(result.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </span>
          )}
        </CardDescription>
        
        {/* Query parameters summary */}
        <div className="mt-4 bg-white/10 rounded-lg p-3 text-sm">
          <div className="font-medium mb-1">Search Parameters</div>
          <div className="text-white/90">
            {(() => {
              try {
                const params = result.queryParams || result.query_params;
                if (!params) return "No parameters available";
                
                switch (result.mode) {
                  case "keyword_suggestions":
                  case "keyword_ideas":
                    return params.keyword 
                      ? `Keyword: ${params.keyword}`
                      : "No keyword specified";
                  case "keywords_for_site":
                    return params.target 
                      ? `Domain: ${params.target}`
                      : "No domain specified";
                  case "historical_search_volume":
                  case "bulk_keyword_difficulty":
                    if (params.keywords && params.keywords.length > 0) {
                      return `Keywords: ${params.keywords.join(", ")}`;
                    }
                    return "No keywords specified";
                  default:
                    return JSON.stringify(params);
                }
              } catch (error) {
                console.error("Error displaying parameters:", error);
                return "Error displaying parameters";
              }
            })()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4">
            <TabsList className="h-12 bg-transparent border-b-0 p-0">
              <TabsTrigger 
                value="table" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-none h-12 px-4"
              >
                Table View
              </TabsTrigger>
              {chartDataProcessed.length > 0 && (
                <TabsTrigger 
                  value="chart" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-none h-12 px-4"
                >
                  Chart View
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="table" className="m-0">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredTableData.length} {filteredTableData.length === 1 ? 'result' : 'results'} found
                </div>
                {/* Add export button or other controls here if needed */}
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-350px)] w-full">
              <div className="relative overflow-x-auto">
                <div className="flex items-center justify-between mb-4 px-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredTableData.length} {filteredTableData.length === 1 ? 'result' : 'results'} found
                  </div>
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
                      onClick={() => exportToCsv(filteredTableData)}
                      className="ios-button border-0"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <DataTable columns={columns} data={filteredTableData} />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="chart" className="m-0 p-6">
            {chartDataProcessed.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartDataProcessed}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#6b7280' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6, fill: '#2563eb' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                No chart data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>
        
        {/* Add additional action buttons here if needed */}
      </CardFooter>
    </Card>
  )
}
