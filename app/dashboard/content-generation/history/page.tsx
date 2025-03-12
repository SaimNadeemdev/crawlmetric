"use client"

import ContentGenerationHistory from "@/components/content-generation/content-generation-history"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function ContentGenerationHistoryPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Content Generation History"
        text="View your past content generation results"
      />
      <ContentGenerationHistory />
    </DashboardShell>
  )
}
