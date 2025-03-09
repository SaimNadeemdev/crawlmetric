"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Download, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Helper function to format numbers
const formatNumber = (num) => {
  if (num === 0 || !num) return "0"
  return new Intl.NumberFormat().format(num)
}

export function ResultsPanel({ results = [], isLoading, timestamp, error }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredResults, setFilteredResults] = useState([])

  // Debug logging
  useEffect(() => {
    console.log("ResultsPanel received results:", results)
    console.log("Results length:", results?.length)
  }, [results])

  // Update filtered results when results or search query changes
  useEffect(() => {
    if (!results || !Array.isArray(results)) {
      console.log("Results is not an array, setting filtered results to empty array")
      setFilteredResults([])
      return
    }

    const filtered = results.filter((result) => result?.keyword?.toLowerCase().includes(searchQuery.toLowerCase()))
    console.log("Filtered results:", filtered)
    setFilteredResults(filtered)
  }, [results, searchQuery])

  const exportToCsv = () => {
    if (!filteredResults.length) return

    const headers = ["Keyword", "Search Volume", "CPC", "Competition", "Difficulty", "Level"]
    const csvData = [
      headers.join(","),
      ...filteredResults.map((result) =>
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

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `keyword-research-${new Date().toISOString()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Processing...</div>
      </div>
    )
  }

  // Debug rendering
  console.log("Rendering ResultsPanel with:", {
    resultsLength: results?.length,
    filteredResultsLength: filteredResults?.length,
    hasResults: Array.isArray(results) && results.length > 0,
  })

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Keyword Suggestions</h2>
          <p className="text-sm text-muted-foreground">
            {Array.isArray(results) ? results.length : 0} results found • {timestamp || "No search performed"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportToCsv} variant="outline" size="sm" disabled={!filteredResults.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Input
          placeholder="Search results..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          disabled={!Array.isArray(results) || results.length === 0}
        />
      </div>

      {/* Simplified conditional rendering */}
      {!Array.isArray(results) || results.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No results found. Try adjusting your search query or run a new research</AlertDescription>
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
  )
}

