"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, AlertTriangle, Globe, CheckCircle, XCircle, Info, ExternalLink, ArrowRight, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SiteAuditResults } from "./site-audit-results"
import { Switch } from "@/components/ui/switch"

export function FullSiteAuditForm() {
  const { startSiteAudit, siteAuditLoading, setActiveSiteAuditTask, siteAuditTasks, siteAuditSummary, activeSiteAuditTask } = useSeoAudit()
  const { toast } = useToast()
  const [target, setTarget] = useState("")
  const [maxPages, setMaxPages] = useState(100)
  const [maxDepth, setMaxDepth] = useState(3)
  const [includeSubdomains, setIncludeSubdomains] = useState(false)
  const [enableJavascript, setEnableJavascript] = useState(true)
  const [enableBrowserRendering, setEnableBrowserRendering] = useState(true)
  const [loadResources, setLoadResources] = useState(true)
  const [priorityUrls, setPriorityUrls] = useState("")
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true)
  const [followRedirects, setFollowRedirects] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [hoverOption, setHoverOption] = useState<string | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [isAuditComplete, setIsAuditComplete] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  // Advanced options
  const [customSitemap, setCustomSitemap] = useState("")
  const [checkSpell, setCheckSpell] = useState(true)
  const [checkDuplicates, setCheckDuplicates] = useState(true)
  const [measureKeywordDensity, setMeasureKeywordDensity] = useState(true)
  const [obtainRawHtml, setObtainRawHtml] = useState(true)
  const [checkBrokenLinks, setCheckBrokenLinks] = useState(true)
  const [checkBrokenResources, setCheckBrokenResources] = useState(true)
  const [checkInternalLinks, setCheckInternalLinks] = useState(true)
  const [checkExternalLinks, setCheckExternalLinks] = useState(true)
  const [pageScreenshot, setPageScreenshot] = useState(true)
  const [sitewideCheck, setSitewideCheck] = useState(true)
  const [highLoadingTimeThreshold, setHighLoadingTimeThreshold] = useState(3500)
  const [largePageSizeThreshold, setLargePageSizeThreshold] = useState(2000000)

  // Validate domain on change
  const validateDomain = (domain: string) => {
    if (!domain) return false
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  // Update validation state when target changes
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTarget(value)
    if (value.trim() === "") {
      setIsValid(null)
    } else {
      setIsValid(validateDomain(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!target) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain to audit.",
        variant: "destructive",
      })
      return
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(target)) {
      toast({
        title: "Invalid Domain",
        description: "Please enter a valid domain (e.g., example.com)",
        variant: "destructive",
      })
      return
    }

    // Parse priority URLs
    const priorityUrlsArray = priorityUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    // Validate priority URLs
    for (const url of priorityUrlsArray) {
      try {
        new URL(url)
      } catch (error) {
        toast({
          title: "Invalid Priority URL",
          description: `"${url}" is not a valid URL. Please include http:// or https://`,
          variant: "destructive",
        })
        return
      }
    }

    // Validate custom sitemap URL if provided
    if (customSitemap) {
      try {
        new URL(customSitemap)
      } catch (error) {
        toast({
          title: "Invalid Sitemap URL",
          description: "Please enter a valid sitemap URL including http:// or https://",
          variant: "destructive",
        })
        return
      }
    }

    try {
      console.log("Starting site audit for:", target)
      const options = {
        max_crawl_pages: maxPages,
        max_crawl_depth: maxDepth,
        include_subdomains: includeSubdomains,
        enable_javascript: enableJavascript,
        enable_browser_rendering: enableBrowserRendering,
        load_resources: loadResources,
        priority_urls: priorityUrlsArray.length > 0 ? priorityUrlsArray : undefined,
        respect_robots_txt: respectRobotsTxt,
        follow_redirects: followRedirects,
        
        // Include advanced options
        ...(customSitemap && { custom_sitemap: customSitemap }),
        check_spell: checkSpell,
        check_duplicates: checkDuplicates,
        measure_keyword_density: measureKeywordDensity,
        obtain_raw_html: obtainRawHtml,
        check_broken_links: checkBrokenLinks,
        check_broken_resources: checkBrokenResources,
        check_internal_links: checkInternalLinks,
        check_external_links: checkExternalLinks,
        page_screenshot: pageScreenshot,
        sitewide_check: sitewideCheck,
        thresholds: {
          high_loading_time: highLoadingTimeThreshold,
          large_page_size: largePageSizeThreshold
        }
      }
      console.log("Options:", options)

      const taskId = await startSiteAudit(target, options)

      if (taskId) {
        console.log(`Site audit started with task ID: ${taskId}`)
        toast({
          title: "Audit Started",
          description: `Site audit for ${target} has been initiated. You can view the progress in the Recent Audits section.`,
        })

        // Set this task as the active task
        setActiveSiteAuditTask(taskId)

        // Don't check status immediately - let the polling interval handle it
        setShowResults(true)
      } else {
        console.error("No task ID returned from startSiteAudit")
        throw new Error("Failed to start the site audit. No task ID was returned.")
      }
    } catch (err) {
      console.error("Error starting site audit:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Audit Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  // Check for active task on mount
  useEffect(() => {
    if (siteAuditTasks && siteAuditTasks.length > 0 && activeSiteAuditTask) {
      setShowResults(true);
    }
  }, [siteAuditTasks, activeSiteAuditTask]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-white/95 backdrop-blur-xl border border-gray-100/60 rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)]">
        <CardHeader className="pb-4 pt-8 px-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center shadow-md">
              <Globe className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold tracking-tight text-gray-900">Full Site Audit</CardTitle>
              <CardDescription className="text-base text-gray-500 mt-1">
                Crawl an entire website to identify SEO issues and opportunities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-7 px-8">
            <div className="space-y-3">
              <Label 
                htmlFor="target" 
                className="text-base font-medium text-gray-800 flex items-center gap-2"
              >
                Domain to Audit
              </Label>
              <div className="relative">
                <motion.div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none z-0 ${
                    isFocused ? "shadow-[0_0_0_3px_rgba(0,113,227,0.3)]" : ""
                  } ${
                    isValid === true && target.length > 0
                      ? "shadow-[0_0_0_2px_rgba(34,197,94,0.2)]"
                      : isValid === false && target.length > 0
                        ? "shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                        : ""
                  }`}
                  animate={
                    isFocused
                      ? {
                          boxShadow: [
                            "0 0 0 3px rgba(0,113,227,0.1)",
                            "0 0 0 3px rgba(0,113,227,0.3)",
                          ],
                        }
                      : {}
                  }
                  transition={
                    isFocused
                      ? {
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 2,
                        }
                      : {}
                  }
                />
                <Input
                  id="target"
                  name="target"
                  value={target}
                  onChange={handleTargetChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={siteAuditLoading}
                  className={`h-12 border-[#d2d2d7] rounded-xl pl-4 pr-10 py-2.5 transition-all duration-300 text-base ${
                    isValid === true && target.length > 0
                      ? "border-green-300 focus:border-green-400"
                      : isValid === false && target.length > 0
                        ? "border-red-300 focus:border-red-400"
                        : "focus:border-[#0071e3] focus:ring-[#0071e3]/20"
                  }`}
                />
                <AnimatePresence>
                  {target.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-sm text-gray-500 pl-1">
                Enter the domain without http:// or https://
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxPages" className="text-base font-medium text-gray-800">
                    Maximum Pages to Crawl
                  </Label>
                  <motion.span 
                    className="text-sm font-medium text-[#0071e3] bg-[#0071e3]/5 px-2.5 py-1 rounded-full"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3, times: [0, 0.5, 1] }}
                    key={maxPages}
                  >
                    {maxPages}
                  </motion.span>
                </div>
                <div className="px-1 py-2">
                  <Slider
                    id="maxPages"
                    min={10}
                    max={500}
                    step={10}
                    value={[maxPages]}
                    onValueChange={(value) => setMaxPages(value[0])}
                    disabled={siteAuditLoading}
                    className="[&>.SliderTrack]:h-2 [&>.SliderTrack]:bg-[#f5f5f7] [&>.SliderTrack>.SliderRange]:bg-[#0071e3] [&>.SliderThumb]:h-6 [&>.SliderThumb]:w-6 [&>.SliderThumb]:border-2 [&>.SliderThumb]:border-[#0071e3] [&>.SliderThumb]:bg-white [&>.SliderThumb]:shadow-md"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10</span>
                  <span>500</span>
                </div>
                <p className="text-sm text-gray-500 pl-1">
                  Limit the number of pages to crawl (10-500)
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxDepth" className="text-base font-medium text-gray-800">
                    Maximum Crawl Depth
                  </Label>
                  <motion.span 
                    className="text-sm font-medium text-[#0071e3] bg-[#0071e3]/5 px-2.5 py-1 rounded-full"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3, times: [0, 0.5, 1] }}
                    key={maxDepth}
                  >
                    {maxDepth}
                  </motion.span>
                </div>
                <div className="px-1 py-2">
                  <Slider
                    id="maxDepth"
                    min={1}
                    max={10}
                    step={1}
                    value={[maxDepth]}
                    onValueChange={(value) => setMaxDepth(value[0])}
                    disabled={siteAuditLoading}
                    className="[&>.SliderTrack]:h-2 [&>.SliderTrack]:bg-[#f5f5f7] [&>.SliderTrack>.SliderRange]:bg-[#0071e3] [&>.SliderThumb]:h-6 [&>.SliderThumb]:w-6 [&>.SliderThumb]:border-2 [&>.SliderThumb]:border-[#0071e3] [&>.SliderThumb]:bg-white [&>.SliderThumb]:shadow-md"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>10</span>
                </div>
                <p className="text-sm text-gray-500 pl-1">
                  Limit the depth of the crawl (1-10)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="priorityUrls" className="text-base font-medium text-gray-800 flex items-center gap-2">
                  Priority URLs (Optional)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg max-w-xs">
                        <p className="text-sm text-gray-700">
                          These URLs will be crawled first before the regular crawl begins. Include full URLs with http:// or https://
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
              <Textarea
                id="priorityUrls"
                placeholder="https://example.com/important-page-1&#10;https://example.com/important-page-2"
                value={priorityUrls}
                onChange={(e) => setPriorityUrls(e.target.value)}
                disabled={siteAuditLoading}
                className="min-h-[100px] border-[#d2d2d7] rounded-xl focus:border-[#0071e3] focus:ring-[#0071e3]/20 transition-all duration-300 text-base"
              />
              <p className="text-sm text-gray-500 pl-1">
                Enter URLs (one per line) that should be crawled first
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100"
                >
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 pt-2">
              <Label className="text-base font-medium text-gray-800">Crawl Options</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.div 
                  className={`flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl transition-all duration-200 ${hoverOption === 'includeSubdomains' ? 'bg-[#f0f0f5] shadow-sm' : ''}`}
                  onMouseEnter={() => setHoverOption('includeSubdomains')}
                  onMouseLeave={() => setHoverOption(null)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Checkbox
                    id="includeSubdomains"
                    checked={includeSubdomains}
                    onCheckedChange={(checked) => setIncludeSubdomains(checked === true)}
                    disabled={siteAuditLoading}
                    className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                  />
                  <Label htmlFor="includeSubdomains" className="text-sm font-medium cursor-pointer">
                    Include Subdomains
                  </Label>
                </motion.div>
                
                <motion.div 
                  className={`flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl transition-all duration-200 ${hoverOption === 'respectRobotsTxt' ? 'bg-[#f0f0f5] shadow-sm' : ''}`}
                  onMouseEnter={() => setHoverOption('respectRobotsTxt')}
                  onMouseLeave={() => setHoverOption(null)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Checkbox
                    id="respectRobotsTxt"
                    checked={respectRobotsTxt}
                    onCheckedChange={(checked) => setRespectRobotsTxt(checked === true)}
                    disabled={siteAuditLoading}
                    className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                  />
                  <Label htmlFor="respectRobotsTxt" className="text-sm font-medium cursor-pointer">
                    Respect robots.txt
                  </Label>
                </motion.div>
                
                <motion.div 
                  className={`flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl transition-all duration-200 ${hoverOption === 'followRedirects' ? 'bg-[#f0f0f5] shadow-sm' : ''}`}
                  onMouseEnter={() => setHoverOption('followRedirects')}
                  onMouseLeave={() => setHoverOption(null)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Checkbox
                    id="followRedirects"
                    checked={followRedirects}
                    onCheckedChange={(checked) => setFollowRedirects(checked === true)}
                    disabled={siteAuditLoading}
                    className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                  />
                  <Label htmlFor="followRedirects" className="text-sm font-medium cursor-pointer">
                    Follow Redirects
                  </Label>
                </motion.div>
                
                <motion.div 
                  className={`flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl transition-all duration-200 ${hoverOption === 'enableJavascript' ? 'bg-[#f0f0f5] shadow-sm' : ''}`}
                  onMouseEnter={() => setHoverOption('enableJavascript')}
                  onMouseLeave={() => setHoverOption(null)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Checkbox
                    id="enableJavascript"
                    checked={enableJavascript}
                    onCheckedChange={(checked) => setEnableJavascript(checked === true)}
                    disabled={siteAuditLoading}
                    className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                  />
                  <Label htmlFor="enableJavascript" className="text-sm font-medium cursor-pointer">
                    Enable JavaScript
                  </Label>
                </motion.div>
                
                <motion.div 
                  className={`flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl transition-all duration-200 ${hoverOption === 'enableBrowserRendering' ? 'bg-[#f0f0f5] shadow-sm' : ''}`}
                  onMouseEnter={() => setHoverOption('enableBrowserRendering')}
                  onMouseLeave={() => setHoverOption(null)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Checkbox
                    id="enableBrowserRendering"
                    checked={enableBrowserRendering}
                    onCheckedChange={(checked) => setEnableBrowserRendering(checked === true)}
                    disabled={siteAuditLoading}
                    className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                  />
                  <Label htmlFor="enableBrowserRendering" className="text-sm font-medium cursor-pointer">
                    Enable Browser Rendering
                  </Label>
                </motion.div>
                
                <motion.div 
                  className={`flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl transition-all duration-200 ${hoverOption === 'loadResources' ? 'bg-[#f0f0f5] shadow-sm' : ''}`}
                  onMouseEnter={() => setHoverOption('loadResources')}
                  onMouseLeave={() => setHoverOption(null)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Checkbox
                    id="loadResources"
                    checked={loadResources}
                    onCheckedChange={(checked) => setLoadResources(checked === true)}
                    disabled={siteAuditLoading}
                    className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                  />
                  <Label htmlFor="loadResources" className="text-sm font-medium cursor-pointer">
                    Load Resources
                  </Label>
                </motion.div>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="pt-3">
              <motion.button
                type="button"
                className="flex items-center justify-between w-full p-4 bg-[#f5f5f7] rounded-xl hover:bg-[#f0f0f5] transition-all duration-200"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-[#0071e3]" />
                  <span className="text-base font-medium text-gray-800">Advanced Options</span>
                </div>
                <div>
                  {showAdvancedOptions ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </motion.button>
            </div>

            {/* Advanced Options Content */}
            <AnimatePresence>
              {showAdvancedOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6 overflow-hidden"
                >
                  {/* Custom Sitemap URL */}
                  <div className="space-y-3">
                    <Label 
                      htmlFor="customSitemap" 
                      className="text-base font-medium text-gray-800 flex items-center gap-2"
                    >
                      Custom Sitemap URL (Optional)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg max-w-xs">
                            <p className="text-sm text-gray-700">
                              Provide a custom sitemap URL to use instead of the default sitemap.xml
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="customSitemap"
                      placeholder="https://example.com/sitemap.xml"
                      value={customSitemap}
                      onChange={(e) => setCustomSitemap(e.target.value)}
                      disabled={siteAuditLoading}
                      className="h-12 border-[#d2d2d7] rounded-xl focus:border-[#0071e3] focus:ring-[#0071e3]/20 transition-all duration-300 text-base"
                    />
                    <p className="text-sm text-gray-500 pl-1">
                      Enter the full URL to your sitemap
                    </p>
                  </div>

                  {/* Check Options */}
                  <div className="space-y-3">
                    <Label 
                      htmlFor="checkSpell" 
                      className="text-base font-medium text-gray-800 flex items-center gap-2"
                    >
                      Check Spell (Optional)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg max-w-xs">
                            <p className="text-sm text-gray-700">
                              Check for spelling errors in the content
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="checkSpell"
                        checked={checkSpell}
                        onCheckedChange={(checked) => setCheckSpell(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="checkSpell" className="text-sm font-medium cursor-pointer">
                        Check for spelling errors
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="checkDuplicates"
                        checked={checkDuplicates}
                        onCheckedChange={(checked) => setCheckDuplicates(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="checkDuplicates" className="text-sm font-medium cursor-pointer">
                        Check for duplicate content
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="measureKeywordDensity"
                        checked={measureKeywordDensity}
                        onCheckedChange={(checked) => setMeasureKeywordDensity(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="measureKeywordDensity" className="text-sm font-medium cursor-pointer">
                        Measure keyword density
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="obtainRawHtml"
                        checked={obtainRawHtml}
                        onCheckedChange={(checked) => setObtainRawHtml(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="obtainRawHtml" className="text-sm font-medium cursor-pointer">
                        Obtain raw HTML
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="checkBrokenLinks"
                        checked={checkBrokenLinks}
                        onCheckedChange={(checked) => setCheckBrokenLinks(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="checkBrokenLinks" className="text-sm font-medium cursor-pointer">
                        Check broken links
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="checkBrokenResources"
                        checked={checkBrokenResources}
                        onCheckedChange={(checked) => setCheckBrokenResources(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="checkBrokenResources" className="text-sm font-medium cursor-pointer">
                        Check broken resources
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="checkInternalLinks"
                        checked={checkInternalLinks}
                        onCheckedChange={(checked) => setCheckInternalLinks(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="checkInternalLinks" className="text-sm font-medium cursor-pointer">
                        Check internal links
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="checkExternalLinks"
                        checked={checkExternalLinks}
                        onCheckedChange={(checked) => setCheckExternalLinks(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="checkExternalLinks" className="text-sm font-medium cursor-pointer">
                        Check external links
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="pageScreenshot"
                        checked={pageScreenshot}
                        onCheckedChange={(checked) => setPageScreenshot(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="pageScreenshot" className="text-sm font-medium cursor-pointer">
                        Take page screenshots
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 bg-[#f5f5f7] p-4 rounded-xl">
                      <Checkbox
                        id="sitewideCheck"
                        checked={sitewideCheck}
                        onCheckedChange={(checked) => setSitewideCheck(checked === true)}
                        disabled={siteAuditLoading}
                        className="h-5 w-5 rounded-md border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                      />
                      <Label htmlFor="sitewideCheck" className="text-sm font-medium cursor-pointer">
                        Perform sitewide check
                      </Label>
                    </div>
                  </div>

                  {/* Thresholds */}
                  <div className="space-y-4 pt-2">
                    <Label className="text-base font-medium text-gray-800">Performance Thresholds</Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="highLoadingTimeThreshold" className="text-sm font-medium text-gray-800">
                          High Loading Time Threshold (ms)
                        </Label>
                        <motion.span 
                          className="text-sm font-medium text-[#0071e3] bg-[#0071e3]/5 px-2.5 py-1 rounded-full"
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 0.3, times: [0, 0.5, 1] }}
                          key={highLoadingTimeThreshold}
                        >
                          {highLoadingTimeThreshold}
                        </motion.span>
                      </div>
                      <div className="px-1 py-2">
                        <Slider
                          id="highLoadingTimeThreshold"
                          min={1000}
                          max={10000}
                          step={500}
                          value={[highLoadingTimeThreshold]}
                          onValueChange={(value) => setHighLoadingTimeThreshold(value[0])}
                          disabled={siteAuditLoading}
                          className="[&>.SliderTrack]:h-2 [&>.SliderTrack]:bg-[#f5f5f7] [&>.SliderTrack>.SliderRange]:bg-[#0071e3] [&>.SliderThumb]:h-6 [&>.SliderThumb]:w-6 [&>.SliderThumb]:border-2 [&>.SliderThumb]:border-[#0071e3] [&>.SliderThumb]:bg-white [&>.SliderThumb]:shadow-md"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1000ms</span>
                        <span>10000ms</span>
                      </div>
                      <p className="text-sm text-gray-500 pl-1">
                        Pages loading slower than this threshold will be flagged as slow
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="largePageSizeThreshold" className="text-sm font-medium text-gray-800">
                          Large Page Size Threshold (bytes)
                        </Label>
                        <motion.span 
                          className="text-sm font-medium text-[#0071e3] bg-[#0071e3]/5 px-2.5 py-1 rounded-full"
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 0.3, times: [0, 0.5, 1] }}
                          key={largePageSizeThreshold}
                        >
                          {(largePageSizeThreshold / 1000000).toFixed(1)}MB
                        </motion.span>
                      </div>
                      <div className="px-1 py-2">
                        <Slider
                          id="largePageSizeThreshold"
                          min={500000}
                          max={5000000}
                          step={500000}
                          value={[largePageSizeThreshold]}
                          onValueChange={(value) => setLargePageSizeThreshold(value[0])}
                          disabled={siteAuditLoading}
                          className="[&>.SliderTrack]:h-2 [&>.SliderTrack]:bg-[#f5f5f7] [&>.SliderTrack>.SliderRange]:bg-[#0071e3] [&>.SliderThumb]:h-6 [&>.SliderThumb]:w-6 [&>.SliderThumb]:border-2 [&>.SliderThumb]:border-[#0071e3] [&>.SliderThumb]:bg-white [&>.SliderThumb]:shadow-md"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0.5MB</span>
                        <span>5MB</span>
                      </div>
                      <p className="text-sm text-gray-500 pl-1">
                        Pages larger than this threshold will be flagged as too large
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="pt-2 pb-8 px-8 flex flex-col sm:flex-row items-center gap-4">
            <motion.div 
              className="w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button 
                type="submit" 
                className="w-full sm:w-auto h-12 bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white font-medium px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-base"
                disabled={siteAuditLoading}
              >
                {siteAuditLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Starting Audit...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Start Site Audit</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </motion.div>
            
            {siteAuditTasks && siteAuditTasks.length > 0 && !siteAuditLoading && siteAuditSummary && siteAuditSummary.crawl_progress === "finished" && (
              <div className="w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto h-12 flex items-center gap-2 bg-white border border-[#d2d2d7] rounded-xl text-[#0071e3] hover:bg-[#0071e3]/5 transition-all duration-300 text-base"
                  onClick={() => {
                    // Set the most recent task as active when viewing results
                    if (siteAuditTasks && siteAuditTasks.length > 0) {
                      setActiveSiteAuditTask(siteAuditTasks[0].id);
                    }
                  }}
                >
                  <ExternalLink className="h-5 w-5" />
                  View Results
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
        {showResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="px-8 pb-8"
          >
            <div className="border-t border-gray-100 my-4"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center shadow-md">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900">Live Audit Results</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {siteAuditSummary ? 
                    `Status: ${siteAuditSummary.crawl_progress === "finished" ? "Complete" : "In Progress"}` : 
                    "Initializing audit..."}
                </p>
              </div>
            </div>
            <SiteAuditResults />
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}