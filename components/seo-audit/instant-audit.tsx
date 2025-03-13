"use client"

import { InstantAuditForm } from "./instant-audit-form"
import { InstantAuditResults } from "./instant-audit-results"
import { useSeoAudit } from "@/contexts/seo-audit-context"

export function InstantAudit() {
  const { instantAuditResults } = useSeoAudit()

  return (
    <div className="space-y-6">
      <InstantAuditForm />
      {instantAuditResults && <InstantAuditResults />}
    </div>
  )
}
