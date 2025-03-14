"use client"

import { useEffect, useState } from "react"
import { getSiteAuditResults, getSiteAuditSummary, getPagesWithIssues } from "../client-actions"
import AuditResults from "./audit-results"
import { safeReloadPage } from "@/lib/client-utils"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';

export default function SiteAuditResultsPage({
  searchParams,
}: {
  searchParams: { taskId?: string }
}) {
  const taskId = searchParams.taskId || "";
  const [isLoading, setIsLoading] = useState(true);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [pagesWithIssues, setPagesWithIssues] = useState<any>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [pagesError, setPagesError] = useState<string | null>(null);

  // Function to handle page reload
  const handleReloadPage = () => {
    safeReloadPage();
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (!taskId) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch audit results
        const resultsResponse = await getSiteAuditResults(taskId);
        
        if (!resultsResponse.success) {
          setError(resultsResponse.error || 'Failed to fetch audit results');
          setIsLoading(false);
          return;
        }
        
        // If still in progress, set the state and return
        if (resultsResponse.status === "in_progress") {
          setInProgress(true);
          setIsLoading(false);
          return;
        }
        
        // If we have results, fetch summary and pages with issues
        setResults(resultsResponse.data);
        
        const [summaryResponse, pagesWithIssuesResponse] = await Promise.all([
          getSiteAuditSummary(taskId),
          getPagesWithIssues(taskId)
        ]);
        
        if (summaryResponse.success) {
          setSummary(summaryResponse.data);
        } else {
          setSummaryError(summaryResponse.error || 'Failed to fetch summary');
          console.error('Failed to fetch summary:', summaryResponse.error);
        }
        
        if (pagesWithIssuesResponse.success) {
          setPagesWithIssues(pagesWithIssuesResponse.data);
        } else {
          setPagesError(pagesWithIssuesResponse.error || 'Failed to fetch pages with issues');
          console.error('Failed to fetch pages with issues:', pagesWithIssuesResponse.error);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching audit data:', err);
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [taskId]);

  // Handle case when no task ID is provided
  if (!taskId) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">No Audit Task Found</h1>
          <p className="mb-6">Please start a new site audit from the Site Audit page.</p>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Loading Audit Results</h1>
          <p className="mb-6">Please wait while we fetch your audit results...</p>
        </div>
      </div>
    )
  }

  // Show in-progress state with reload button
  if (inProgress) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent section-title">
              Audit in Progress
            </h1>
            <p className="text-gray-900 mx-auto max-w-[700px]">
              Your site audit is still running. This may take a few minutes depending on the size of your website.
            </p>
          </div>
          <button
            onClick={handleReloadPage}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Check Again
          </button>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
          <p className="mb-6">{error}</p>
        </div>
      </div>
    )
  }

  // Render the audit results
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent section-title">
            Site Audit Results
          </h1>
          <p className="text-gray-900 mx-auto max-w-[700px]">
            Comprehensive analysis of your website's SEO health
          </p>
        </div>
        
        <AuditResults 
          taskId={taskId}
          taskData={results}
          summaryData={summary}
          pagesWithIssues={pagesWithIssues}
          summaryError={summaryError}
          pagesError={pagesError}
        />
      </div>
    </div>
  )
}
