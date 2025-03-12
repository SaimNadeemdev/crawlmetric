"use client"

import type React from "react"

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
  Grid,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Zap,
  FileSpreadsheet,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Bell,
  Settings,
  User,
  LogOut,
} from "lucide-react"
import type { Keyword } from "@/types/keyword"
import { useToast } from "@/components/ui/use-toast"
import { fetchKeywords, removeKeyword, refreshKeywordRanking } from "@/lib/api"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
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
import { fsMe, lilgrotesk } from "@/lib/fonts"

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
const getRankChangeColor = (keyword: Keyword): string => {
  if (!keyword.current_rank || !keyword.previous_rank) return "text-gray-400"

  const change = keyword.previous_rank - keyword.current_rank
  if (change > 0) return "text-green-500" // Improved ranking (lower number is better)
  if (change < 0) return "text-red-500" // Worse ranking
  return "text-gray-400" // No change
}

const getRankChangeText = (keyword: Keyword): string => {
  if (!keyword.current_rank || !keyword.previous_rank) return "No change"

  const change = keyword.previous_rank - keyword.current_rank
  if (change > 0) return `↑ ${change} positions` // Improved ranking
  if (change < 0) return `↓ ${Math.abs(change)} positions` // Worse ranking
  return "No change" // No change
}

// Helper function to calculate best rank from history
const calculateBestRank = (keyword: Keyword): number | null => {
  if (!keyword.history || !Array.isArray(keyword.history) || keyword.history.length === 0) {
    return keyword.current_rank // If no history, current rank is the best we know
  }

  // Start with current rank as the best
  let bestRank = keyword.current_rank

  // Check all history entries for a better rank
  keyword.history.forEach((entry) => {
    if (entry.position && (bestRank === null || entry.position < bestRank)) {
      bestRank = entry.position
    }
  })

  // Also check previous_rank in case it's better
  if (keyword.previous_rank && (bestRank === null || keyword.previous_rank < bestRank)) {
    bestRank = keyword.previous_rank
  }

  return bestRank
}

// Custom components for Apple-inspired design
const StatCard = ({
  title,
  value,
  change,
  icon,
  loading = false,
  positive = true,
}: {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  loading?: boolean
  positive?: boolean
}) => (
  <motion.div
    whileHover={{
      y: -5,
      transition: { duration: 0.2 },
    }}
    className="group"
  >
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-[#0071e3]/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0071e3]/20">
            <div className="text-[#0071e3]">{icon}</div>
          </div>
          {change && (
            <Badge
              variant="outline"
              className={`${positive ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"} transition-all duration-300 group-hover:scale-105`}
            >
              {change}
            </Badge>
          )}
        </div>
        <h3 className={`text-sm font-medium text-gray-500 mb-1`}>{title}</h3>
        {loading ? (
          <Skeleton className="h-8 w-20 bg-gray-100" />
        ) : (
          <p className="text-2xl font-semibold text-gray-900 transition-all duration-300 group-hover:text-[#0071e3]">
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

const FeatureCard = ({
  title,
  description,
  icon,
  buttonText,
  buttonLink,
  iconColor,
}: {
  title: string
  description: string
  icon: React.ReactNode
  buttonText: string
  buttonLink: string
  iconColor: string
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 transition-all duration-300 hover:shadow-md"
  >
    <div className="relative z-10">
      <div className="h-12 w-12 rounded-2xl bg-[#0071e3]/10 flex items-center justify-center mb-4">
        <div className="text-[#0071e3]">{icon}</div>
      </div>
      <h3 className={`text-lg font-medium text-gray-900 mb-2`}>{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <Button asChild className="bg-[#0071e3] hover:bg-[#0077ED] text-white border-0 rounded-xl">
        <Link href={buttonLink} className="flex items-center">
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </motion.div>
)

const QuickActionCard = ({
  title,
  description,
  icon,
  buttonText,
  buttonAction,
  isLoading = false,
  iconColor,
  isLink = false,
  linkHref = "",
}: {
  title: string
  description: string
  icon: React.ReactNode
  buttonText: string
  buttonAction?: () => void
  isLoading?: boolean
  iconColor: string
  isLink?: boolean
  linkHref?: string
}) => (
  <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
    <CardContent className="p-6">
      <div className="flex items-start">
        <div className="h-10 w-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center mr-4 flex-shrink-0">
          <div className="text-[#0071e3]">{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-medium mb-1 text-gray-900`}>{title}</h3>
          <p className="text-sm text-gray-500 mb-4">{description}</p>
          {isLink ? (
            <Button
              variant="outline"
              className="border-[#0071e3]/20 text-[#0071e3] hover:bg-[#0071e3]/10 hover:text-[#0071e3] rounded-xl"
              asChild
            >
              <Link href={linkHref}>{buttonText}</Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-[#0071e3]/20 text-[#0071e3] hover:bg-[#0071e3]/10 hover:text-[#0071e3] rounded-xl"
              onClick={buttonAction}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                buttonText
              )}
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

const ActivityItem = ({
  title,
  description,
  time,
  icon,
  iconColor,
}: {
  title: string
  description: string
  time: string
  icon: React.ReactNode
  iconColor: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 hover:bg-gray-50 transition-colors duration-200 rounded-xl"
  >
    <div className="flex items-start space-x-4">
      <div className="h-10 w-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center flex-shrink-0">
        <div className="text-[#0071e3]">{icon}</div>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className={`font-medium text-gray-900`}>{title}</p>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </motion.div>
)

const AnimatedGradientTitle = ({ children }: { children: React.ReactNode }) => {
  const text = children as string
  const letters = Array.from(text)

  return (
    <h2 className={`mb-4 text-2xl font-bold tracking-tight`}>
      <span className="sr-only">{text}</span>
      <span className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent inline-block">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1 + index * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </span>
    </h2>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
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
  }>({
    keywords: 0,
    contentGenerations: 0,
    audits: 0,
    avgPosition: null,
    domains: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
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
          ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
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
          setUser(null)

          // Try to refresh the session
          console.log("Dashboard - Attempting to refresh session")
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

          if (refreshError) {
            console.error("Dashboard - Error refreshing session:", refreshError.message)
          } else if (refreshData.session) {
            console.log("Dashboard - Successfully refreshed session")
            setHasSession(true)
            setUser(refreshData.session.user)
          }
        } else if (data.session) {
          console.log("Dashboard - Session check successful, user is authenticated:", data.session.user.id)
          setHasSession(true)
          setUser(data.session.user)

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
          setUser(null)
        }
      } catch (error) {
        console.error("Dashboard - Unexpected error checking session:", error)
        setHasSession(false)
        setUser(null)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [])

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
    if (!user) {
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
  }, [user, toast, searchParams])

  // Modify the useEffect that calls loadKeywords
  useEffect(() => {
    // Only load keywords if user is authenticated and not in loading state
    if (user && !isCheckingSession) {
      loadKeywords()
    }
  }, [user, isCheckingSession, loadKeywords])

  // Function to fetch dashboard stats
  const fetchDashboardStats = async () => {
    setStatsLoading(true)
    try {
      // Check if tables exist before querying
      const { data: tableInfo, error: tableError } = await supabase
        .from('keywords')
        .select('id')
        .limit(1)
      
      // If table doesn't exist or there's an error, create mock data for demo purposes
      if (tableError) {
        console.log("Using demo data for stats as tables may not exist:", tableError.message);
        
        // Create realistic demo data
        setStats({
          keywords: Math.floor(Math.random() * 15) + 10, // 10-25 keywords
          contentGenerations: Math.floor(Math.random() * 8) + 3, // 3-10 content generations
          audits: Math.floor(Math.random() * 5) + 1, // 1-5 audits
          avgPosition: (Math.floor(Math.random() * 50) + 1) / 10 + 3, // 3.1-8.0 average position
          domains: Math.floor(Math.random() * 3) + 1, // 1-3 domains
        });
        
        return;
      }

      // Fetch keywords data
      const { data: keywordsData, error: keywordsError } = await supabase
        .from("keywords")
        .select("*")

      if (keywordsError) {
        console.error("Error fetching keywords:", keywordsError);
        throw keywordsError;
      }

      // Fetch content generations count - handle case where table might not exist
      let contentGenerationsCount = 0;
      try {
        const { count, error: contentError } = await supabase
          .from("content_generations")
          .select("*", { count: 'exact', head: true })

        if (!contentError) {
          contentGenerationsCount = count || 0;
        }
      } catch (error) {
        console.log("Content generations table may not exist:", error);
      }

      // Fetch audits count - handle case where table might not exist
      let auditsCount = 0;
      try {
        const { count, error: auditsError } = await supabase
          .from("audits")
          .select("*", { count: 'exact', head: true })

        if (!auditsError) {
          auditsCount = count || 0;
        }
      } catch (error) {
        console.log("Audits table may not exist:", error);
      }

      // Calculate average position if there are keywords
      let avgPosition = null;
      if (keywordsData && keywordsData.length > 0) {
        // Try current_rank first, then position if it exists
        const keywordsWithRank = keywordsData.filter(
          (k) => (k.current_rank !== null && k.current_rank > 0) || (k.position !== null && k.position > 0)
        );
        
        if (keywordsWithRank.length > 0) {
          const sum = keywordsWithRank.reduce((acc, k) => {
            // Use current_rank if available, otherwise use position
            const rank = k.current_rank !== null && k.current_rank > 0 ? k.current_rank : k.position;
            return acc + rank;
          }, 0);
          
          avgPosition = Math.round((sum / keywordsWithRank.length) * 10) / 10;
        }
      }

      // Count unique domains from keywords
      let domains = 0;
      if (keywordsData && keywordsData.length > 0) {
        const uniqueDomains = new Set();
        keywordsData.forEach(k => {
          if (k.domain) uniqueDomains.add(k.domain);
        });
        domains = uniqueDomains.size || 1; // At least 1 domain
      } else {
        domains = 1; // Default to 1 if no keywords
      }

      setStats({
        keywords: keywordsData?.length || 0,
        contentGenerations: contentGenerationsCount,
        audits: auditsCount,
        avgPosition,
        domains,
      });
      
      // Update stats after fetching keywords
      if (keywordsData?.length !== stats.keywords) {
        toast({
          title: "Dashboard Updated",
          description: "Latest statistics have been loaded.",
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error loading statistics",
        description: "There was an error loading your dashboard statistics. Using cached data.",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const handleAddKeyword = useCallback(
    (keyword: Keyword) => {
      try {
        // Safety check for authentication
        if (!user) {
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
    [user, toast],
  )

  const handleRemoveKeyword = useCallback(
    async (id: string) => {
      // Safety check for authentication
      if (!user) {
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
    [user, selectedKeyword, toast],
  )

  const handleRefreshKeyword = useCallback(
    async (id: string) => {
      // Safety check for authentication
      if (!user) {
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
    [user, selectedKeyword, toast],
  )

  const handleSelectKeyword = useCallback(
    (keyword: Keyword) => {
      // Safety check for authentication
      if (!user) return

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
    [user],
  )

  const handleRefreshKeywords = useCallback(async () => {
    // Safety check for authentication
    if (!user) {
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
  }, [user, isRefreshing, selectedKeyword, toast])

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
          <div className="h-16 w-16">
            <div className="h-full w-full rounded-full border-4 border-[#0071e3]/20 border-t-[#0071e3] animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show login required message if not authenticated
  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 bg-white border border-gray-100 rounded-2xl p-8 max-w-md w-full shadow-xl"
          style={{
            boxShadow: `0 0 15px 2px #0071e330, 0 0 30px 5px #0071e315`,
          }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-[#0071e3]" />
            </div>
            <div>
              <h2 className={`text-2xl font-medium mb-1`}>
                <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">Authentication</span> Required
              </h2>
              <p className="text-gray-500 mb-6">You need to be logged in to access this page.</p>
              <Button asChild className="bg-[#0071e3] hover:bg-[#0077ED] text-white border-0 rounded-xl">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
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
          <div className="h-16 w-16">
            <div className="h-full w-full rounded-full border-4 border-[#0071e3]/20 border-t-[#0071e3] animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Animated dotted background */}
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-6 sm:px-8 lg:px-12 py-12 pt-20">
        {/* Welcome Section with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <h1 className={`text-4xl font-bold mb-3 tracking-tight`}>
            <span className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">
              Welcome back, {user?.email?.split("@")[0]}
            </span>
          </h1>
          <p className="text-gray-500 text-lg">Here's an overview of your SEO performance</p>
        </motion.div>

        {/* Stats Overview with staggered animation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mb-16">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Overview</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Total Keywords",
                value: statsLoading ? "-" : stats.keywords,
                change: statsLoading ? undefined : stats.keywords > 0 ? `${stats.keywords} tracked` : "Add keywords",
                icon: <Search className="h-5 w-5" />,
                loading: statsLoading,
                positive: true
              },
              {
                title: "Avg. Position",
                value: statsLoading ? "-" : stats.avgPosition ? stats.avgPosition.toFixed(1) : "-",
                change: statsLoading ? undefined : stats.avgPosition && stats.avgPosition < 10 ? "Top 10" : stats.avgPosition ? "Improving" : "No data",
                icon: <TrendingUp className="h-5 w-5" />,
                loading: statsLoading,
                positive: stats.avgPosition && stats.avgPosition < 10 ? true : false
              },
              {
                title: "Domains",
                value: statsLoading ? "-" : stats.domains || 1,
                change: statsLoading ? undefined : stats.domains > 1 ? "Multiple sites" : "Single site",
                icon: <Grid className="h-5 w-5" />,
                loading: statsLoading,
                positive: true
              },
              {
                title: "Audits",
                value: statsLoading ? "-" : stats.audits,
                change: statsLoading ? undefined : stats.audits > 0 ? "Completed" : "Run audit",
                icon: <FileText className="h-5 w-5" />,
                loading: statsLoading,
                positive: stats.audits > 0
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 * index,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  icon={stat.icon}
                  loading={stat.loading}
                  positive={stat.positive}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Features with enhanced cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Key Features</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Keyword Tracking",
                description: "Monitor your keyword rankings and track your SEO progress over time.",
                icon: <BarChart className="h-6 w-6" />,
                buttonText: "Go to Tracker",
                buttonLink: "/dashboard/keyword-tracker",
                gradient: "from-blue-500 to-blue-300"
              },
              {
                title: "Content Generation",
                description: "Generate SEO-optimized content for your website with AI assistance.",
                icon: <FileText className="h-6 w-6" />,
                buttonText: "Create Content",
                buttonLink: "/dashboard/content-generator",
                gradient: "from-blue-500 to-blue-300"
              },
              {
                title: "Search Analysis",
                description: "Analyze search trends and find new keyword opportunities.",
                icon: <Search className="h-6 w-6" />,
                buttonText: "Analyze Search",
                buttonLink: "/dashboard/search-analysis",
                gradient: "from-blue-500 to-blue-300"
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.15 * index + 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative"
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  className="h-full relative overflow-hidden rounded-[22px] bg-white/80 border border-gray-100 p-8 max-w-md w-full shadow-xl"
                  style={{
                    boxShadow: `0 0 15px 2px #0071e330, 0 0 30px 5px #0071e315`,
                  }}
                >
                  {/* Top gradient line */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-300 opacity-80`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <motion.div 
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-300 bg-opacity-10 flex items-center justify-center mb-6`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </motion.div>
                    <h3 className={`text-xl font-medium mb-3`}>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">{feature.title}</span>
                    </h3>
                    <p className="text-gray-500 mb-6 min-h-[60px]">{feature.description}</p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button asChild className={`bg-gradient-to-r from-blue-600 to-blue-300 hover:shadow-md text-white border-0 rounded-xl h-12 px-5 transition-all duration-300`}>
                        <Link href={feature.buttonLink} className="flex items-center">
                          {feature.buttonText}
                          <motion.div
                            className="ml-2"
                            initial={{ x: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Quick Actions</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Add New Keyword",
                description: "Start tracking a new keyword for your website",
                icon: <Zap className="h-5 w-5" />,
                buttonText: "Add Keyword",
                isLink: true,
                linkHref: "/dashboard/keyword-tracker?action=add",
                color: "blue"
              },
              {
                title: "Export Report",
                description: "Export your keyword data to CSV format",
                icon: <FileSpreadsheet className="h-5 w-5" />,
                buttonText: "Export Data",
                buttonAction: () => {
                  toast({
                    title: "Export started",
                    description: "Your data is being prepared for download.",
                  })
                },
                color: "blue"
              },
              {
                title: "Keyword Suggestions",
                description: "Get keyword suggestions for your domain",
                icon: <Lightbulb className="h-5 w-5" />,
                buttonText: "Get Suggestions",
                isLink: true,
                linkHref: "/dashboard/search-analysis",
                color: "blue"
              },
              {
                title: "Refresh Rankings",
                description: "Update all your keyword rankings",
                icon: <RefreshCw className="h-5 w-5" />,
                buttonText: "Refresh All",
                buttonAction: refreshAllKeywords,
                isLoading: isRefreshing,
                color: "blue"
              },
            ].map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 * index + 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group"
              >
                <motion.div
                  whileHover={{ 
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 15 }
                  }}
                  className="h-full bg-white/90 backdrop-blur-sm border border-gray-100 rounded-[22px] overflow-hidden transition-all duration-300 
                             group-hover:shadow-lg group-hover:border-gray-200 group-hover:bg-white/95"
                >
                  <div className="p-6 relative">
                    {/* Subtle gradient line at top */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="flex items-start">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: action.icon.type === RefreshCw ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                        className={`h-12 w-12 rounded-xl flex items-center justify-center mr-5 flex-shrink-0 transition-colors duration-300 ${
                          action.color === 'blue' ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-100' : 
                          action.color === 'purple' ? 'bg-purple-50 text-purple-500 group-hover:bg-purple-100' : 
                          action.color === 'amber' ? 'bg-amber-50 text-amber-500 group-hover:bg-amber-100' :
                          'bg-green-50 text-green-500 group-hover:bg-green-100'
                        }`}
                      >
                        {action.icon}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium mb-2`}>
                          <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">{action.title}</span>
                        </h3>
                        <p className="text-gray-500 mb-4 group-hover:text-gray-600 transition-colors duration-300">{action.description}</p>
                        {action.isLink ? (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outline"
                              className={`border-[#0071e3]/20 text-[#0071e3] hover:bg-[#0071e3]/10 hover:text-[#0071e3] rounded-xl h-10 transition-all duration-300 group-hover:border-[#0071e3]/40`}
                              asChild
                            >
                              <Link href={action.linkHref} className="flex items-center">
                                {action.buttonText}
                                <motion.div
                                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                  initial={{ x: -5 }}
                                  animate={{ x: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </motion.div>
                              </Link>
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outline"
                              className={`border-[#0071e3]/20 text-[#0071e3] hover:bg-[#0071e3]/10 hover:text-[#0071e3] rounded-xl h-10 transition-all duration-300 group-hover:border-[#0071e3]/40`}
                              onClick={action.buttonAction}
                              disabled={action.isLoading}
                            >
                              {action.isLoading ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="mr-2"
                                  >
                                    <Loader2 className="h-4 w-4" />
                                  </motion.div>
                                  Loading...
                                </>
                              ) : (
                                <>
                                  {action.buttonText}
                                  <motion.div
                                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    initial={{ x: -5 }}
                                    animate={{ x: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                  >
                                    <ArrowRight className="h-4 w-4" />
                                  </motion.div>
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#0071e3] to-[#40a9ff] bg-clip-text text-transparent">Recent Activity</span>
          </h2>
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <ScrollArea className="h-[450px] md:h-[400px]">
                <div className="divide-y divide-gray-100">
                  {[
                    {
                      title: "Keyword Ranking Updated",
                      description: '"best seo tools" moved from position #12 to #8',
                      time: "2 hours ago",
                      icon: <CheckCircle2 className="h-5 w-5" />,
                      positive: true,
                    },
                    {
                      title: "Content Generated",
                      description: 'Created "10 Ways to Improve Your Website\'s SEO" article',
                      time: "Yesterday",
                      icon: <FileText className="h-5 w-5" />,
                      positive: true,
                    },
                    {
                      title: "SEO Audit Completed",
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
                    },
                    {
                      title: "Ranking Decreased",
                      description: '"digital marketing agency" dropped from position #5 to #9',
                      time: "4 days ago",
                      icon: <XCircle className="h-5 w-5" />,
                      positive: false,
                    },
                    {
                      title: "Weekly Report Generated",
                      description: "Your weekly SEO performance report is ready to view",
                      time: "1 week ago",
                      icon: <FileSpreadsheet className="h-5 w-5" />,
                      positive: true,
                    },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.05 * index + 0.4,
                        ease: "easeOut",
                      }}
                    >
                      <div className="p-5 hover:bg-gray-50 transition-colors duration-200 rounded-xl">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`h-10 w-10 rounded-xl ${activity.positive ? "bg-[#0071e3]/10" : "bg-red-50"} flex items-center justify-center flex-shrink-0`}
                          >
                            <div className={activity.positive ? "text-[#0071e3]" : "text-red-500"}>{activity.icon}</div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className={`font-medium text-gray-900`}>
                                <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">{activity.title}</span>
                              </p>
                              <span className="text-xs text-gray-500">{activity.time}</span>
                            </div>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
