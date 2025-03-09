"use client"
import { createContext, useContext, useState, type ReactNode } from "react"

// Define the types for our context
type AuditResult = {
  url: string
  score: number
  issues: Array<{
    type: string
    severity: "critical" | "warning" | "info"
    message: string
  }>
  metadata: {
    title: string
    description: string
    h1: string[]
    images: number
    imagesWithAlt: number
    internalLinks: number
    externalLinks: number
    wordCount: number
  }
  performance: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
  }
  timestamp: string
}

type SiteAuditTask = {
  id: string
  url: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  createdAt: string
  completedAt?: string
}

type SeoAuditContextType = {
  instantAuditUrl: string
  setInstantAuditUrl: (url: string) => void
  instantAuditLoading: boolean
  setInstantAuditLoading: (loading: boolean) => void
  instantAuditResult: AuditResult | null
  setInstantAuditResult: (result: AuditResult | null) => void

  siteAuditUrl: string
  setSiteAuditUrl: (url: string) => void
  siteAuditLoading: boolean
  setSiteAuditLoading: (loading: boolean) => void
  siteAuditTasks: SiteAuditTask[]
  setSiteAuditTasks: (tasks: SiteAuditTask[]) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  siteAuditResult: any | null
  setSiteAuditResult: (result: any | null) => void
}

// Create the context
const SeoAuditContext = createContext<SeoAuditContextType | undefined>(undefined)

// Create a provider component
export function SeoAuditProvider({ children }: { children: ReactNode }) {
  const [instantAuditUrl, setInstantAuditUrl] = useState("")
  const [instantAuditLoading, setInstantAuditLoading] = useState(false)
  const [instantAuditResult, setInstantAuditResult] = useState<AuditResult | null>(null)

  const [siteAuditUrl, setSiteAuditUrl] = useState("")
  const [siteAuditLoading, setSiteAuditLoading] = useState(false)
  const [siteAuditTasks, setSiteAuditTasks] = useState<SiteAuditTask[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [siteAuditResult, setSiteAuditResult] = useState<any | null>(null)

  return (
    <SeoAuditContext.Provider
      value={{
        instantAuditUrl,
        setInstantAuditUrl,
        instantAuditLoading,
        setInstantAuditLoading,
        instantAuditResult,
        setInstantAuditResult,

        siteAuditUrl,
        setSiteAuditUrl,
        siteAuditLoading,
        setSiteAuditLoading,
        siteAuditTasks,
        setSiteAuditTasks,
        selectedTaskId,
        setSelectedTaskId,
        siteAuditResult,
        setSiteAuditResult,
      }}
    >
      {children}
    </SeoAuditContext.Provider>
  )
}

// Create a custom hook to use the context
export function useSeoAudit() {
  const context = useContext(SeoAuditContext)
  if (context === undefined) {
    throw new Error("useSeoAudit must be used within a SeoAuditProvider")
  }
  return context
}

