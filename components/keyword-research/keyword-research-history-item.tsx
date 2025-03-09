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
    
    // Helper function to flatten nested API responses
    const flattenApiResponse = (data: any): any[] => {
      console.log("KeywordResearchHistoryItem - Original data structure:", data)
      
      // Check if data is already an array
      if (Array.isArray(data)) {
        return data;
      }

      // Check if data has a result property that is an array
      if (data && data.result && Array.isArray(data.result)) {
        return data.result;
      }
      
      // Check if data has a tasks property that contains result arrays
      if (data && data.tasks && Array.isArray(data.tasks)) {
        // Flatten tasks data
        return data.tasks.flatMap((task: any) => {
          if (task.result && Array.isArray(task.result)) {
            return task.result;
          } else if (task.result && task.result.items && Array.isArray(task.result.items)) {
            // Some DataForSEO endpoints nest items under result
            return task.result.items;
          }
          return [];
        });
      }

      // If we can't find an array, return an empty array
      return [];
    }
    
    // Ensure data is an array
    const data = flattenApiResponse(result.data)
    console.log("KeywordResearchHistoryItem - Flattened data:", data)
    
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

  const tableData = processData()
  const chartDataProcessed = processChartData()

  // Determine columns based on the first item
  const getColumns = () => {
    if (tableData.length === 0) return []
    
    const firstItem = tableData[0]
    console.log("KeywordResearchHistoryItem - First item for columns:", firstItem)
    
    const columnKeys = Object.keys(firstItem).filter(
      (key) => key !== "categories" && key !== "trend" && key !== "months" && 
              key !== "keyword_data" && key !== "tasks" && key !== "result" &&
              key !== "competition_level" // Remove competition_level to avoid duplication
    )
    
    console.log("KeywordResearchHistoryItem - Column keys:", columnKeys)
    return columnKeys
  }

  const columns = getColumns()
  console.log("KeywordResearchHistoryItem - Final columns:", columns)

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
                  {tableData.length} {tableData.length === 1 ? 'result' : 'results'} found
                </div>
                {/* Add export button or other controls here if needed */}
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-350px)] w-full">
              <div className="relative overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead 
                          key={column} 
                          className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 px-4 py-3 text-left first:pl-6"
                        >
                          {formatColumnName(column)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.length > 0 ? (
                      tableData.map((item, index) => (
                        <TableRow 
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          {columns.map((column) => (
                            <TableCell 
                              key={`${index}-${column}`}
                              className="px-4 py-3 first:pl-6 border-b border-gray-100 dark:border-gray-700"
                            >
                              {renderCellContent(column, item[column])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell 
                          colSpan={columns.length || 1} 
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
