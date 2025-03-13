"use client"

import { FullSiteAuditForm } from "./full-site-audit-form"
import { SiteAuditResults } from "./site-audit-results"
import { SiteAuditTaskList } from "./site-audit-task-list"
import { useSeoAudit } from "@/contexts/seo-audit-context"

export function SiteAudit() {
  const { activeSiteAuditTask, siteAuditSummary } = useSeoAudit()

  return (
    <div className="space-y-6">
      <FullSiteAuditForm />
      <SiteAuditTaskList />
      {activeSiteAuditTask && siteAuditSummary && <SiteAuditResults />}
    </div>
  )
}
