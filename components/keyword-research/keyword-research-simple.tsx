"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ResearchMode, KeywordResearchParams, KeywordResult } from "@/types/keyword-research"

export function KeywordResearchSimple() {
  // Form state
  const [mode, setMode] = useState<ResearchMode>("keyword_suggestions")
  const [keyword, setKeyword] = useState("")
  const [locationName, setLocationName] = useState("United States")
  const [languageName, setLanguageName] = useState("English")
  const [limit, setLimit] = useState(10)
  const [targetUrl, setTargetUrl] = useState("")
  const [bulkKeywords, setBulkKeywords] = useState("")

  // Results state
  const [results, setResults] = useState<KeywordResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timestamp, setTimestamp] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Get the appropriate DataForSEO endpoint for each mode
  const getEndpoint = (mode: ResearchMode) => {
    switch (mode) {
      case "keyword_suggestions":
        return "/dataforseo_labs/google/keyword_suggestions/live"
      case "keywords_for_site":
        return "/dataforseo_labs/google/keywords_for_site/live"
      case "historical_search_volume":
        return "/dataforseo_labs/google/historical_search_volume/live"
      case "bulk_keyword_difficulty":
        return "/dataforseo_labs/google/keyword_difficulty/live"
      case "keyword_ideas":
        return "/dataforseo_labs/google/keyword_ideas/live"
      default:
        return "/dataforseo_labs/google/keyword_suggestions/live"
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Prepare request data based on mode
      const requestData: KeywordResearchParams = {
        mode,
        keyword,
        locationName,
        languageName,
        limit,
        ...(mode === "keywords_for_site" && { targetUrl }),
        ...(mode === "bulk_keyword_difficulty" && {
          keywords: bulkKeywords.split("\n").filter((k) => k.trim()),
        }),
      }

      console.log("Running keyword research with params:", requestData)

      const response = await fetch("/api/dataforseo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: getEndpoint(mode),
          data: [requestData],
        }),
      })

      const data = await response.json()
      console.log("API response:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch results")
      }

      setResults(data.data || [])
      setTimestamp(new Date().toLocaleString())
      console.log("Results set:", data.data)
    } catch (err: unknown) {
      console.error("Error fetching results:", err)
      setError(err instanceof Error ? err.message : String(err))
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Filter results based on search query
  const filteredResults = results.filter((result) => result.keyword.toLowerCase().includes(searchQuery.toLowerCase()))

  // Format number helper
  const formatNumber = (num: number): string => {
    if (!num && num !== 0) return "0"
    return new Intl.NumberFormat().format(num)
  }

  // Export to CSV function
  const exportToCsv = () => {
    if (!results.length) return

    // Create CSV content
    const headers = ["Keyword", "Search Volume", "CPC", "Competition", "Difficulty", "Level"]
    const csvData = [
      headers.join(","),
      ...results.map((result) =>
        [
          `"${result.keyword}"`,
          result.search_volume,
          result.cpc.toFixed(2),
          (result.competition * 100).toFixed(0),
          result.keyword_difficulty,
          result.competition_level,
        ].join(","),
      ),
    ].join("\n")

    import('@/lib/client-utils').then(({ downloadFile }) => {
      downloadFile(
        csvData,
        `keyword-research-${new Date().toISOString()}.csv`,
        'text/csv'
      );
    });
  }

  // Render form fields based on selected mode
  const renderModeFields = () => {
    switch (mode) {
      case "keywords_for_site":
        return (
          <div className="space-y-2">
            <Label htmlFor="target-url">Target URL</Label>
            <Input
              id="target-url"
              placeholder="Enter website URL"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
          </div>
        )

      case "bulk_keyword_difficulty":
        return (
          <div className="space-y-2">
            <Label htmlFor="bulk-keywords">Keywords (one per line)</Label>
            <Textarea
              id="bulk-keywords"
              placeholder="Enter keywords..."
              value={bulkKeywords}
              onChange={(e) => setBulkKeywords(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              placeholder="Enter a keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
          </div>
        )
    }
  }

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-[350px_1fr] divide-x">
      {/* Form Panel */}
      <div className="flex h-full flex-col overflow-y-auto bg-muted/10 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Keyword Research</h2>
          <p className="text-sm text-muted-foreground">
            Discover new keyword opportunities and analyze existing keyword data
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="research-mode">Research Mode</Label>
            <Select value={mode} onValueChange={(value: ResearchMode) => setMode(value)}>
              <SelectTrigger id="research-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword_suggestions">Keyword Suggestions</SelectItem>
                <SelectItem value="keywords_for_site">Keywords for Site</SelectItem>
                <SelectItem value="historical_search_volume">Historical Search Volume</SelectItem>
                <SelectItem value="bulk_keyword_difficulty">Bulk Keyword Difficulty</SelectItem>
                <SelectItem value="keyword_ideas">Keyword Ideas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderModeFields()}

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter location"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              placeholder="Enter language"
              value={languageName}
              onChange={(e) => setLanguageName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="result-limit">Result Limit: {limit}</Label>
            </div>
            <Slider
              id="result-limit"
              min={10}
              max={100}
              step={10}
              value={[limit]}
              onValueChange={(value) => setLimit(value[0])}
            />
            <p className="text-xs text-muted-foreground">Limit the number of results (10-100)</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Running Research..." : "Run Research"}
          </Button>
        </form>
      </div>

      {/* Results Panel */}
      <div className="overflow-y-auto p-6">
        <div className="flex h-full flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Keyword Suggestions</h2>
              <p className="text-sm text-muted-foreground">
                {results.length} results found • {timestamp || "No search performed"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportToCsv} variant="outline" size="sm" disabled={!results.length}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <Input
              placeholder="Search results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
              disabled={!results.length}
            />
          </div>

          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Processing...</div>
            </div>
          ) : results.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No results found. Try adjusting your search query or run a new research
              </AlertDescription>
            </Alert>
          ) : (
            <div className="relative overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Keyword</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Search Volume</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">CPC</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Competition</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Difficulty</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, i) => (
                    <tr
                      key={`${result.keyword}-${i}`}
                      className="border-t bg-card text-card-foreground transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">{result.keyword}</td>
                      <td className="px-4 py-3">{formatNumber(result.search_volume)}</td>
                      <td className="px-4 py-3">${result.cpc.toFixed(2)}</td>
                      <td className="px-4 py-3">{(result.competition * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3">{result.keyword_difficulty}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${
                            result.competition_level === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : result.competition_level === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {result.competition_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
