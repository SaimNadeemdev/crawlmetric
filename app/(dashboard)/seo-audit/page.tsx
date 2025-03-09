"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstantAuditForm } from "@/components/seo-audit/instant-audit-form"
import { InstantAuditResults } from "@/components/seo-audit/instant-audit-results"
import { FullSiteAuditForm } from "@/components/seo-audit/full-site-audit-form"
import { SiteAuditTaskList } from "@/components/seo-audit/site-audit-task-list"
import { SiteAuditResults } from "@/components/seo-audit/site-audit-results"
import { Search, Globe } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import DashboardLayout from "@/app/dashboard-layout"
import { SeoAuditProvider } from "@/contexts/seo-audit-context"

export default function SeoAuditPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<string>(tabParam === "site" ? "site" : "instant")

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/seo-audit?tab=${value}`, { scroll: false })
  }

  // Update tab state if URL parameter changes
  useEffect(() => {
    if (tabParam === "site" || tabParam === "instant") {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <DashboardLayout>
      <SeoAuditProvider>
        <div className="container mx-auto p-4 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Onsite SEO Audit</h1>
            <p className="text-muted-foreground">Analyze your website for SEO issues and opportunities</p>
          </div>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="instant">
                <Search className="h-4 w-4 mr-2" />
                Instant Page Audit
              </TabsTrigger>
              <TabsTrigger value="site">
                <Globe className="h-4 w-4 mr-2" />
                Full Site Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instant" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <InstantAuditForm />
                </div>
                <div className="md:col-span-2">
                  <InstantAuditResults />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="site" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                  <FullSiteAuditForm />
                  <SiteAuditTaskList />
                </div>
                <div className="md:col-span-2">
                  <SiteAuditResults />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SeoAuditProvider>
    </DashboardLayout>
  )
}

