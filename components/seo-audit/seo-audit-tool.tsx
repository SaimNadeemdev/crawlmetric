"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { runInstantPageAudit } from "@/lib/dataforseo-api"

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
      <Card>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
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
        <Card>
          <CardHeader>
            <CardTitle>Audit Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-md p-4 overflow-auto">
              <code>{JSON.stringify(results, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="text-destructive">Error: {error}</CardContent>
        </Card>
      )}
    </div>
  )
}

