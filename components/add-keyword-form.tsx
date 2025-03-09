"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"
import { addKeyword } from "@/lib/api"
import type { Keyword } from "@/types/keyword"

interface AddKeywordFormProps {
  onAddKeyword: (keyword: Keyword) => void
}

export function AddKeywordForm({ onAddKeyword }: AddKeywordFormProps) {
  const [keyword, setKeyword] = useState("")
  const [domain, setDomain] = useState("")
  const [location, setLocation] = useState("United States")
  const [language, setLanguage] = useState("English")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const onSubmit = async (values: { keyword: string; domain: string; location: string; language: string }) => {
    try {
      const { keyword, domain, location, language } = values

      // Basic validation
      if (!keyword || !domain) {
        toast({
          title: "Missing fields",
          description: "Keyword and domain are required",
          variant: "destructive",
        })
        return
      }

      // Clean up domain input
      let cleanDomain = domain.trim().toLowerCase()

      // Add https:// if no protocol specified
      if (!cleanDomain.startsWith("http://") && !cleanDomain.startsWith("https://")) {
        cleanDomain = `https://${cleanDomain}`
      }

      // Remove trailing slash if present
      if (cleanDomain.endsWith("/")) {
        cleanDomain = cleanDomain.slice(0, -1)
      }

      setIsLoading(true)

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 30000),
      )

      try {
        // Create the actual request
        const addKeywordPromise = addKeyword({
          keyword: keyword.trim(),
          domain: cleanDomain,
          location_name: location,
          language_name: language,
        })

        // Race between the request and the timeout
        const newKeyword = await Promise.race([addKeywordPromise, timeoutPromise])

        // Validate the response
        if (!newKeyword || !newKeyword.id) {
          throw new Error("Failed to add keyword - received invalid response")
        }

        // Call the callback
        onAddKeyword(newKeyword)

        // Show success message
        toast({
          title: "Keyword added",
          description: `Successfully added "${keyword}" for ${cleanDomain}`,
        })

        // Reset form
        setKeyword("")
        setDomain("")
      } catch (error: any) {
        console.error("Error adding keyword:", error)

        // Check if it's a duplicate keyword error
        if (error.message && error.message.includes("already being tracked")) {
          toast({
            title: "Duplicate keyword",
            description: "This keyword is already being tracked for this domain.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error adding keyword",
            description: error.message || "An unexpected error occurred",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Unexpected error in form submission:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => onSubmit({ keyword, domain, location, language })} className="space-y-6 pt-6">
      <div className="space-y-2">
        <Label htmlFor="keyword">Keyword</Label>
        <Input
          id="keyword"
          placeholder="e.g. best running shoes"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          placeholder="e.g. example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">Enter your domain without http:// or https://</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g. United States"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Input
          id="language"
          placeholder="e.g. English"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Adding a keyword will immediately check its current ranking using the DataForSEO API.
          This may take a moment to complete.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking Ranking...
          </>
        ) : (
          "Add Keyword"
        )}
      </Button>
    </form>
  )
}
