"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { startSiteAudit } from "./actions"
import { Globe, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function SiteAuditForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [glowColor, setGlowColor] = useState("#0071e3")
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Set mounted state for client-side animations
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animated glow effect
  useEffect(() => {
    if (!mounted) return

    const colors = [
      "#0071e3", // Apple blue
      "#3a86ff", // Light blue
      "#5390d9", // Sky blue
    ]

    let colorIndex = 0
    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length
      setGlowColor(colors[colorIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [mounted])

  // Validate URL format
  const validateUrl = (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    setIsValid(validateUrl(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url || !validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including https:// or http://",
        variant: "destructive",
      })
      setIsValid(false)
      return
    }

    setIsLoading(true)

    try {
      const result = await startSiteAudit(url)

      if (result.success) {
        toast({
          title: "Audit Started",
          description: "Your site audit has been initiated. You'll be redirected to the results page.",
        })

        // Redirect to the results page with the task ID
        router.push(`/services/site-audit/results?taskId=${result.taskId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start site audit",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div
            className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100"
            style={{
              boxShadow: `0 10px 40px -10px rgba(0,0,0,0.1), 0 0 15px 2px ${glowColor}20`,
              transition: "box-shadow 1.5s ease-in-out",
            }}
          >
            <div className="px-8 py-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#40a9ff] shadow-md">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Site Audit</h2>
                  <p className="text-base text-gray-500 mt-1">Analyze your website for SEO and performance issues</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="url" className="text-base font-medium text-gray-800 flex items-center gap-2">
                    Website URL
                    {url && (
                      <AnimatePresence>
                        {isValid ? (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-green-500"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </motion.span>
                        ) : (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-red-500"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    )}
                  </Label>

                  <motion.div
                    whileFocus={{ scale: 1.005 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative"
                  >
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={handleUrlChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className={`h-14 pl-12 rounded-xl border-[#d2d2d7] bg-white/80 backdrop-blur-sm text-base transition-all ${
                        !isValid
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : isFocused
                            ? "border-[#0071e3] ring-1 ring-[#0071e3]"
                            : ""
                      }`}
                      required
                    />
                    <Globe
                      className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                        !isValid ? "text-red-400" : isFocused ? "text-[#0071e3]" : "text-gray-400"
                      } transition-colors`}
                    />
                  </motion.div>

                  <p className={`text-sm ${!isValid ? "text-red-500" : "text-gray-500"} flex items-center gap-1.5`}>
                    {!isValid ? (
                      <>
                        <AlertCircle className="h-3.5 w-3.5" />
                        Please enter a valid URL including https:// or http://
                      </>
                    ) : (
                      "Enter the full URL including https:// or http://"
                    )}
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-[#0071e3] to-[#40a9ff] text-white font-medium text-lg shadow-md transition-all hover:shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                        <span className="ml-3">Starting Audit...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        Start Site Audit
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>

            {/* Decorative elements */}
            <div
              className="absolute -top-20 -left-20 h-40 w-40 rounded-full opacity-30"
              style={{
                background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0) 70%)`,
                filter: "blur(30px)",
                animation: "pulse-glow 4s infinite ease-in-out",
              }}
            />

            <div
              className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full opacity-30"
              style={{
                background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0) 70%)`,
                filter: "blur(30px)",
                animation: "pulse-glow 4s infinite ease-in-out 2s",
              }}
            />
          </div>

          {/* Inject CSS styles */}
          <style jsx global>{`
            @keyframes pulse-glow {
              0% { filter: blur(20px); opacity: 0.2; }
              50% { filter: blur(30px); opacity: 0.4; }
              100% { filter: blur(20px); opacity: 0.2; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

