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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

type ResearchMode =
  | "keyword_suggestions"
  | "keywords_for_site"
  | "historical_search_volume"
  | "bulk_keyword_difficulty"
  | "keyword_ideas"

export function KeywordResearchFixed() {
  // Form state
  const [mode, setMode] = useState<ResearchMode>("keyword_suggestions")
  const [keyword, setKeyword] = useState("")
  const [locationName, setLocationName] = useState("United States")
  const [languageName, setLanguageName] = useState("English")
  const [limit, setLimit] = useState(10)
  const [targetUrl, setTargetUrl] = useState("")
  const [bulkKeywords, setBulkKeywords] = useState("")

  // Results state
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timestamp, setTimestamp] = useState("")

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
    }
  }

  // Get request data based on mode
  const getRequestData = () => {
    switch (mode) {
      case "keywords_for_site":
        return [
          {
            target: targetUrl,
            location_name: locationName,
            language_name: languageName,
            limit,
          },
        ]
      case "bulk_keyword_difficulty":
        return [
          {
            keywords: bulkKeywords.split("\n").filter((k) => k.trim()),
            location_name: locationName,
            language_name: languageName,
          },
        ]
      case "historical_search_volume":
        return [
          {
            keyword: keyword,
            location_name: locationName,
            language_name: languageName,
          },
        ]
      case "keyword_ideas":
        return [
          {
            keyword: keyword,
            location_name: locationName,
            language_name: languageName,
            limit,
          },
        ]
      case "keyword_suggestions":
      default:
        return [
          {
            keyword: keyword,
            location_name: locationName,
            language_name: languageName,
            limit,
          },
        ]
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const requestData = getRequestData()
      console.log("Running keyword research with params:", { mode, ...requestData[0] })

      const response = await fetch("/api/dataforseo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: getEndpoint(mode),
          data: requestData,
        }),
      })

      const data = await response.json()
      console.log("API response:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch results")
      }

      // Ensure data.data is an array
      const resultsArray = Array.isArray(data.data) ? data.data : []
      setResults(resultsArray)
      setTimestamp(new Date().toLocaleString())
      console.log("Results set:", resultsArray)
    } catch (err: any) {
      console.error("Error fetching results:", err)
      setError(err.message)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Export results to CSV
  const handleExportCSV = () => {
    if (results.length === 0) return

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"
    const headers = Object.keys(results[0])
    csvContent += headers.join(",") + "\n"

    results.forEach((result) => {
      const values = headers.map((header) => {
        const value = result[header as keyof typeof result]
        return typeof value === "string" ? `"${value}"` : value
      })
      csvContent += values.join(",") + "\n"
    })

    import('@/utils/client-utils').then(({ downloadFile }) => {
      downloadFile(
        csvContent,
        `${mode}_${new Date().toISOString().split("T")[0]}.csv`,
        'text/csv;charset=utf-8;'
      );
    });
  }

  // Render form fields based on mode
  const renderModeFields = () => {
    switch (mode) {
      case "keywords_for_site":
        return (
          <div className="space-y-2">
            <Label htmlFor="target-url">Target URL</Label>
            <Input
              id="target-url"
              placeholder="Enter website URL (e.g., example.com)"
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
            <Select
              value={mode}
              onValueChange={(value: ResearchMode) => {
                setMode(value)
                setResults([]) // Clear results when changing modes
              }}
            >
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

          {mode !== "bulk_keyword_difficulty" && mode !== "historical_search_volume" && (
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
          )}

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
              <h2 className="text-2xl font-semibold tracking-tight">
                {mode
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {results.length} results found • {timestamp || "No search performed"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={!results.length}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-muted-foreground">Processing your request...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : results.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-medium">No results found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search query or run a new research</p>
            </div>
          ) : mode === "keywords_for_site" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Search Volume</TableHead>
                  <TableHead>Traffic</TableHead>
                  <TableHead>Traffic Cost</TableHead>
                  <TableHead>CPC</TableHead>
                  <TableHead>URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.keyword}</TableCell>
                    <TableCell>{result.position}</TableCell>
                    <TableCell>{result.search_volume.toLocaleString()}</TableCell>
                    <TableCell>{result.traffic.toLocaleString()}</TableCell>
                    <TableCell>${result.traffic_cost.toLocaleString()}</TableCell>
                    <TableCell>${result.cpc.toFixed(2)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{result.url}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : mode === "historical_search_volume" ? (
            <div className="space-y-8">
              {results.map((result, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <h3 className="mb-2 text-lg font-semibold">{result.keyword}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Current search volume: {result.search_volume.toLocaleString()}
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Search Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.historical_data.map((entry: { year: number; month: number; search_volume: number }, i: number) => (
                        <TableRow key={i}>
                          <TableCell>
                            {new Date(entry.year, entry.month - 1).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })}
                          </TableCell>
                          <TableCell>{entry.search_volume.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ) : mode === "bulk_keyword_difficulty" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Search Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.keyword}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Progress value={result.keyword_difficulty} className="w-[100px]" />
                        <span
                          className={
                            result.keyword_difficulty > 80
                              ? "text-red-500"
                              : result.keyword_difficulty > 60
                                ? "text-orange-500"
                                : result.keyword_difficulty > 40
                                  ? "text-yellow-500"
                                  : "text-green-500"
                          }
                        >
                          {result.keyword_difficulty}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{result.search_volume.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Search Volume</TableHead>
                  <TableHead>CPC</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.keyword}</TableCell>
                    <TableCell>{result.search_volume.toLocaleString()}</TableCell>
                    <TableCell>${result.cpc.toFixed(2)}</TableCell>
                    <TableCell>{(result.competition * 100).toFixed(0)}%</TableCell>
                    <TableCell>{result.keyword_difficulty}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
