import type { Metadata } from "next"
import { getSiteAuditResults, getSiteAuditSummary, getPagesWithIssues } from "../actions"
import AuditResults from "./audit-results"
import { GradientHeading } from "@/components/ui/gradient-heading"

export const metadata: Metadata = {
  title: "Site Audit Results | SEO Tool",
  description: "View the results of your website SEO audit",
}

export default async function SiteAuditResultsPage({
  searchParams,
}: {
  searchParams: { taskId?: string }
}) {
  const taskId = searchParams.taskId

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
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <GradientHeading
            title="Audit in Progress"
            subtitle="Your site audit is currently running. This may take a few minutes."
            className="mb-8"
          />
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
          <p className="mt-6 text-gray-400">
            This page will automatically refresh to check for results.
            <br />
            Task ID: {taskId}
          </p>

          {/* Client-side refresh script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                setTimeout(function() {
                  window.location.reload();
                }, 10000);
              `,
            }}
          />
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
          summaryData={summaryResponse.success ? summaryResponse.data : null}
          pagesWithIssues={pagesWithIssuesResponse.success ? pagesWithIssuesResponse.data : null}
          summaryError={!summaryResponse.success ? summaryResponse.error : null}
          pagesError={!pagesWithIssuesResponse.success ? pagesWithIssuesResponse.error : null}
        />
      </div>
    </div>
  )
}

