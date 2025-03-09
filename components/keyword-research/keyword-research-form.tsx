"use client"

import type React from "react"

import { useState } from "react"
import { useKeywordResearch } from "@/contexts/keyword-research-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, AlertTriangle, History } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import type { KeywordResearchMode, KeywordResearchParams } from "@/types/keyword-research"
import { useRouter } from "next/navigation"

export function KeywordResearchForm() {
  const { runKeywordResearch, isLoading, error } = useKeywordResearch()
  const router = useRouter()

  // Form state
  const [mode, setMode] = useState<KeywordResearchMode>("keyword_suggestions")
  const [keyword, setKeyword] = useState("")
  const [keywordsText, setKeywordsText] = useState("")
  const [target, setTarget] = useState("")
  const [category, setCategory] = useState("")
  const [locationName, setLocationName] = useState("United States")
  const [languageName, setLanguageName] = useState("English")
  const [limit, setLimit] = useState(50)

  // Determine which input fields to show based on the selected mode
  const showKeywordInput = ["keyword_suggestions", "keyword_trends", "serp_competitors", "keyword_ideas"].includes(mode)
  const showKeywordsInput = ["historical_search_volume", "bulk_keyword_difficulty", "search_intent"].includes(mode)
  const showTargetInput = mode === "keywords_for_site"
  const showCategoryInput = mode === "keywords_for_categories"
  const showLimitInput = [
    "keyword_suggestions",
    "keywords_for_site",
    "keywords_for_categories",
    "keyword_ideas",
  ].includes(mode)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Prepare keywords array if needed
      let keywords: string[] | undefined
      if (showKeywordsInput && keywordsText) {
        keywords = keywordsText
          .split("\n")
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      }

      // Validate inputs
      if (showKeywordInput && !keyword) {
        throw new Error("Keyword is required")
      }

      if (showKeywordsInput && (!keywords || keywords.length === 0)) {
        throw new Error("At least one keyword is required")
      }

      if (showTargetInput && !target) {
        throw new Error("Target domain is required")
      }

      if (showCategoryInput && !category) {
        throw new Error("Category is required")
      }

      // Prepare params
      const params: KeywordResearchParams = {
        mode,
        locationName,
        languageName,
      }

      // Add optional params based on mode
      if (showKeywordInput) params.keyword = keyword
      if (showKeywordsInput) params.keywords = keywords
      if (showTargetInput) params.target = target
      if (showCategoryInput) params.category = category
      if (showLimitInput) params.limit = limit

      console.log("Running keyword research with params:", params)

      // Run the research
      await runKeywordResearch(params)
    } catch (error) {
      console.error("Form submission error:", error)
      // The error will be handled by the context and displayed to the user
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Keyword Research</CardTitle>
            <CardDescription>Discover new keyword opportunities and analyze existing keyword data</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/keyword-research/history")}
            className="flex items-center"
          >
            <History className="mr-2 h-4 w-4" />
            View History
          </Button>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mode">Research Mode</Label>
            <Select value={mode} onValueChange={(value) => setMode(value as KeywordResearchMode)} disabled={isLoading}>
              <SelectTrigger id="mode">
                <SelectValue placeholder="Select research mode" />
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

          {showKeywordInput && (
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                placeholder="Enter a keyword (e.g., digital marketing)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {showKeywordsInput && (
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (one per line)</Label>
              <Textarea
                id="keywords"
                placeholder="Enter keywords (one per line)"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                disabled={isLoading}
                className="min-h-[100px]"
              />
            </div>
          )}

          {showTargetInput && (
            <div className="space-y-2">
              <Label htmlFor="target">Target Domain</Label>
              <Input
                id="target"
                placeholder="Enter a domain (e.g., example.com)"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          {showCategoryInput && (
            <div className="space-y-2">
              <Label htmlFor="category">Category Code</Label>
              <Input
                id="category"
                placeholder="Enter a category code (e.g., 12345)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Category codes can be found using the DataForSEO API categories endpoint
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter a location (e.g., United States)"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              placeholder="Enter a language (e.g., English)"
              value={languageName}
              onChange={(e) => setLanguageName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {showLimitInput && (
            <div className="space-y-2">
              <Label htmlFor="limit">Result Limit: {limit}</Label>
              <Slider
                id="limit"
                min={10}
                max={100}
                step={10}
                value={[limit]}
                onValueChange={(value) => setLimit(value[0])}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">Limit the number of results (10-100)</p>
            </div>
          )}

          {mode === "bulk_keyword_difficulty" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm mt-2">
              <p>
                Note: For bulk keyword difficulty analysis, enter each keyword on a new line. The API will analyze the
                difficulty score for each keyword.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                <p className="text-xs mt-1">
                  If you're seeing API errors, the DataForSEO API might be experiencing issues. The application will
                  attempt to provide fallback data.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              "Run Research"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
