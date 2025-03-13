import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useSeoAudit } from "@/contexts/seo-audit-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LighthouseResultsProps {
  taskId: string;
}

interface AuditReference {
  id: string;
  weight: number;
  group: string;
}

interface Audit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue: string | null;
}

interface AuditItem {
  id: string;
  weight: number;
  group: string;
  audit: Audit;
}

const MAX_RETRIES = 15;
const POLLING_INTERVAL = 5000;

const LighthouseResults: React.FC<LighthouseResultsProps> = ({ taskId }) => {
  const { 
    startLighthouseAudit, 
    getLighthouseResults, 
    lighthouseAuditResults, 
    lighthouseAuditLoading, 
    lighthouseAuditError 
  } = useSeoAudit();
  
  const [localResults, setLocalResults] = useState<any | null>(null);
  const [localTaskId, setLocalTaskId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("performance");
  const [url, setUrl] = useState<string>("");
  const [hasResults, setHasResults] = useState(false);

  // Function to start a new Lighthouse audit
  const handleStartAudit = async () => {
    if (!url) {
      setStartError("Please enter a URL to audit");
      return;
    }
    
    try {
      setStartError(null);
      setIsPolling(true);
      
      const response = await fetch(`/api/seo-audit/lighthouse/task-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.success && data.taskId) {
        setLocalTaskId(data.taskId);
        setRetryCount(0);
        pollForResults(data.taskId);
      } else {
        setIsPolling(false);
        setStartError(data.error || "Failed to start Lighthouse audit. Please try again.");
      }
    } catch (error) {
      setIsPolling(false);
      setStartError(error instanceof Error ? error.message : "Failed to start Lighthouse audit. Please try again.");
    }
  };
  
  // Polling function to check for results periodically
  const pollForResults = async (taskId: string) => {
    if (!taskId || retryCount >= MAX_RETRIES) {
      console.log(`Polling stopped: ${!taskId ? 'No taskId' : 'Max retries reached'}`);
      setIsPolling(false);
      return;
    }

    try {
      console.log(`Polling for results (attempt ${retryCount + 1})...`);
      const results = await getLighthouseResults(taskId);
      
      // If we have successful results, update state and stop polling
      if (results && results.success) {
        console.log(`Successfully fetched Lighthouse results after ${retryCount + 1} attempts`);
        setIsPolling(false);
        setLocalResults(results);
        setHasResults(true);
        
        // Extract URL from the results
        if (results.tasks && results.tasks[0] && results.tasks[0].result && results.tasks[0].result[0]) {
          setUrl(results.tasks[0].result[0].requestedUrl || "");
        } else if (results.lighthouse_result) {
          setUrl(results.lighthouse_result.requestedUrl || "");
        } else if (results.data) {
          setUrl(results.data.requestedUrl || "");
        }
        return;
      }
      
      // If task is still in progress, continue polling
      if (results && (results.status === "in_progress" || 
          (results.error && (
            results.error.includes("still in progress") ||
            results.error.includes("not available yet")
          ))
        )) {
        console.log("Task still in progress, continuing to poll...");
        setRetryCount(retryCount + 1);
        setTimeout(() => pollForResults(taskId), POLLING_INTERVAL);
      } else {
        // If we get an error that's not about the task being in progress, stop polling
        console.log("Polling stopped due to error or completion:", results?.error || "Unknown error");
        setIsPolling(false);
      }
    } catch (error) {
      console.error("Error polling for results:", error);
      setIsPolling(false);
    }
  };

  // Effect to handle taskId changes
  useEffect(() => {
    if (taskId) {
      fetchResults(taskId);
    }
  }, [taskId]);
  
  // Separate fetchResults function to avoid hooks issues
  const fetchResults = async (taskId: string) => {
    if (!taskId) return;
    
    try {
      setIsPolling(true);
      const results = await getLighthouseResults(taskId);
      if (results && results.success) {
        setLocalResults(results);
        setHasResults(true);
        setIsPolling(false);
        
        // If we have a requestedUrl in the results, store it
        if (results.tasks && results.tasks[0] && results.tasks[0].result && results.tasks[0].result[0]) {
          setUrl(results.tasks[0].result[0].requestedUrl || "");
        } else if (results.lighthouse_result) {
          setUrl(results.lighthouse_result.requestedUrl || "");
        } else if (results.data) {
          setUrl(results.data.requestedUrl || "");
        }
      } else {
        // If we didn't get results but the task might still be processing, start polling
        if (results && (results.status === "in_progress" || 
            (results.error && (
              results.error.includes("still in progress") ||
              results.error.includes("not available yet")
            ))
          )) {
          // Start polling for results
          setRetryCount(0);
          pollForResults(taskId);
          return;
        } else {
          // If there's an error that's not about the task being in progress
          setIsPolling(false);
        }
      }
    } catch (error) {
      console.error("Error fetching Lighthouse results:", error);
      setIsPolling(false);
    }
  };

  // Use either context results or local results
  const displayResults = lighthouseAuditResults || localResults;
  
  // Adapt the data structure for display
  const adaptedData = useMemo(() => {
    if (!displayResults) return null;
    
    try {
      // Check if we have a successful response
      if (displayResults.success === false) {
        return null;
      }

      // Different response formats based on API version
      let data: any = {};
      let rawData = displayResults;
      
      // Extract the main data object
      if (displayResults.tasks && displayResults.tasks[0] && displayResults.tasks[0].result && displayResults.tasks[0].result[0]) {
        // DataForSEO API format
        data = displayResults.tasks[0].result[0];
        rawData = displayResults;
      } else if (displayResults.lighthouse_result) {
        // Direct Lighthouse format
        data = displayResults.lighthouse_result;
        rawData = displayResults;
      } else if (displayResults.data) {
        // Custom API wrapper format
        data = displayResults.data;
        rawData = displayResults;
      } else {
        // Assume the response itself is the data
        data = displayResults;
        rawData = displayResults;
      }
      
      // Return the adapted data without setting state
      return {
        rawData,
        categories: data.categories || {},
        audits: data.audits || {},
        userAgent: data.userAgent,
        environment: data.environment,
        lighthouseVersion: data.lighthouseVersion,
        fetchTime: data.fetchTime,
        requestedUrl: data.requestedUrl,
        finalUrl: data.finalUrl,
        runWarnings: data.runWarnings,
        taskId: displayResults.tasks && displayResults.tasks[0] && displayResults.tasks[0].id,
        taskStatus: displayResults.tasks && displayResults.tasks[0] && displayResults.tasks[0].status_code,
        taskMessage: displayResults.tasks && displayResults.tasks[0] && displayResults.tasks[0].status_message,
        apiVersion: displayResults.version,
        apiStatusCode: displayResults.status_code,
        apiStatusMessage: displayResults.status_message,
        apiTime: displayResults.time,
        apiCost: displayResults.cost
      };
    } catch (error) {
      console.error("Error adapting Lighthouse data:", error);
      return null;
    }
  }, [displayResults]);

  // Update hasResults based on adaptedData in a separate effect
  useEffect(() => {
    if (adaptedData && Object.keys(adaptedData).length > 0) {
      setHasResults(true);
    }
  }, [adaptedData]);
  
  // Add a debug panel to show the full raw data
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const toggleDebugPanel = () => setShowDebugPanel(!showDebugPanel);
  
  // Get all categories and their scores
  const categories = useMemo(() => {
    if (!adaptedData) return {};
    return adaptedData.categories || {};
  }, [adaptedData]);
  
  const audits = adaptedData?.audits || {};
  
  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.5) return "text-orange-500";
    return "text-red-600";
  };
  
  // Helper function to get score icon
  const getScoreIcon = (score: number) => {
    if (score >= 0.9) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 0.5) return <AlertCircle className="h-5 w-5 text-orange-500" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };
  
  // Function to get audits for a specific category
  const getAuditsForCategory = (categoryId: string) => {
    if (!adaptedData || !adaptedData.categories || !adaptedData.categories[categoryId]) {
      return [];
    }
    
    const categoryAudits = adaptedData.categories[categoryId].auditRefs || [];
    
    return categoryAudits
      .map((auditRef: AuditReference) => {
        const audit = adaptedData.audits[auditRef.id];
        if (!audit) return null;
        
        return {
          id: auditRef.id,
          weight: auditRef.weight,
          group: auditRef.group,
          audit: {
            id: audit.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            displayValue: audit.displayValue
          }
        };
      })
      .filter(Boolean)
      .sort((a: { weight: number }, b: { weight: number }) => b.weight - a.weight); // Sort by weight descending
  };
  
  // Get all performance audits
  const performanceAudits = getAuditsForCategory('performance');
  // Get all accessibility audits
  const accessibilityAudits = getAuditsForCategory('accessibility');
  // Get all best practices audits
  const bestPracticesAudits = getAuditsForCategory('best-practices');
  // Get all SEO audits
  const seoAudits = getAuditsForCategory('seo');

  // Add a CircularProgress component for score display
  const CircularProgress = ({ score, label }: { score: number, label: string }) => {
    const percentage = Math.round(score * 100);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    // Get color based on score
    const getColor = (score: number) => {
      if (score >= 0.9) return "#388e3c"; // Green
      if (score >= 0.5) return "#f57c00"; // Orange
      return "#d32f2f"; // Red
    };
    
    return (
      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
        <div className="relative w-24 h-24">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#e6e6e6"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={getColor(score)}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: getColor(score) }}>
              {percentage}%
            </span>
          </div>
        </div>
        <div className="mt-2 text-center font-medium">{label}</div>
      </div>
    );
  };

  // Function to handle the "Check for Updates" button
  const handleCheckForUpdates = () => {
    if (taskId) {
      // If we have a taskId, just refresh the results
      setIsPolling(true);
      setRetryCount(0);
      fetchResults(taskId);
    } else {
      // If no taskId, try to get the latest results
      setIsPolling(true);
      fetch(`/api/seo-audit/lighthouse/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: 'no-store',
      })
      .then(response => response.json())
      .then(data => {
        setIsPolling(false);
        if (data.success) {
          setLocalResults(data);
          setHasResults(true);
          if (data.taskId) {
            setLocalTaskId(data.taskId);
          }
          // Extract URL from the results
          if (data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0]) {
            setUrl(data.tasks[0].result[0].requestedUrl || "");
          } else if (data.lighthouse_result) {
            setUrl(data.lighthouse_result.requestedUrl || "");
          } else if (data.data) {
            setUrl(data.data.requestedUrl || "");
          }
        } else {
          console.error("Error loading latest results:", data.error || "Unknown error");
        }
      })
      .catch(error => {
        setIsPolling(false);
        console.error("Error getting latest Lighthouse results:", error);
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Lighthouse Audit Results</CardTitle>
          {hasResults ? (
            <>
              <CardDescription>Analysis of {url || 'your website'} {adaptedData?.environment?.hostUserAgent?.includes('desktop') ? 'on desktop' : 'on mobile'}</CardDescription>
              <div className="text-sm text-gray-500 mt-1">
                Last checked: {new Date().toLocaleTimeString()}
              </div>
            </>
          ) : (
            <CardDescription>Run an audit to see performance insights</CardDescription>
          )}
        </div>
        <Button 
          variant="default" 
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          onClick={handleCheckForUpdates}
          disabled={isPolling}
        >
          <RefreshCw className="h-4 w-4" />
          {isPolling ? 'LOADING...' : taskId ? 'REFRESH RESULTS' : 'LOAD LATEST RESULTS'}
        </Button>
      </CardHeader>
      <CardContent>
        {!hasResults && !isPolling ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Info className="h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Audit Results Displayed</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Use the form on the left to run a new Lighthouse audit for your website. Results will appear here once the audit is complete.
            </p>
            <p className="text-sm text-gray-400 mb-2">
              If you've already run an audit and want to see those results, you can click the "LOAD LATEST RESULTS" button above.
            </p>
          </div>
        ) : isPolling ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
            <h3 className="text-xl font-medium mb-2">Loading Audit Results</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              We're fetching the latest Lighthouse audit results. This may take a moment...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score cards */}
            <div className="grid grid-cols-4 gap-4">
              <CircularProgress score={categories.performance?.score || 0} label="Performance" />
              <CircularProgress score={categories.accessibility?.score || 0} label="Accessibility" />
              <CircularProgress score={categories['best-practices']?.score || 0} label="Best Practices" />
              <CircularProgress score={categories.seo?.score || 0} label="SEO" />
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Performance Audits</h3>
            </div>
            
            <Accordion type="multiple">
              {performanceAudits.map((audit: AuditItem, index: number) => (
                <AccordionItem key={index} value={audit.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="text-lg font-medium">{audit.audit.title}</span>
                      <span className={`text-lg font-bold ${getScoreColor(audit.audit.score || 0)}`}>
                        {Math.round((audit.audit.score || 0) * 100)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm">{audit.audit.description}</p>
                    {audit.audit.displayValue && (
                      <p className="text-lg font-bold mt-2">{audit.audit.displayValue}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartAudit} className="w-full">Run New Audit</Button>
      </CardFooter>
    </Card>
  );
};

export default LighthouseResults;