"use client"

import type { Metadata } from "next"
import { useEffect } from "react"
import { getSiteAuditResults, getSiteAuditSummary, getPagesWithIssues } from "../actions"
import AuditResults from "./audit-results"
import { GradientHeading } from "@/components/ui/gradient-heading"
import { safeReloadPage } from "@/lib/client-utils"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';

// Metadata can't be exported from a client component
// We'll need to move this to a separate layout.tsx file or remove it

export default async function SiteAuditResultsPage({
  searchParams,
}: {
  searchParams: { taskId?: string }
}) {
  const taskId = searchParams.taskId || "";

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

  // Fetch the audit results
  const resultsResponse = await getSiteAuditResults(taskId)

  // If the task is still in progress, show a loading message
  if (resultsResponse.success && resultsResponse.status === "in_progress") {
    const handleReloadPage = () => {
      safeReloadPage();
    };

    useEffect(() => {
      const timer = setTimeout(handleReloadPage, 10000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <GradientHeading
            title="Audit in Progress"
            subtitle="Your site audit is currently running. This may take a few minutes."
            className="mb-8"
          />
          <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
            <div className="animate-pulse mb-4 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent" />
            <GradientHeading title="Processing your audit..." className="mb-2" />
            <p className="text-muted-foreground mb-6">This may take a few minutes. The page will refresh automatically.</p>
          </div>
          <p className="mt-6 text-gray-400">
            Task ID: {taskId}
          </p>
        </div>
      </div>
    )
  }

  // If there was an error, show the error message
  if (!resultsResponse.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Error Fetching Audit Results</h1>
          <p className="mb-6 text-red-500">{resultsResponse.error || "An unknown error occurred"}</p>
        </div>
      </div>
    )
  }

  // Fetch the summary and pages with issues
  const summaryResponse = await getSiteAuditSummary(taskId)
  const pagesWithIssuesResponse = await getPagesWithIssues(taskId)

  // Ensure summary and pages data are properly typed
  const summary = summaryResponse.success ? summaryResponse.data || null : null;
  const pages = pagesWithIssuesResponse.success ? pagesWithIssuesResponse.data || null : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <GradientHeading
          title="Site Audit Results"
          subtitle="Comprehensive analysis of your website's SEO health"
          className="mb-8 text-center"
        />

        <AuditResults
          taskId={taskId}
          taskData={resultsResponse.data}
          summaryData={summary}
          pagesWithIssues={pages}
          summaryError={summaryResponse.success ? null : (summaryResponse.error || null)}
          pagesError={pagesWithIssuesResponse.success ? null : (pagesWithIssuesResponse.error || null)}
        />
      </div>
    </div>
  )
}
