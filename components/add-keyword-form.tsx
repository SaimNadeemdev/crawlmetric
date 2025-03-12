"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Info } from "lucide-react"
import { addKeyword } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { Keyword } from "@/types/keyword"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AddKeywordFormProps {
  onAddKeyword: (keyword: Keyword) => void
}

export function AddKeywordForm({ onAddKeyword }: AddKeywordFormProps) {
  const { toast } = useToast()
  const [keywordText, setKeywordText] = useState("")
  const [domain, setDomain] = useState("")
  const [location, setLocation] = useState("2840") // Default to United States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to clean domain input
  const cleanDomain = (input: string): string => {
    let cleaned = input.trim().toLowerCase()
    
    // Remove protocol (http:// or https://)
    cleaned = cleaned.replace(/^https?:\/\//, '')
    
    // Remove www. prefix
    cleaned = cleaned.replace(/^www\./, '')
    
    // Remove trailing slash
    cleaned = cleaned.replace(/\/$/, '')
    
    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keywordText.trim()) {
      setError("Keyword is required")
      return
    }

    if (!domain.trim()) {
      setError("Domain is required")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const cleanedDomain = cleanDomain(domain)
      
      const newKeyword = await addKeyword({
        keyword: keywordText.trim(),
        domain: cleanedDomain,
        location_code: location,
      })

      if (!newKeyword || !newKeyword.id) {
        throw new Error("Failed to add keyword")
      }

      onAddKeyword(newKeyword)
      setKeywordText("")
      setDomain("")
      toast({
        title: "Keyword added",
        description: `"${keywordText}" has been added to your tracking list.`,
      })
    } catch (error) {
      console.error("Error adding keyword:", error)
      setError("Failed to add keyword. Please try again.")
      toast({
        title: "Error",
        description: "There was an error adding your keyword. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="keyword" className="text-sm font-medium text-gray-700">
              Keyword
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help transition-colors duration-200 hover:text-[#0071e3]" />
                </TooltipTrigger>
                <TooltipContent className="bg-white border-gray-200 text-gray-800 rounded-xl shadow-lg">
                  <p className="max-w-xs">Enter the search term you want to track in search results</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="keyword"
            placeholder="e.g. best running shoes"
            value={keywordText}
            onChange={(e) => setKeywordText(e.target.value)}
            className="bg-white border-gray-200 rounded-xl focus:border-[#0071e3] focus:ring-[#0071e3]/20 transition-all duration-300 text-gray-900"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="domain" className="text-sm font-medium text-gray-700">
              Domain
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help transition-colors duration-200 hover:text-[#0071e3]" />
                </TooltipTrigger>
                <TooltipContent className="bg-white border-gray-200 text-gray-800 rounded-xl shadow-lg">
                  <p className="max-w-xs">Enter your domain name without http://, https://, or www prefix (e.g., example.com)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="domain"
            placeholder="e.g. example.com (no http:// or www)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="bg-white border-gray-200 rounded-xl focus:border-[#0071e3] focus:ring-[#0071e3]/20 transition-all duration-300 text-gray-900"
            disabled={isLoading}
          />
          {domain && domain !== cleanDomain(domain) && (
            <p className="text-xs text-[#0071e3] animate-fade-in">
              Will be processed as: {cleanDomain(domain)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Location
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 cursor-help transition-colors duration-200 hover:text-[#0071e3]" />
                </TooltipTrigger>
                <TooltipContent className="bg-white border-gray-200 text-gray-800 rounded-xl shadow-lg">
                  <p className="max-w-xs">Select the country where you want to track this keyword's ranking</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={location}
            onValueChange={setLocation}
            disabled={isLoading}
          >
            <SelectTrigger id="location" className="bg-white border-gray-200 rounded-xl focus:border-[#0071e3] focus:ring-[#0071e3]/20 transition-all duration-300 text-gray-900">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 rounded-xl shadow-lg">
              <SelectItem value="2840" className="focus:bg-gray-100 hover:bg-gray-100 focus:text-gray-900 hover:text-gray-900">United States</SelectItem>
              <SelectItem value="2826" className="focus:bg-gray-100 hover:bg-gray-100 focus:text-gray-900 hover:text-gray-900">United Kingdom</SelectItem>
              <SelectItem value="2124" className="focus:bg-gray-100 hover:bg-gray-100 focus:text-gray-900 hover:text-gray-900">Canada</SelectItem>
              <SelectItem value="2036" className="focus:bg-gray-100 hover:bg-gray-100 focus:text-gray-900 hover:text-gray-900">Australia</SelectItem>
              <SelectItem value="2276" className="focus:bg-gray-100 hover:bg-gray-100 focus:text-gray-900 hover:text-gray-900">Germany</SelectItem>
              <SelectItem value="2250" className="focus:bg-gray-100 hover:bg-gray-100 focus:text-gray-900 hover:text-gray-900">France</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 animate-pulse">{error}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] hover:from-[#0077ED] hover:to-[#47b3ff] transition-all duration-300 shadow-lg hover:shadow-[#0071e3]/20 transform hover:translate-y-[-2px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Keyword"
        )}
      </Button>
    </form>
  )
}
