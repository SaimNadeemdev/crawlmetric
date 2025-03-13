"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InstantAudit } from "@/components/seo-audit/instant-audit"
import { SiteAudit } from "@/components/seo-audit/site-audit"
import { LighthouseAuditForm } from "@/components/seo-audit/lighthouse-audit-form"
import LighthouseResults from "@/components/seo-audit/lighthouse-results-fixed"
import { useSeoAudit } from "@/contexts/seo-audit-context"

export default function SeoAuditPage() {
  const [activeTab, setActiveTab] = useState("instant")
  const { activeSiteAuditTask } = useSeoAudit()

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Audit Tools</h1>
        <p className="text-gray-500">
          Analyze and improve your website's search engine optimization with our comprehensive audit tools.
        </p>
      </div>

      <Tabs
        defaultValue="instant"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
          <TabsTrigger value="instant">Instant Audit</TabsTrigger>
          <TabsTrigger value="site">Site Audit</TabsTrigger>
          <TabsTrigger value="lighthouse">Lighthouse</TabsTrigger>
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
              <LighthouseAuditForm />
            </div>
            {activeSiteAuditTask && (
              <div>
                <LighthouseResults taskId={activeSiteAuditTask} />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
