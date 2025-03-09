"use client"

import KeywordResearch from "@/components/keyword-research/keyword-research"
import { KeywordResearchProvider } from "@/contexts/keyword-research-context"

export default function KeywordResearchPage() {
  return (
    <KeywordResearchProvider>
      <KeywordResearch />
    </KeywordResearchProvider>
  )
}
