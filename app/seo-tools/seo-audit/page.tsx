"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InstantAudit } from "@/components/seo-audit/instant-audit"
import { SiteAudit } from "@/components/seo-audit/site-audit"
import { LighthouseAuditForm } from "@/components/seo-audit/lighthouse-audit-form"
import LighthouseResults from "@/components/seo-audit/lighthouse-results-fixed"
import { ClientProviders } from "@/components/providers/client-providers"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


export default function SeoAuditPage() {
  const [activeTab, setActiveTab] = useState("instant")
  const [activeLighthouseTaskId, setActiveLighthouseTaskId] = useState<string | null>(null)

  return (
    <ClientProviders>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SEO Audit Tools</h1>
          <p className="text-gray-500">
            Analyze and improve your website's search engine optimization with our comprehensive SEO audit tools.
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1">
            <TabsTrigger
              value="instant"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Instant Audit
            </TabsTrigger>
            <TabsTrigger
              value="site"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Site Audit
            </TabsTrigger>
            <TabsTrigger
              value="lighthouse"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Lighthouse Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instant" className="space-y-6">
            <InstantAudit />
          </TabsContent>

          <TabsContent value="site" className="space-y-6">
            <SiteAudit />
          </TabsContent>

          <TabsContent value="lighthouse" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <LighthouseAuditForm onTaskCreated={setActiveLighthouseTaskId} />
              </div>
              {activeLighthouseTaskId && (
                <div>
                  <LighthouseResults taskId={activeLighthouseTaskId} />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ClientProviders>
  )
}
