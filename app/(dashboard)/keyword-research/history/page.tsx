"use client"

import { useEffect, useState } from "react"
import { useKeywordResearch, KeywordResearchProvider } from "@/contexts/keyword-research-context"
import { KeywordResearchHistoryItem } from "@/components/keyword-research/keyword-research-history-item"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


export default function KeywordResearchHistoryPage() {
  return (
    <KeywordResearchProvider>
      <KeywordResearchHistoryContent />
    </KeywordResearchProvider>
  )
}

interface SearchResult {
  id?: string
  mode?: string
  timestamp?: string
  created_at?: string
  queryParams?: { [key: string]: any }
  data?: any[]
}

function KeywordResearchHistoryContent() {
  const { searchHistory, loadHistory, clearHistory, isHistoryLoading } = useKeywordResearch()
  const router = useRouter()
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load history on page load
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your keyword research history? This cannot be undone.")) {
      clearHistory()
      toast({
        title: "History Cleared",
        description: "Your keyword research history has been cleared successfully.",
      })
    }
  }

  const handleRefreshHistory = () => {
    loadHistory()
    toast({
      title: "History Refreshed",
      description: "Your keyword research history has been refreshed from the database.",
    })
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <PageHeader title="Keyword Research History" description="View your past keyword research results" />

      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard/keyword-research")}>
          Back to Keyword Research
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshHistory} disabled={isHistoryLoading}>
            {isHistoryLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={handleClearHistory} disabled={isHistoryLoading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </div>
      </div>

      {isHistoryLoading ? (
        <Card className="mb-6">
          <CardContent className="pt-6 pb-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Loading history...</span>
          </CardContent>
        </Card>
      ) : searchHistory.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-muted-foreground">No research history found.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => router.push("/dashboard/keyword-research")}
            >
              Start Keyword Research
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {searchHistory.map((result: SearchResult, index) => {
            // Get mode-specific styling
            const getModeColor = () => {
              switch (result.mode) {
                case "keyword_suggestions":
                  return "#3b82f6"; // blue-500
                case "keywords_for_site":
                  return "#10b981"; // emerald-500
                case "historical_search_volume":
                  return "#8b5cf6"; // violet-500
                case "bulk_keyword_difficulty":
                  return "#f43f5e"; // rose-500
                case "keyword_ideas":
                  return "#f59e0b"; // amber-500
                default:
                  return "#6b7280"; // gray-500
              }
            };
            
            // Get result count
            const getResultCount = () => {
              try {
                if (result.data && Array.isArray(result.data)) {
                  return result.data.length;
                }
                return 0;
              } catch (error) {
                return 0;
              }
            };
            
            // Format the date
            const formattedDate = isClient 
              ? formatDate(result.timestamp || result.created_at || "") 
              : "Loading date...";
              
            const color = getModeColor();
            const resultCount = getResultCount();
            
            // Safely get query parameters
            const getQueryParams = () => {
              try {
                if (result.queryParams && typeof result.queryParams === 'object') {
                  return Object.entries(result.queryParams)
                    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${String(value)}`)
                    .join(", ");
                }
                return "No parameters available";
              } catch (error) {
                return "No parameters available";
              }
            };
            
            // Get formatted mode title
            const getModeTitle = () => {
              try {
                if (result.mode && typeof result.mode === 'string') {
                  return result.mode.replace(/_/g, " ").split(" ").map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(" ");
                }
                return "Unknown Mode";
              } catch (error) {
                return "Unknown Mode";
              }
            };
            
            return (
              <div 
                key={result.id || index}
                className="rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors"
                style={{
                  borderLeft: `4px solid ${color}`,
                  boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)`
                }}
              >
                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                  <div 
                    className="font-semibold tracking-tight text-lg"
                    style={{ color }}
                  >
                    {getModeTitle()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formattedDate}
                  </div>
                </div>
                
                <div className="p-6 pt-0">
                  <p className="text-sm mb-2">
                    <span className="font-medium" style={{ color: `${color}CC` }}>
                      {getQueryParams()}
                    </span>
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                      {resultCount} results found
                    </span>
                  </p>
                  
                  <Button 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 w-full"
                    onClick={() => {
                      // Copy parameters and navigate to research page
                      if (result.queryParams && typeof result.queryParams === 'object') {
                        try {
                          const params = new URLSearchParams();
                          Object.entries(result.queryParams).forEach(([key, value]) => {
                            if (value !== undefined && value !== null && typeof value !== 'object') {
                              params.append(key, String(value));
                            }
                          });
                          router.push(`/dashboard/keyword-research?${params.toString()}`);
                        } catch (error) {
                          router.push("/dashboard/keyword-research");
                        }
                      } else {
                        router.push("/dashboard/keyword-research");
                      }
                    }}
                  >
                    <span>View Results</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
