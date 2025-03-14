"use client"

import { useState, useEffect, useMemo } from "react"
import { useKeywordResearch } from "@/contexts/keyword-research-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertTriangle, Download, BarChart, Search, History } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/api"
import { formatNumber } from "@/lib/utils"

// Helper function to flatten nested API responses
const flattenApiResponse = (data: any) => {
  console.log("Flattening API response:", typeof data, Array.isArray(data))
  
  // If data is already an array, check if it contains items property
  if (Array.isArray(data)) {
    console.log("Data is an array with", data.length, "items")
    
    // Check if the first item has an 'items' property (common for Keywords for Site)
    if (data.length > 0 && data[0] && data[0].items && Array.isArray(data[0].items)) {
      console.log("First item has items array with", data[0].items.length, "items")
      return data[0].items
    }
    
    return data
  }
  
  // If data is an object with tasks property
  if (data && data.tasks && Array.isArray(data.tasks)) {
    console.log("Data has tasks array with", data.tasks.length, "tasks")
    
    // Flatten all tasks and their results
    const flattenedData = data.tasks.flatMap((task: any) => {
      // First check if task.result[0] has items property (for Keywords for Site mode)
      if (task.result && Array.isArray(task.result) && task.result.length > 0 && task.result[0].items) {
        console.log("Task has result[0].items array with", task.result[0].items.length, "items")
        return task.result[0].items
      }
      // Then check if task.result has items property (for Keywords for Site mode)
      else if (task.result && task.result.items && Array.isArray(task.result.items)) {
        console.log("Task has result.items array with", task.result.items.length, "items")
        return task.result.items
      }
      // Then check if task.result is an array
      else if (task.result && Array.isArray(task.result)) {
        console.log("Task has result array with", task.result.length, "items")
        return task.result
      }
      // If neither, return empty array
      return []
    })
    
    console.log("Flattened data has", flattenedData.length, "items")
    return flattenedData
  }
  
  // If data is not in expected format, return empty array
  console.log("Data is not in expected format, returning empty array")
  return []
}

export function KeywordResearchResults() {
  const { results, isLoading, error, clearResults } = useKeywordResearch()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("table")
  const [tableData, setTableData] = useState<any[]>([])
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const router = useRouter()

  // Process results when they change
  useEffect(() => {
    if (!results) return

    console.log("Processing results:", JSON.stringify(results, null, 2))
    
    try {
      // Extract data from results
      const { data, mode } = results

      console.log("Raw data before flattening:", JSON.stringify(data, null, 2))
      
      // Flatten the API response to get a consistent array of items
      let flattenedData = flattenApiResponse(data)
      console.log(`Flattened data (${flattenedData.length} items):`, JSON.stringify(flattenedData.slice(0, 3), null, 2))
      
      // Process the data to normalize field names and structure
      const processedData = flattenedData.map((item: any) => {
        // Create a normalized item with common fields
        const normalizedItem: any = {}

        // Extract basic fields
        normalizedItem.keyword = item.keyword || ""

        // For Keywords for Site mode, the data structure is different
        if (mode === "keywords_for_site") {
          console.log("Processing Keywords for Site item:", JSON.stringify(item, null, 2))
          
          // Extract position (rank) from the item
          normalizedItem.position = item.position || 0
          
          // DIRECT FIX: Force use keyword_properties.keyword_difficulty for SEO difficulty
          if (item.keyword_properties && typeof item.keyword_properties.keyword_difficulty === 'number') {
            normalizedItem.keyword_difficulty = item.keyword_properties.keyword_difficulty
            console.log(`FORCED: Using keyword_properties.keyword_difficulty: ${normalizedItem.keyword_difficulty}`)
          } else if (item.keyword_info && typeof item.keyword_info.keyword_difficulty === 'number') {
            normalizedItem.keyword_difficulty = item.keyword_info.keyword_difficulty
            console.log(`FORCED: Using keyword_info.keyword_difficulty: ${normalizedItem.keyword_difficulty}`)
          } else if (item.keyword_info && typeof item.keyword_info.search_volume !== 'undefined') {
            // If we have keyword_info with search volume but no difficulty, use a calculated value
            normalizedItem.keyword_difficulty = Math.round(item.keyword_info.search_volume / 100)
            console.log(`FORCED: Calculated difficulty from search volume: ${normalizedItem.keyword_difficulty}`)
          } else {
            // Last resort
            normalizedItem.keyword_difficulty = 50 // Medium difficulty as default
            console.log(`FORCED: Using default medium difficulty: ${normalizedItem.keyword_difficulty}`)
          }
          
          // DIRECT FIX: Force extract search volume from keyword_info
          if (item.keyword_info && typeof item.keyword_info.search_volume !== 'undefined') {
            normalizedItem.search_volume = item.keyword_info.search_volume
            console.log(`FORCED: Using keyword_info.search_volume: ${normalizedItem.search_volume}`)
          }
          
          // DIRECT FIX: Force extract competition data from keyword_info
          if (item.keyword_info) {
            normalizedItem.competition = item.keyword_info.competition || "N/A"
            normalizedItem.competition_level = item.keyword_info.competition_level || "N/A"
            normalizedItem.cpc = item.keyword_info.cpc || "N/A"
            console.log(`FORCED: Using keyword_info competition data: ${normalizedItem.competition_level}`)
          }
          
          // Extract traffic (estimated visits)
          normalizedItem.traffic = item.traffic || item.etv || 0
          
          // Extract URL
          normalizedItem.url = item.url || "N/A"
          
          // Log the normalized item for debugging
          console.log("Normalized Keywords for Site item:", normalizedItem)
        }
        // For other modes, extract fields from keyword_info if available
        else if (item.keyword_info) {
          normalizedItem.search_volume = item.keyword_info.search_volume || 0
          normalizedItem.keyword_difficulty = item.keyword_info.keyword_difficulty || 0
          normalizedItem.cpc = item.keyword_info.cpc || 0
          normalizedItem.competition = item.keyword_info.competition || 0
          normalizedItem.competition_level = item.keyword_info.competition_level || ""
        }
        
        // Copy any other fields from the original item that we didn't explicitly extract
        Object.keys(item).forEach(key => {
          if (key !== "keyword_info" && normalizedItem[key] === undefined) {
            normalizedItem[key] = item[key]
          }
        })

        // Log the normalized item for debugging
        if (processedData.length === 0) {
          console.log("Normalized item:", normalizedItem)
        }

        return normalizedItem
      })

      // Log normalized data
      console.log("Normalized data sample:", JSON.stringify(processedData[0], null, 2))

      // Set the table data
      setTableData(processedData)

      // Determine columns based on the first item
      if (processedData.length > 0) {
        const firstItem = processedData[0]
        const columnKeys = Object.keys(firstItem).filter(
          (key) => key !== "categories" && key !== "trend" && key !== "months" && 
                  key !== "keyword_data" && key !== "tasks" && key !== "result"
        )

        // Create column definitions
        const columnDefs = columnKeys.map((key) => ({
          key,
          label: key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        }))

        // Log column definitions
        console.log("Column definitions:", columnDefs)

        setColumns(columnDefs)
      }

      // Prepare chart data if trend data is available
      if (processedData.length > 0) {
        // Check if the data has trend information
        if (mode === "historical_search_volume" && processedData[0].months) {
          const chartData = processedData[0].months.map((item: any) => ({
            name: `${item.year}-${item.month}`,
            volume: item.search_volume,
          }))
          setChartData(chartData)
        } 
        // Handle trend data from database format
        else if (processedData[0].trend && Array.isArray(processedData[0].trend)) {
          const chartData = processedData[0].trend.map((item: any) => ({
            name: `${item.year}-${item.month}`,
            volume: item.search_volume,
          }))
          setChartData(chartData)
        }
      }
    } catch (error) {
      console.error("Error processing results:", error)
    }
  }, [results])

  // Helper functions
  const getDifficultyLevel = (score: number): string => {
    if (score >= 80) return "VERY HIGH";
    if (score >= 60) return "HIGH";
    if (score >= 40) return "MEDIUM";
    if (score >= 20) return "LOW";
    return "VERY LOW";
  }

  const getTrendDirection = (trend: number[]): string => {
    if (!trend || trend.length < 2) return "STABLE";
    
    const first = trend[0];
    const last = trend[trend.length - 1];
    
    if (last > first * 1.1) return "UP";
    if (last < first * 0.9) return "DOWN";
    return "STABLE";
  }

  // Helper function to render cell content with appropriate formatting
  const renderCellContent = (key: string, value: any) => {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground">N/A</span>
    }
    
    if (key === "keyword") {
      return value
    } else if (key === "search_volume") {
      return formatNumber(value || 0)
    } else if (key === "keyword_difficulty") {
      // Determine difficulty level and color
      const difficultyValue = typeof value === 'number' ? value : 0;
      const difficultyLevel = getDifficultyLevel(difficultyValue);
      
      const color =
        difficultyValue >= 80
          ? "bg-red-100 text-red-800"
          : difficultyValue >= 60
          ? "bg-orange-100 text-orange-800"
          : difficultyValue >= 40
          ? "bg-yellow-100 text-yellow-800"
          : difficultyValue >= 20
          ? "bg-blue-100 text-blue-800"
          : "bg-green-100 text-green-800"
      
      return (
        <div className="flex flex-col items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {difficultyValue === 0 ? "Very Easy" : difficultyLevel}
          </span>
        </div>
      )
    } else if (key === "competition") {
      if (value === "N/A") return <span className="text-muted-foreground">N/A</span>;
      
      const competitionValue = typeof value === 'number' ? value : 0;
      const color =
        competitionValue >= 0.66
          ? "bg-red-100 text-red-800"
          : competitionValue >= 0.33
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800"
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {Math.round(competitionValue * 100)}%
        </span>
      )
    } else if (key === "competition_level") {
      if (value === "N/A") return <span className="text-muted-foreground">N/A</span>;
      return <span className="capitalize">{value?.toLowerCase()}</span>
    } else if (key === "difficulty_level") {
      return <span className="capitalize">{value?.toLowerCase()}</span>
    } else if (key === "cpc") {
      if (value === "N/A") return <span className="text-muted-foreground">N/A</span>;
      return `$${(value || 0).toFixed(2)}`
    } else if (key === "position") {
      if (value === 0) return <span className="text-muted-foreground">N/A</span>;
      
      const color = value <= 3 ? "bg-green-100 text-green-800" : value <= 10 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {value}
        </span>
      )
    } else if (key === "url") {
      if (value === "N/A") return <span className="text-muted-foreground">N/A</span>;
      
      return (
        <a
          href={value.startsWith('http') ? value : `https://${value}`}
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
    } else {
      return value
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-lg font-medium">Researching keywords...</p>
          <p className="text-sm text-muted-foreground">This may take a moment</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-lg font-medium">Error researching keywords</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={clearResults}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-[400px]">
          <Search className="h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No results yet</p>
          <p className="text-sm text-muted-foreground">Use the form on the left to run keyword research</p>
        </CardContent>
      </Card>
    )
  }

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!tableData.length) return []

    if (!searchQuery) return tableData

    return tableData.filter((item) => {
      // Search across all string and number fields
      return Object.entries(item).some(([key, value]) => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchQuery.toLowerCase())
        }
        if (typeof value === "number") {
          return value.toString().includes(searchQuery)
        }
        return false
      })
    })
  }, [tableData, searchQuery])

  // Log filtered data when it changes
  useEffect(() => {
    console.log("Filtered data count:", filteredData.length)
    if (filteredData.length > 0) {
      console.log("First filtered item:", filteredData[0])
      console.log("Available columns:", columns.map(col => col.key))
    }
  }, [filteredData, columns])

  // Function to export data as CSV
  const exportToCsv = () => {
    if (!results || !tableData.length) return;

    // Create CSV content based on mode
    let csvContent = "";
    const mode = results.mode as string;

    switch (mode) {
      case "keywords_for_site":
        csvContent = "Keyword,Position,Search Volume,Traffic,Traffic Cost,CPC,URL\n";
        tableData.forEach((item) => {
          csvContent += `"${item.keyword}",${item.position},${item.search_volume},${item.traffic},${
            item.traffic_cost
          },${item.cpc},"${item.url}"\n`;
        });
        break;
      case "historical_search_volume":
        csvContent = "Keyword,Search Volume,Last 12 Months\n";
        tableData.forEach((item) => {
          let historicalData = "";
          if (item.months && Array.isArray(item.months)) {
            historicalData = item.months
              .map((m: any) => `${m.year}-${m.month}: ${m.search_volume}`)
              .join("; ");
          }
          csvContent += `"${item.keyword}",${item.search_volume},"${historicalData}"\n`;
        });
        break;
      default:
        // Default format for most research types
        csvContent = "Keyword,Search Volume,CPC,Competition,Difficulty\n";
        tableData.forEach((item) => {
          csvContent += `"${item.keyword}",${item.search_volume},${item.cpc},${item.competition},${
            item.keyword_difficulty
          }\n`;
        });
    }

    // Create a download link using client-side utility
    import('@/lib/client-utils').then(({ downloadFile }) => {
      downloadFile(
        csvContent,
        `keyword-research-${mode}-${new Date().toISOString().slice(0, 10)}.csv`,
        'text/csv;charset=utf-8;'
      );
    });
  }

  // Get title based on mode
  const getTitle = () => {
    if (!results) return "Keyword Research Results";

    const mode = results.mode;
    switch (mode) {
      case "keyword_suggestions":
        return "Keyword Suggestions";
      case "keywords_for_site":
        return "Keywords for Site";
      case "keywords_for_categories":
        return "Keywords for Categories";
      case "historical_search_volume":
        return "Historical Search Volume";
      case "bulk_keyword_difficulty":
        return "Keyword Difficulty";
      case "keyword_ideas":
        return "Keyword Ideas";
      case "keyword_trends":
        return "Keyword Trends";
      case "serp_competitors":
        return "SERP Competitors";
      case "search_intent":
        return "Search Intent";
      default:
        return "Research Results";
    }
  };

  const hasChartData = chartData.length > 0
  const hasSearchIntent = results.mode === "search_intent" && filteredData.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getTitle()}</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/keyword-research/history")}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => clearResults()}
            >
              Clear Results
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {(hasChartData || hasSearchIntent) && (
          <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="w-full">
              <TabsTrigger value="table" className="flex-1">
                Table
              </TabsTrigger>
              <TabsTrigger value="chart" disabled={!hasChartData && !hasSearchIntent} className="flex-1">
                <BarChart className="h-4 w-4 mr-2" />
                Visualization
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {activeTab === "table" ? (
          filteredData.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="h-[500px] w-full">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column.key}>{column.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item, index) => {
                        // Log each row's data for debugging
                        console.log(`Row ${index} data:`, item)
                        return (
                          <TableRow key={index}>
                            {columns.map((column) => {
                              const cellValue = item[column.key]
                              // Log each cell's value for debugging
                              console.log(`Cell ${column.key}:`, cellValue)
                              return (
                                <TableCell key={column.key}>{renderCellContent(column.key, cellValue)}</TableCell>
                              )
                            })}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search query or run a new research</p>
            </div>
          )
        ) : (
          <div className="h-[500px]">
            {results.mode === "historical_search_volume" && chartData.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Monthly Search Volume Trend</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const [year, month] = value.split("-")
                          return `${month}/${year.substring(2)}`
                        }}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value.toLocaleString()} searches`, "Volume"]}
                        labelFormatter={(label) => {
                          const [year, month] = label.split("-")
                          const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
                          return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Search Volume"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Average Volume</p>
                        <p className="text-2xl font-bold">{filteredData[0]?.avg_search_volume.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Highest Volume</p>
                        <p className="text-2xl font-bold">{filteredData[0]?.highest_volume.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Lowest Volume</p>
                        <p className="text-2xl font-bold">{filteredData[0]?.lowest_volume.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <BarChart className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No visualization available</p>
                <p className="text-sm text-muted-foreground">
                  This data type doesn't have a visualization or no data is available
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {activeTab === "chart" && chartData.length > 0 && (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => formatNumber(value)}
                width={80}
              />
              <Tooltip 
                formatter={(value: any) => [formatNumber(value), "Search Volume"]}
                labelFormatter={(label) => {
                  const [year, month] = label.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
                }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

export default KeywordResearchResults
