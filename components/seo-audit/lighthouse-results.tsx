"use client"

import { useEffect, useState } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, AlertTriangle, CheckCircle2, Info, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface LighthouseResultsProps {
  taskId: string
}

interface CategoryResult {
  title: string
  id: string
  score: number
  description?: string
}

interface AuditResult {
  id: string
  title: string
  description: string
  score: number | null
  scoreDisplayMode: string
  displayValue?: string
  details?: any
}

export function LighthouseResults({ taskId }: LighthouseResultsProps) {
  const { getLighthouseResults, lighthouseAuditLoading, lighthouseAuditError } = useSeoAudit()
  const [results, setResults] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("performance")
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(new Date())
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (!taskId || loading) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`Manually refreshing Lighthouse results for task ID: ${taskId}`);
      
      const data = await getLighthouseResults(taskId);
      console.log("Lighthouse results received");
      
      // Set the results in state
      setResults(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error refreshing Lighthouse results:", error);
      
      // Check if it's a 404 Not Found error
      if (error instanceof Error && error.message.includes("404")) {
        setError("The Lighthouse audit task was not found. It may have expired or been deleted. Please start a new audit.");
      } else {
        setError(error instanceof Error ? error.message : "An error occurred while refreshing results");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle debug panel
  const toggleDebugPanel = () => {
    const newDebugState = !showDebugPanel;
    setShowDebugPanel(newDebugState);
    
    if (newDebugState) {
      // When opening debug panel, stop auto-refreshing
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
        console.log('Auto-refresh paused for debug inspection');
      }
      setActiveTab("debug");
    } else {
      setActiveTab("performance");
    }
  };
  
  // Add a manual refresh interval when not in debug mode
  useEffect(() => {
    // Only set up auto-refresh if debug panel is closed
    if (!showDebugPanel && results && results.status === 'completed') {
      // Clear any existing interval
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
      
      // Set up a new interval with a much longer delay (30 seconds)
      const intervalId = setInterval(() => {
        if (!showDebugPanel) {
          console.log('Auto-refreshing Lighthouse results');
          handleManualRefresh();
        }
      }, 30000); // 30 seconds
      
      setPollingIntervalId(intervalId);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [showDebugPanel, results, taskId, handleManualRefresh]);

  useEffect(() => {
    // Reset state when taskId changes
    setResults(null);
    setLoading(true);
    setError(null);
    
    // Function to fetch results
    const fetchResults = async () => {
      if (!taskId) return;
      
      try {
        console.log(`Fetching Lighthouse results for task ID: ${taskId}`);
        
        const data = await getLighthouseResults(taskId);
        console.log('Received response:', data?.status || 'No status');
        
        if (data && data.status === 'completed' && data.data) {
          console.log('Lighthouse audit completed!');
          setResults(data.data);
        } else if (data && data.status === 'in_progress') {
          console.log('Lighthouse audit still in progress');
        } else {
          console.log('Waiting for Lighthouse audit to start processing');
        }
      } catch (err) {
        console.error('Error fetching Lighthouse results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Lighthouse results');
      } finally {
        setLoading(false);
        setLastRefreshed(new Date());
      }
    };
    
    // Start the initial fetch
    fetchResults();
  }, [taskId, getLighthouseResults])

  // Helper function to format score as percentage
  const formatScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "N/A"
    return `${Math.round(score * 100)}%`
  }

  // Helper function to get color based on score
  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "bg-gray-300"
    if (score >= 0.9) return "bg-green-500"
    if (score >= 0.5) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Helper function to get text color based on score
  const getTextColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "text-gray-500"
    if (score >= 0.9) return "text-green-700"
    if (score >= 0.5) return "text-yellow-700"
    return "text-red-700"
  }

  if (loading || lighthouseAuditLoading) {
    return (
      <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm transition-all duration-300 rounded-[22px]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Lighthouse Results
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={true}
              className="text-sm"
            >
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </Button>
          </div>
          <CardDescription>
            Retrieving audit data for your website...
            {lastRefreshed && (
              <div className="text-xs text-gray-400 mt-1">
                Last checked: {lastRefreshed.toLocaleTimeString()}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-md" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-[100px] w-full rounded-md" />
            <Skeleton className="h-[100px] w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || lighthouseAuditError) {
    return (
      <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm transition-all duration-300 rounded-[22px]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">Lighthouse Audit Results</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={loading}
              className="text-sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Results
            </Button>
          </div>
          {lastRefreshed && (
            <CardDescription>
              <div className="text-xs text-gray-400">
                Last checked: {lastRefreshed.toLocaleTimeString()}
              </div>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || lighthouseAuditError || "Failed to load Lighthouse results"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!results || !results.categories) {
    return (
      <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm transition-all duration-300 rounded-[22px]">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">Lighthouse Audit Results</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={loading}
              className="text-sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Results
            </Button>
          </div>
          {lastRefreshed && (
            <CardDescription>
              <div className="text-xs text-gray-400">
                Last checked: {lastRefreshed.toLocaleTimeString()}
              </div>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Results</AlertTitle>
            <AlertDescription>
              No Lighthouse audit results are available yet. The audit may still be processing or no data was returned.
              <div className="mt-2">
                <span className="text-sm text-gray-500">Click the refresh button to check for updates.</span>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Extract categories and audits from results
  const categories = results.categories || {} as Record<string, CategoryResult>
  const audits = (results.audits || {}) as Record<string, AuditResult>

  return (
    <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[22px]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Lighthouse Audit Results</CardTitle>
          <Button 
            variant="default" 
            size="lg"
            onClick={handleManualRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-md shadow-lg"
            style={{ fontSize: '16px' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                REFRESH RESULTS
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Analysis of {results.finalUrl || "your website"} {results.configSettings?.formFactor ? `on ${results.configSettings.formFactor}` : ""}
          {lastRefreshed && (
            <div className="text-xs text-gray-400 mt-1">
              Last checked: {lastRefreshed.toLocaleTimeString()}
            </div>
          )}
        </CardDescription>
        
        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          {Object.values(categories).map((category) => (
            <div key={(category as CategoryResult).id} className="flex flex-col items-center p-3 rounded-lg border">
              <div className="relative w-16 h-16 mb-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`font-bold text-lg ${getTextColor((category as CategoryResult).score)}`}>
                    {formatScore((category as CategoryResult).score)}
                  </span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    className="stroke-current text-gray-200" 
                    strokeWidth="3" 
                  />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    className={`stroke-current ${getScoreColor((category as CategoryResult).score)}`} 
                    strokeWidth="3" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - ((category as CategoryResult).score || 0) * 100} 
                    strokeLinecap="round" 
                    transform="rotate(-90 18 18)" 
                  />
                </svg>
              </div>
              <h3 className="font-medium text-sm text-center">{(category as CategoryResult).title}</h3>
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            {Object.values(categories).map((category) => (
              <TabsTrigger 
                key={(category as CategoryResult).id} 
                value={(category as CategoryResult).id}
                className="flex items-center gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${getScoreColor((category as CategoryResult).score)}`} />
                {(category as CategoryResult).title}
              </TabsTrigger>
            ))}
            <TabsTrigger 
              value="debug"
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              Debug
            </TabsTrigger>
          </TabsList>
          
          {Object.values(categories).map((category) => (
            <TabsContent key={(category as CategoryResult).id} value={(category as CategoryResult).id} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{(category as CategoryResult).title} Audits</h3>
                <p className="text-sm text-gray-500">{(category as CategoryResult).description}</p>
                
                <div className="space-y-4">
                  {Object.values(audits)
                    .filter((audit: AuditResult) => audit.id.startsWith((category as CategoryResult).id) || audit.id.includes((category as CategoryResult).id))
                    .map((audit: AuditResult) => (
                      <div key={audit.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{audit.title}</h4>
                          {audit.score !== null && (
                            <div className={`px-2 py-1 rounded text-xs font-medium ${getTextColor(audit.score)}`}>
                              {formatScore(audit.score)}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{audit.description}</p>
                        {audit.displayValue && (
                          <div className="mt-2 text-sm font-medium">
                            Value: {audit.displayValue}
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            </TabsContent>
          ))}
          <TabsContent value="debug" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Raw DataForSEO API Response</h3>
              <p className="text-sm text-gray-500">
                This panel shows the complete raw data structure returned from the DataForSEO API.
                <strong className="text-blue-600"> Auto-refresh is paused while viewing this data.</strong>
              </p>
              
              {/* Task Information */}
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Task Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-100 p-2 rounded">Task ID: <span className="font-mono">{taskId}</span></div>
                  <div className="bg-gray-100 p-2 rounded">Last Refreshed: <span className="font-mono">{lastRefreshed?.toLocaleString()}</span></div>
                </div>
              </div>
              
              {/* DataForSEO API Structure Guide */}
              <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="text-md font-medium mb-2">DataForSEO API Response Structure</h4>
                <p className="text-sm">The API response follows this nested structure:</p>
                <pre className="text-xs font-mono bg-white p-2 rounded mt-2 overflow-auto">
                  {
`{
  "version": "...",
  "status_code": 20000,
  "status_message": "Ok",
  "time": "...",
  "cost": 0.0,
  "tasks": [
    {
      "id": "...",
      "status_code": 20000,
      "status_message": "Ok",
      "time": "...",
      "result": [
        {
          "lighthouse_version": "...",
          "categories": { ... },
          "audits": { ... }
        }
      ]
    }
  ]
}`}
                </pre>
              </div>
              
              {/* Raw JSON Data */}
              <div>
                <h4 className="text-md font-medium mb-2">Complete Raw JSON Data</h4>
                <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] border border-gray-300">
                  <pre className="text-xs font-mono">{JSON.stringify(results, null, 2)}</pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <Button 
          variant="default" 
          size="lg"
          onClick={handleManualRefresh}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-md shadow-lg mt-6"
          style={{ fontSize: '16px' }}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 mr-2" />
              REFRESH RESULTS
            </>
          )}
        </Button>
        <Button 
          variant="default" 
          size="lg"
          onClick={toggleDebugPanel}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-md shadow-lg mt-6 flex items-center justify-center w-full"
          style={{ fontSize: '16px' }}
        >
          {showDebugPanel ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              HIDE RAW API DATA
            </>
          ) : (
            <>
              <Info className="h-5 w-5 mr-2" />
              SHOW RAW API DATA (STOPS AUTO-REFRESH)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
