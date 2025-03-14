"use client"

import { KeywordResearchProvider } from "@/contexts/keyword-research-context"
import KeywordResearch from "@/components/keyword-research/keyword-research"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';

export default function KeywordResearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <KeywordResearchProvider>
        <KeywordResearch />
      </KeywordResearchProvider>
    </div>
  )
}
