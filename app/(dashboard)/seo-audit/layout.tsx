"use client"

import type React from "react"

import { SeoAuditProvider } from "@/contexts/seo-audit-context"

export default function SeoAuditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SeoAuditProvider>{children}</SeoAuditProvider>
}
