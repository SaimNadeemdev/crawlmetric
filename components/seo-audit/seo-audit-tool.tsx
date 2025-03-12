"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, Activity } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { runInstantPageAudit } from "@/lib/dataforseo-api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FullSiteAuditForm } from "./full-site-audit-form"
import { motion } from "framer-motion"

export function SEOAuditTool() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const data = await runInstantPageAudit(url)
      setResults(data)
      toast({
        title: "Audit Complete",
        description: `SEO audit for ${url} completed successfully.`,
      })
    } catch (error: any) {
      console.error("Error running audit:", error)
      setError(error.message || "An error occurred while running the audit.")
      toast({
        title: "Audit Failed",
        description: "There was an error running the audit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-[22px] border border-blue-100/50 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">SEO Audit Tools</h2>
        <p className="text-gray-600">Analyze your website's SEO performance with our comprehensive audit tools.</p>
      </div>
      
      <Tabs defaultValue="instant" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="instant" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Search className="h-4 w-4 mr-2" />
            Instant Audit
          </TabsTrigger>
          <TabsTrigger value="full-site" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Activity className="h-4 w-4 mr-2" />
            Full Site Audit
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="instant" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[22px]">
              <CardHeader>
                <CardTitle>Instant Page Audit</CardTitle>
                <CardDescription>Analyze a single page for SEO issues and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">URL to Audit</Label>
                    <Input
                      id="url"
                      placeholder="Enter URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running Audit...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Run Audit
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-6"
              >
                <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[22px]">
                  <CardHeader>
                    <CardTitle>Audit Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted rounded-md p-4 overflow-auto">
                      <code>{JSON.stringify(results, null, 2)}</code>
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-6"
              >
                <Card className="bg-red-50/50 backdrop-blur-xl border border-red-100 shadow-sm rounded-[22px]">
                  <CardContent className="text-red-600 p-4">Error: {error}</CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="full-site" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FullSiteAuditForm />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
