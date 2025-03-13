"use client"

import { createClient } from "@supabase/supabase-js"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Loader2,
  Search,
  Plus,
  BarChart,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ChevronRight,
  User,
  TrendingUp,
  Clock,
  Lightbulb,
  ShieldCheck,
  Settings,
  Globe,
  Zap,
  ArrowRight,
  Grid,
  Bell,
  LogOut,
  Award,
} from "lucide-react"
import type { Keyword } from "@/types/keyword"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"
import { fetchKeywords, removeKeyword, refreshKeywordRanking } from "@/lib/api"
import { AnimatedTitle } from "@/components/client-success-section"

// Initialize Supabase client with hardcoded credentials for client-side use
const supabaseUrl = "https://nzxgnnpthtefahosnolm.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg"

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
  },
})

// Helper functions for rank change display
function getRankChangeColor(keyword: Keyword): string {
  if (!keyword.current_rank || !keyword.previous_rank) return "text-gray-500"
  
  const change = keyword.previous_rank - keyword.current_rank
  if (change > 0) return "text-green-500"
  if (change < 0) return "text-red-500"
  return "text-gray-500"
}

function getRankChangeText(keyword: Keyword): string {
  if (!keyword.current_rank || !keyword.previous_rank) return "No change"
  
  const change = keyword.previous_rank - keyword.current_rank
  if (change > 0) return `+${change}`
  if (change < 0) return `${change}`
  return "0"
}

// Helper function to calculate best rank from history
function calculateBestRank(keyword: Keyword): number | null {
  if (!keyword.history || keyword.history.length === 0) {
    return keyword.current_rank || null
  }
  
  let bestRank = keyword.current_rank || Infinity
  
  // Check history for better ranks
  keyword.history.forEach(entry => {
    if (entry.position && entry.position < bestRank) {
      bestRank = entry.position
    }
  })
  
  // If we only found Infinity, there's no valid rank
  if (bestRank === Infinity) {
    return null
  }
  
  return bestRank
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [dataInitialized, setDataInitialized] = useState(false)
  const [stats, setStats] = useState<{
    keywords: number
    contentGenerations: number
    audits: number
    avgPosition: number | null
    domains: number
    topRanking: number | null
  }>({
    keywords: 0,
    contentGenerations: 0,
    audits: 0,
    avgPosition: null,
    domains: 0,
    topRanking: null,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [authUser, setAuthUser] = useState<any>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Dotted background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Create dotted background
    const drawDottedBackground = (t: number) => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Plain white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw animated dots
      const dotSize = 1
      const spacing = 25
      const rows = Math.ceil(canvas.height / spacing)
      const cols = Math.ceil(canvas.width / spacing)

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * spacing
          const y = i * spacing

          // Add subtle movement to dots
          const offsetX = Math.sin((i + j) * 0.5 + t * 0.001) * 2
          const offsetY = Math.cos((i - j) * 0.5 + t * 0.001) * 2

          // Vary dot size slightly based on position and time
          const size = dotSize + Math.sin(i * j + t * 0.0005) * 0.3

          ctx.beginPath()
          ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
          ctx.fill()
        }
      }
    }

    let time = 0
    const animate = () => {
      time += 1
      drawDottedBackground(time)
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Check for session directly with Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Dashboard - Checking for session")

        // First check if we have a session in localStorage
        if (typeof window !== "undefined") {
          // Log all available localStorage keys for debugging
          console.log("Available localStorage keys:", Object.keys(localStorage))

          // Try to find any Supabase token
          const newTokenFormat = localStorage.getItem("sb-nzxgnnpthtefahosnolm-auth-token")
          const oldTokenFormat = localStorage.getItem("supabase.auth.token")
          const authDataFormat = localStorage.getItem("supabase.auth.data")

          if (newTokenFormat) {
            console.log("Dashboard - Found newer token format")
            try {
              const parsed = JSON.parse(newTokenFormat)
              console.log("Token structure:", Object.keys(parsed))
            } catch (e) {
              console.error("Error parsing token:", e)
            }
          }

          if (oldTokenFormat) {
            console.log("Dashboard - Found older token format")
          }

          if (authDataFormat) {
            console.log("Dashboard - Found auth data format")
          }
        }

        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Dashboard - Error getting session:", error.message)
          setHasSession(false)
          setAuthUser(null)

          // Try to refresh the session
          console.log("Dashboard - Attempting to refresh session")
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

          if (refreshError) {
            console.error("Dashboard - Error refreshing session:", refreshError.message)
          } else if (refreshData.session) {
            console.log("Dashboard - Successfully refreshed session")
            setHasSession(true)
            setAuthUser(refreshData.session.user)
          }
        } else if (data.session) {
          console.log("Dashboard - Session check successful, user is authenticated:", data.session.user.id)
          setHasSession(true)
          setAuthUser(data.session.user)

          // Store the session in localStorage for API calls
          if (typeof window !== "undefined") {
            try {
              // Store in the newer format
              localStorage.setItem(
                "sb-nzxgnnpthtefahosnolm-auth-token",
                JSON.stringify({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                  expires_at: Math.floor(Date.now() / 1000) + 3600,
                }),
              )
              console.log("Dashboard - Stored session in localStorage")
            } catch (e) {
              console.error("Dashboard - Error storing session:", e)
            }
          }
        } else {
          console.log("Dashboard - No session found")
          setHasSession(false)
          setAuthUser(null)
        }
      } catch (error) {
        console.error("Dashboard - Unexpected error checking session:", error)
        setHasSession(false)
        setAuthUser(null)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [supabase])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isCheckingSession && !hasSession) {
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }, [hasSession, isCheckingSession])

  // Memoize the loadKeywords function to prevent unnecessary re-renders
  const loadKeywords = useCallback(async () => {
    // Only load keywords if authenticated
    if (!authUser) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await fetchKeywords()

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from API")
      }

      setKeywords(data)
      setDataInitialized(true)

      // Check if we have a keyword ID in the URL
      const keywordId = searchParams?.get("keyword")
      if (keywordId) {
        const keyword = data.find((k) => k && k.id === keywordId)
        if (keyword) {
          setSelectedKeyword(keyword)
        }
      } else if (data.length > 0) {
        // If no keyword is selected from URL, select the first one by default
        setSelectedKeyword(data[0])
      }
    } catch (error) {
      console.error("Error loading keywords:", error)
      setError("Failed to load keywords. Please try refreshing the page.")
      toast({
        title: "Error loading keywords",
        description: "There was an error loading your keywords. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [authUser, searchParams, toast])

  // Load keywords when user is authenticated and not in loading state
  useEffect(() => {
    if (authUser && !isCheckingSession) {
      loadKeywords()
    }
  }, [authUser, isCheckingSession, loadKeywords])

  // Function to fetch dashboard stats
  const fetchDashboardStats = async () => {
    if (!authUser) return;
    
    try {
      // Get the supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      )
      
      // Fetch all keywords for the user
      const { data: keywordsData, error: keywordsError } = await supabase
        .from("keywords")
        .select("*")
        .eq("user_id", authUser.id)
      
      if (keywordsError) {
        console.error("Error fetching keywords:", keywordsError)
        return
      }
      
      // Calculate dashboard stats
      const keywordsCount = keywordsData?.length || 0
      
      // Calculate average position
      let totalPosition = 0
      let positionCount = 0
      
      keywordsData?.forEach((keyword) => {
        if (keyword.current_rank) {
          totalPosition += keyword.current_rank
          positionCount++
        }
      })
      
      const avgPosition = positionCount > 0 ? Math.round(totalPosition / positionCount) : null
      
      // Count unique domains
      const domains = new Set()
      keywordsData?.forEach((keyword) => {
        if (keyword.domain) {
          domains.add(keyword.domain)
        }
      })
      
      // Find top ranking
      let topRanking: number | null = null;
      keywordsData?.forEach((keyword) => {
        if (keyword.current_rank && (topRanking === null || keyword.current_rank < topRanking)) {
          topRanking = keyword.current_rank;
        }
      });
      
      // Update dashboard stats
      setStats({
        keywords: keywordsCount,
        contentGenerations: 0,
        audits: 0,
        avgPosition,
        domains: domains.size,
        topRanking,
      })
    } catch (error) {
      console.error("Error calculating dashboard stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (authUser) {
      fetchDashboardStats()
    }
  }, [authUser])

  // Function to export keyword data to CSV
  const exportKeywordsToCSV = () => {
    setIsExporting(true)
    
    try {
      toast({
        title: "Preparing export",
        description: "Getting your keyword data ready for download...",
      });
      
      // Create CSV header
      const headers = [
        "Keyword",
        "Domain",
        "Current Rank",
        "Previous Rank",
        "Best Rank",
        "Search Volume",
        "Last Updated"
      ].join(",");
      
      // Create CSV rows
      const rows = keywords.map((keyword) => {
        const bestRank = calculateBestRank(keyword);
        // Handle undefined updated_at by providing a fallback
        const lastUpdated = keyword.updated_at ? new Date(keyword.updated_at).toLocaleDateString() : "N/A";
        
        return [
          `"${keyword.keyword}"`,
          `"${keyword.domain}"`,
          keyword.current_rank || "N/A",
          keyword.previous_rank || "N/A",
          bestRank || "N/A",
          keyword.search_volume || "N/A",
          lastUpdated
        ].join(",");
      });
      
      // Combine header and rows
      const csvContent = [headers, ...rows].join("\n");
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `crawlmetric-keywords-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download and clean up
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export complete",
        description: "Your keyword data has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddKeyword = useCallback(
    (keyword: Keyword) => {
      try {
        // Safety check for authentication
        if (!authUser) {
          toast({
            title: "Authentication required",
            description: "Please log in to add keywords.",
            variant: "destructive",
          })
          return
        }

        if (!keyword || !keyword.id) {
          throw new Error("Invalid keyword data")
        }

        setKeywords((prev) => [...(Array.isArray(prev) ? prev : []), keyword])
        setSelectedKeyword(keyword)
        setIsSheetOpen(false)

        toast({
          title: "Keyword added",
          description: `"${keyword.keyword}" has been added to your tracking list.`,
        })
      } catch (error) {
        console.error("Error handling new keyword:", error)
        toast({
          title: "Error adding keyword",
          description: "There was an error processing the new keyword.",
          variant: "destructive",
        })
      }
    },
    [authUser, toast],
  )

  const handleRemoveKeyword = useCallback(
    async (id: string) => {
      // Safety check for authentication
      if (!authUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to remove keywords.",
          variant: "destructive",
        })
        return
      }

      if (!id) return

      try {
        await removeKeyword(id)
        setKeywords((prev) => (Array.isArray(prev) ? prev.filter((k) => k && k.id !== id) : []))

        if (selectedKeyword?.id === id) {
          setSelectedKeyword(null)

          // Update URL to remove the keyword parameter
          try {
            const url = new URL(window.location.href)
            url.searchParams.delete("keyword")
            window.history.pushState({}, "", url)
          } catch (e) {
            console.error("Error updating URL:", e)
          }
        }

        toast({
          title: "Keyword removed",
          description: "The keyword has been removed from your tracking list.",
        })
      } catch (error) {
        console.error("Error removing keyword:", error)
        toast({
          title: "Error removing keyword",
          description: "There was an error removing the keyword. Please try again.",
          variant: "destructive",
        })
      }
    },
    [authUser, selectedKeyword, toast],
  )

  const handleRefreshKeyword = useCallback(
    async (id: string) => {
      // Safety check for authentication
      if (!authUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to refresh keyword rankings.",
          variant: "destructive",
        })
        return
      }

      if (!id) return

      try {
        const updatedKeyword = await refreshKeywordRanking(id)

        if (!updatedKeyword) {
          throw new Error("Failed to refresh keyword ranking")
        }

        // Update the keywords list with the refreshed keyword
        setKeywords((prev) => {
          if (!Array.isArray(prev)) return prev

          return prev.map((k) => {
            if (k && k.id === id) {
              return updatedKeyword
            }
            return k
          })
        })

        // If this is the selected keyword, update it as well
        if (selectedKeyword?.id === id) {
          setSelectedKeyword(updatedKeyword)
        }

        toast({
          title: "Keyword refreshed",
          description: "The keyword ranking has been updated.",
        })
      } catch (error) {
        console.error("Error refreshing keyword:", error)
        toast({
          title: "Error refreshing keyword",
          description: "There was an error refreshing the keyword ranking. Please try again.",
          variant: "destructive",
        })
      }
    },
    [authUser, selectedKeyword, toast],
  )

  const handleSelectKeyword = useCallback(
    (keyword: Keyword) => {
      // Safety check for authentication
      if (!authUser) return

      if (!keyword || !keyword.id) return

      setSelectedKeyword(keyword)

      // Update URL without reloading the page
      try {
        const url = new URL(window.location.href)
        url.searchParams.set("keyword", keyword.id)
        window.history.pushState({}, "", url)
      } catch (error) {
        console.error("Error updating URL:", error)
      }
    },
    [authUser],
  )

  const handleRefreshKeywords = useCallback(async () => {
    // Safety check for authentication
    if (!authUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to refresh keywords.",
        variant: "destructive",
      })
      return
    }

    if (isRefreshing) return

    setIsRefreshing(true)
    setError(null)

    try {
      // Use the dedicated refresh function instead
      const data = await fetchKeywords()

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from API")
      }

      setKeywords(data)

      // Update selected keyword if it exists
      if (selectedKeyword) {
        const updated = data.find((k) => k && k.id === selectedKeyword.id)
        if (updated) {
          setSelectedKeyword(updated)
        }
      }

      toast({
        title: "Keywords refreshed",
        description: "Your keyword rankings have been updated.",
      })
    } catch (error) {
      console.error("Error refreshing keywords:", error)
      setError("Failed to refresh keywords. Please try again later.")
      toast({
        title: "Error refreshing keywords",
        description: "There was an error updating your keywords. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [authUser, isRefreshing, selectedKeyword, toast])

  // Function to refresh all keyword rankings
  const refreshAllKeywords = async () => {
    try {
      setIsRefreshing(true)
      const keywords = await fetchKeywords()

      // Process each keyword sequentially to avoid rate limiting
      for (const keyword of keywords) {
        await refreshKeywordRanking(keyword.id)
        // Small delay to prevent API rate limits
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Refresh stats after updating all keywords
      await fetchDashboardStats()

      toast({
        title: "Rankings refreshed",
        description: `Successfully refreshed ${keywords.length} keywords.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error refreshing keywords:", error)
      toast({
        title: "Error",
        description: "Failed to refresh keyword rankings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show loading state while authentication is in progress
  if (isCheckingSession) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              transition: {
                times: [0, 0.2, 0.8, 1],
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.5,
              },
            }}
            className="text-[#0071e3] text-lg font-medium mb-6"
          >
            Loading your dashboard...
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-20 w-20 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center">
              <div className="h-14 w-14 rounded-full border-4 border-[#0071e3]/20 border-t-[#0071e3] animate-spin"></div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show login required message if not authenticated
  if (!authUser) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl p-10 max-w-md w-full shadow-xl"
          style={{
            boxShadow: `0 10px 40px -10px rgba(0,0,0,0.1), 0 0 15px 2px rgba(0,113,227,0.2)`,
          }}
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-[#0071e3]/10 flex items-center justify-center mb-6">
              <ShieldCheck className="h-10 w-10 text-[#0071e3]" />
            </div>
            <h2 className="text-3xl font-semibold mb-3 tracking-tight">
              <span className="text-[#0071e3]">
                Authentication Required
              </span>
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              You need to be logged in to access your dashboard and view your SEO performance.
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                asChild
                className="bg-[#0071e3] hover:bg-[#0077ED] text-white border-0 rounded-xl h-12 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              transition: {
                times: [0, 0.2, 0.8, 1],
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.5,
              },
            }}
            className="text-[#0071e3] text-lg font-medium mb-6"
          >
            Loading your dashboard...
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-20 w-20 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center">
              <div className="h-14 w-14 rounded-full border-4 border-[#0071e3]/20 border-t-[#0071e3] animate-spin"></div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#f5f5f7]">
      {/* Animated dotted background */}
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Welcome Section with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <AnimatedTitle>Welcome back, {authUser?.email?.split("@")[0]}</AnimatedTitle>
          </div>
          <p className="text-gray-500 text-lg">Here's an overview of your SEO performance</p>
        </motion.div>

        {/* SEO performance metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                <BarChart className="h-3 w-3" />
              </div>
              <h2 className="text-2xl font-bold text-[#0071e3]">SEO Performance</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Keywords Tracked</h3>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BarChart className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.keywords || 0}</h3>
                  {stats.keywords > 0 && (
                    <div className="flex items-center bg-green-100 text-green-600 px-3 py-1.5 rounded-full text-xs font-medium">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" /> Active
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Total keywords being monitored</p>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Average Position</h3>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.avgPosition !== null ? stats.avgPosition : 'N/A'}</h3>
                  {stats.avgPosition !== null && (
                    <div className="flex items-center bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" /> Updated
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Average keyword position</p>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Domains Tracked</h3>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Globe className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.domains || 0}</h3>
                  {stats.domains > 0 && (
                    <div className="flex items-center bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full text-xs font-medium">
                      <Globe className="h-3.5 w-3.5 mr-1" /> Active
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Unique domains monitored</p>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Top Ranking</h3>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Award className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.topRanking || 'N/A'}</h3>
                  {stats.topRanking && (
                    <div className="flex items-center bg-yellow-100 text-yellow-600 px-3 py-1.5 rounded-full text-xs font-medium">
                      <Award className="h-3.5 w-3.5 mr-1" /> Best
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Best keyword position achieved</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CrawlMetric Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                <Settings className="h-3 w-3" />
              </div>
              <h2 className="text-2xl font-bold text-[#0071e3]">CrawlMetric Tools</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Keyword Tracker */}
            <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Keyword Tracker</h3>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BarChart className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">Monitor your rankings for target keywords across search engines</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">32 uses</span>
                  <span className="text-sm text-gray-500">Last used: Yesterday</span>
                </div>
                <Button className="w-full justify-center bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl transition-all duration-300" asChild>
                  <Link href="/dashboard/keyword-tracker">Launch Tool</Link>
                </Button>
              </div>
            </div>

            {/* Content Generation */}
            <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Content Generation</h3>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">Generate SEO-optimized content with AI assistance</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">24 uses</span>
                  <span className="text-sm text-gray-500">Last used: 2 days ago</span>
                </div>
                <Button className="w-full justify-center bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl transition-all duration-300" asChild>
                  <Link href="/dashboard/content-generation">Launch Tool</Link>
                </Button>
              </div>
            </div>

            {/* Keyword Research */}
            <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Keyword Research</h3>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Search className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">Discover high-value keywords with volume and competition metrics</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">56 uses</span>
                  <span className="text-sm text-gray-500">Last used: Today</span>
                </div>
                <Button 
                  size="sm" 
                  className="bg-[#4285F4] hover:bg-[#3367D6] w-full text-white border-0 rounded-xl h-10 shadow-sm hover:shadow transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard/keyword-research" className="text-white">
                    <span className="text-white font-medium">Get Suggestions</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* SEO Audit */}
            <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">SEO Audit</h3>
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Globe className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">Comprehensive website analysis with actionable recommendations</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">18 uses</span>
                  <span className="text-sm text-gray-500">Last used: 3 days ago</span>
                </div>
                <Button className="w-full justify-center bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl transition-all duration-300" asChild>
                  <Link href="/seo-audit">Launch Tool</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2">
                <Zap className="h-3 w-3" />
              </div>
              <h2 className="text-2xl font-bold text-[#0071e3]">Quick Actions</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Add New Keyword */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="h-14 w-14 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Plus className="h-7 w-7" />
                </div>
                <span className="text-xs text-gray-400">Most used</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Start tracking a new keyword for your website</h3>
              <p className="text-sm text-gray-600 mb-4"></p>
              <Button className="w-full justify-center bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl transition-all duration-300" asChild>
                Add Keyword
              </Button>
            </div>

            {/* Export Report */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="h-14 w-14 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <span className="text-xs text-gray-400">Last used: Today</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Export your keyword data to CSV format</h3>
              <p className="text-sm text-gray-600 mb-4"></p>
              <Button 
                size="sm" 
                className="bg-[#4285F4] hover:bg-[#3367D6] w-full text-white border-0 rounded-xl h-10 shadow-sm hover:shadow transition-all duration-300"
                onClick={exportKeywordsToCSV}
              >
                Export Data
              </Button>
            </div>

            {/* Get Keyword Suggestions */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="h-14 w-14 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Lightbulb className="h-7 w-7" />
                </div>
                <span className="text-xs text-gray-400">Last used: 2 days ago</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Get keyword suggestions for your domain</h3>
              <p className="text-sm text-gray-600 mb-4"></p>
              <Button 
                size="sm" 
                className="bg-[#4285F4] hover:bg-[#3367D6] w-full text-white border-0 rounded-xl h-10 shadow-sm hover:shadow transition-all duration-300"
                asChild
              >
                <Link href="/dashboard/keyword-research" className="text-white">
                  <span className="text-white font-medium">Get Suggestions</span>
                </Link>
              </Button>
            </div>

            {/* Refresh Rankings */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="h-14 w-14 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <RefreshCw className="h-7 w-7" />
                </div>
                <span className="text-xs text-gray-400">Last used: Yesterday</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Update all your keyword rankings</h3>
              <p className="text-sm text-gray-600 mb-4"></p>
              <Button 
                size="sm" 
                className="bg-[#4285F4] hover:bg-[#3367D6] w-full text-white border-0 rounded-xl h-10 shadow-sm hover:shadow transition-all duration-300"
                onClick={() => refreshAllKeywords()}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> Refreshing...
                  </>
                ) : (
                  "Refresh All"
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 mr-2">
                <Clock className="h-3 w-3" />
              </div>
              <h2 className="text-2xl font-bold text-[#0071e3]">Recent Activity</h2>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {[{
              title: "Keyword Ranking Improved",
              description: '"best seo tools" moved from position #12 to #8',
              time: "2 hours ago",
              icon: <TrendingUp className="h-5 w-5" />,
              positive: true,
            },
            {
              title: "Content Created",
              description: 'Created "10 Ways to Improve Your Website\'s SEO" article',
              time: "Yesterday",
              icon: <FileText className="h-5 w-5" />,
              positive: true,
            },
            {
              title: "Audit Completed",
              description: "Found 3 critical issues and 7 recommendations",
              time: "2 days ago",
              icon: <AlertTriangle className="h-5 w-5" />,
              positive: false,
            },
            {
              title: "New Keyword Added",
              description: 'Started tracking "seo strategy for small business"',
              time: "3 days ago",
              icon: <Plus className="h-5 w-5" />,
              positive: true,
            }].map((activity, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0">
                <div className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <div className={`h-10 w-10 rounded-lg ${activity.positive ? "bg-green-100" : "bg-red-50"} flex items-center justify-center flex-shrink-0`}>
                      <div className={activity.positive ? "text-green-600" : "text-red-500"}>{activity.icon}</div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
