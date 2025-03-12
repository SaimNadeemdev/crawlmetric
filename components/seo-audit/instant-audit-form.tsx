"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSeoAudit } from "@/contexts/seo-audit-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle, Search, CheckCircle, XCircle, ExternalLink, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InstantAuditResults } from "./instant-audit-results"

export function InstantAuditForm() {
  const { runInstantAudit, instantAuditLoading, instantAuditResults, instantAuditError } = useSeoAudit()
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [enableJavascript, setEnableJavascript] = useState(true)
  const [enableBrowserRendering, setEnableBrowserRendering] = useState(true)
  const [loadResources, setLoadResources] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Validate URL on change
  useEffect(() => {
    if (url.trim() === "") {
      setIsValid(null)
      return
    }
    setIsValid(validateUrl(url))
  }, [url])

  const validateUrl = (url: string) => {
    // Basic URL validation
    try {
      // If URL doesn't have protocol, add https://
      let testUrl = url
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        testUrl = `https://${url}`
      }

      new URL(testUrl)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Clean the URL
    let cleanUrl = url.trim()

    // Validate URL
    if (!cleanUrl) {
      setError("Please enter a URL")
      toast({
        title: "URL Required",
        description: "Please enter a URL to audit",
        variant: "destructive",
      })
      return
    }

    if (!validateUrl(cleanUrl)) {
      setError("Please enter a valid URL (e.g., example.com or https://example.com)")
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    try {
      // If URL doesn't have protocol, add https://
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl}`
      }

      await runInstantAudit([cleanUrl], {
        enable_javascript: enableJavascript,
        enable_browser_rendering: enableBrowserRendering,
        load_resources: loadResources,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred while running the audit"

      setError(errorMessage)
      toast({
        title: "Audit Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6"
    >
      <Card className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[24px] overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)]">
        <CardHeader className="pb-4 pt-8 px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center shadow-sm">
              <Search className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                Instant Page Audit
              </CardTitle>
              <CardDescription className="text-base text-gray-500 mt-1">
                Analyze a single page for SEO issues and performance metrics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-8">
            <div className="space-y-3">
              <Label htmlFor="url" className="text-base font-medium text-gray-800 flex items-center gap-2">
                URL to Audit
              </Label>
              <div className="relative">
                <motion.div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none z-0 ${
                    isFocused ? "shadow-[0_0_0_3px_rgba(0,113,227,0.3)]" : ""
                  } ${
                    isValid === true && url.length > 0
                      ? "shadow-[0_0_0_2px_rgba(34,197,94,0.2)]"
                      : isValid === false && url.length > 0
                        ? "shadow-[0_0_0_2px_rgba(239,68,68,0.2)]"
                        : ""
                  }`}
                  animate={
                    isFocused
                      ? {
                          boxShadow: [
                            "0 0 0 3px rgba(0,113,227,0.1)",
                            "0 0 0 3px rgba(0,113,227,0.3)",
                            "0 0 0 3px rgba(0,113,227,0.1)",
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
                  id="url"
                  placeholder="example.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={instantAuditLoading}
                  className={`relative z-10 h-12 border-gray-200 rounded-xl pl-4 pr-10 py-2.5 transition-all duration-300 text-base ${
                    isValid === true && url.length > 0
                      ? "border-green-300 focus:border-green-400"
                      : isValid === false && url.length > 0
                        ? "border-red-300 focus:border-red-400"
                        : "focus:border-[#0071e3]"
                  }`}
                />
                <AnimatePresence>
                  {url.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none"
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
                Enter a domain or full URL. If protocol is omitted, https:// will be used.
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
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 pt-2">
              <Label className="text-base font-medium text-gray-800">Audit Options</Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <motion.div
                  className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl transition-all duration-200 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  whileTap={{ y: 0 }}
                >
                  <Checkbox
                    id="enableJavascript"
                    checked={enableJavascript}
                    onCheckedChange={(checked) => setEnableJavascript(checked === true)}
                    disabled={instantAuditLoading}
                    className="h-5 w-5 rounded-md border-gray-300 text-[#0071e3] focus:ring-[#0071e3]"
                  />
                  <Label htmlFor="enableJavascript" className="text-sm font-medium cursor-pointer">
                    Enable JavaScript
                  </Label>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl transition-all duration-200 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  whileTap={{ y: 0 }}
                >
                  <Checkbox
                    id="enableBrowserRendering"
                    checked={enableBrowserRendering}
                    onCheckedChange={(checked) => setEnableBrowserRendering(checked === true)}
                    disabled={instantAuditLoading}
                    className="h-5 w-5 rounded-md border-gray-300 text-[#0071e3] focus:ring-[#0071e3]"
                  />
                  <Label htmlFor="enableBrowserRendering" className="text-sm font-medium cursor-pointer">
                    Enable Browser Rendering
                  </Label>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl transition-all duration-200 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  whileTap={{ y: 0 }}
                >
                  <Checkbox
                    id="loadResources"
                    checked={loadResources}
                    onCheckedChange={(checked) => setLoadResources(checked === true)}
                    disabled={instantAuditLoading}
                    className="h-5 w-5 rounded-md border-gray-300 text-[#0071e3] focus:ring-[#0071e3]"
                  />
                  <Label htmlFor="loadResources" className="text-sm font-medium cursor-pointer">
                    Load Resources
                  </Label>
                </motion.div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 pb-8 px-8 flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
              className="w-full sm:w-auto"
            >
              <Button
                type="submit"
                className="w-full sm:w-auto h-12 bg-gradient-to-r from-[#0071e3] to-[#40a9ff] hover:from-[#0077ED] hover:to-[#4DB2FF] text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={instantAuditLoading}
              >
                {instantAuditLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Auditing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Run Audit</span>
                    <motion.div
                      animate={isHovering ? { x: [0, 4, 0] } : { x: 0 }}
                      transition={{ repeat: isHovering ? Number.POSITIVE_INFINITY : 0, duration: 1 }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </div>
                )}
              </Button>
            </motion.div>

            {instantAuditResults && !instantAuditLoading && (
              <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto h-12 flex items-center gap-2 bg-white border border-gray-200 rounded-xl text-[#0071e3] hover:bg-[#0071e3]/5 transition-all duration-300 font-medium px-6 py-3"
                      onClick={() => setShowResultsDialog(true)}
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>View Results</span>
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[24px] p-0">
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 rounded-t-[24px] p-6">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] flex items-center justify-center shadow-sm">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                        <span>Audit Results for {url}</span>
                      </DialogTitle>
                    </DialogHeader>
                  </div>
                  <div className="p-6">
                    <InstantAuditResults />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}

