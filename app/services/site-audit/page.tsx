import type { Metadata } from "next"
import SiteAuditForm from "./site-audit-form"
import { GradientHeading } from "@/components/ui/gradient-heading"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: "Site Audit | SEO Tool",
  description: "Run a comprehensive SEO audit on your website",
}

export default function SiteAuditPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <GradientHeading
          title="Full Site Audit"
          subtitle="Analyze your website for SEO issues and get recommendations for improvement"
          className="mb-8 text-center"
        />

        <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-6 shadow-lg">
          <SiteAuditForm />
        </div>
      </div>
    </div>
  )
}

