"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function ResearchPanel({ onSubmit }) {
  const [mode, setMode] = useState("keyword_suggestions")
  const [keyword, setKeyword] = useState("")
  const [locationName, setLocationName] = useState("United States")
  const [languageName, setLanguageName] = useState("English")
  const [limit, setLimit] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!keyword.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        mode,
        keyword,
        locationName,
        languageName,
        limit,
      })
    } catch (error) {
      console.error("Error submitting research:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger id="research-mode">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keyword_suggestions">Keyword Suggestions</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Running Research..." : "Run Research"}
        </Button>
      </form>
    </div>
  )
}

