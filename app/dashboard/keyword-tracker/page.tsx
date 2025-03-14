"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, Plus, Search, ArrowRight, ChevronRight, ChevronDown, ChevronUp, Trash2, Globe, BarChart3, TrendingUp, Calendar, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Keyword } from "@/types/keyword"
import { fetchKeywords, removeKeyword, refreshKeywordRanking } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddKeywordForm } from "@/components/add-keyword-form"
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { AnimatedTitle } from "@/components/client-success-section"
import { safeWindowAddEventListener, getWindowDimensions, safeWindow, safeUpdateUrl } from "@/lib/client-utils"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


// Initialize Supabase client with hardcoded credentials for client-side use
const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'

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
  if (!keyword.current_rank || !keyword.previous_rank) return "text-gray-500";
  
  const change = keyword.previous_rank - keyword.current_rank;
  if (change > 0) return "text-green-600"; // Improved ranking (lower number is better)
  if (change < 0) return "text-red-600"; // Worse ranking
  return "text-gray-500"; // No change
};

const getRankChangeText = (keyword: Keyword): string => {
  if (!keyword.current_rank || !keyword.previous_rank) return "No change";
  
  const change = keyword.previous_rank - keyword.current_rank;
  if (change > 0) return `↑ ${change} positions`; // Improved ranking
  if (change < 0) return `↓ ${Math.abs(change)} positions`; // Worse ranking
  return "No change"; // No change
};

// Helper function to calculate best rank from history
const calculateBestRank = (keyword: Keyword): number | null => {
  if (!keyword.history || !Array.isArray(keyword.history) || keyword.history.length === 0) {
    return keyword.current_rank; // If no history, current rank is the best we know
  }
  
  // Start with current rank as the best
  let bestRank = keyword.current_rank;
  
  // Check all history entries for a better rank
  keyword.history.forEach(entry => {
    if (entry.position && (bestRank === null || entry.position < bestRank)) {
      bestRank = entry.position;
    }
  });
  
  // Also check previous_rank in case it's better
  if (keyword.previous_rank && (bestRank === null || keyword.previous_rank < bestRank)) {
    bestRank = keyword.previous_rank;
  }
  
  return bestRank;
};

const getDifficultyText = (difficulty: number | undefined): string => {
  if (difficulty === undefined) return 'Unknown';
  
  if (difficulty < 20) return 'Easy';
  if (difficulty < 40) return 'Medium';
  if (difficulty < 60) return 'Hard';
  if (difficulty < 80) return 'Very Hard';
  return 'Extremely Hard';
};

const getDifficultyColor = (difficulty: number | undefined): string => {
  if (difficulty === undefined) return 'bg-gray-300';
  
  if (difficulty < 20) return 'bg-green-500';
  if (difficulty < 40) return 'bg-yellow-500';
  if (difficulty < 60) return 'bg-orange-500';
  if (difficulty < 80) return 'bg-red-500';
  return 'bg-red-600';
};

// Custom KeywordList component
const KeywordList = ({
  keywords,
  onRemoveKeyword,
  onSelectKeyword,
  onRefreshKeyword,
  selectedKeywordId,
  searchTerm,
}: {
  keywords: Keyword[];
  onRemoveKeyword: (id: string) => void;
  onSelectKeyword: (keyword: Keyword) => void;
  onRefreshKeyword: (id: string) => void;
  selectedKeywordId?: string;
  searchTerm: string;
}) => {
  // Filter keywords based on search term
  const filteredKeywords = keywords.filter(keyword => 
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    keyword.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-2">
        {filteredKeywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-gray-500">No keywords match your search</p>
          </div>
        ) : (
          filteredKeywords.map((keyword) => (
            <motion.div
              key={keyword.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.01 }}
              className={cn(
                "group relative flex items-center justify-between rounded-xl p-3 transition-all duration-200",
                selectedKeywordId === keyword.id
                  ? "bg-[#0071e3]/10 border border-[#0071e3]/20"
                  : "bg-gray-50 border border-gray-100 hover:bg-gray-100/80"
              )}
              onClick={() => onSelectKeyword(keyword)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0071e3]/10 text-[#0071e3]">
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{keyword.keyword}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-0.5">
                      <span className="truncate">{keyword.domain}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                {keyword.current_rank && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-medium border-0",
                      selectedKeywordId === keyword.id
                        ? "bg-[#0071e3]/10 text-[#0071e3]"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    #{keyword.current_rank}
                  </Badge>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-[#0071e3] hover:bg-[#0071e3]/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRefreshKeyword(keyword.id);
                        }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Refresh ranking</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveKeyword(keyword.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Remove keyword</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

// Custom StatCard component
const StatCard = ({
  title,
  value,
  change,
  icon,
  positive = true,
  iconBgColor = "bg-[#0071e3]/10",
  iconColor = "text-[#0071e3]",
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  positive?: boolean;
  iconBgColor?: string;
  iconColor?: string;
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Card className="border border-gray-100 bg-gradient-to-br from-[#f8f9fa] to-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`h-10 w-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
            <div className={iconColor}>{icon}</div>
          </div>
          {change && (
            <Badge
              variant="outline"
              className={`${positive ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}
            >
              {change}
            </Badge>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function KeywordTrackerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dataInitialized, setDataInitialized] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [hasSession, setHasSession] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [glowColor, setGlowColor] = useState("#0071e3")
  const [searchTerm, setSearchTerm] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animated glow effect
  useEffect(() => {
    if (!mounted) return

    const colors = [
      "#0071e3", // Apple blue
      "#3a86ff", // Light blue
      "#5e60ce", // Purple
      "#7400b8", // Deep purple
      "#6930c3", // Violet
      "#5390d9", // Sky blue
      "#4ea8de", // Light sky blue
    ]

    let colorIndex = 0
    const interval = setInterval(() => {
      colorIndex = (colorIndex + 1) % colors.length
      setGlowColor(colors[colorIndex])
    }, 2000)

    return () => clearInterval(interval)
  }, [mounted])

  // Dotted background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    // Set canvas dimensions
    const resizeCanvas = () => {
      const { width, height } = getWindowDimensions();
      canvas.width = width;
      canvas.height = height;
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

    // Add resize listener safely
    const cleanupListener = safeWindowAddEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      cleanupListener()
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted])

  // Check for session directly with Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("KeywordTracker - Checking for session")
        
        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("KeywordTracker - Error getting session:", error.message)
          setHasSession(false)
          setUser(null)
          
          // Try to refresh the session
          console.log("KeywordTracker - Attempting to refresh session")
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError) {
            console.error("KeywordTracker - Error refreshing session:", refreshError.message)
          } else if (refreshData.session) {
            console.log("KeywordTracker - Successfully refreshed session")
            setHasSession(true)
            setUser(refreshData.session.user)
          }
        } else if (data.session) {
          console.log("KeywordTracker - Session check successful, user is authenticated:", data.session.user.id)
          setHasSession(true)
          setUser(data.session.user)
        } else {
          console.log("KeywordTracker - No session found")
          setHasSession(false)
          setUser(null)
        }
      } catch (error) {
        console.error("KeywordTracker - Unexpected error checking session:", error)
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
      const win = safeWindow();
      if (win) {
        win.location.href = '/login';
      }
    }
  }, [isCheckingSession, hasSession])

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
        setIsDialogOpen(false)

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
          safeUpdateUrl((url) => {
            url.searchParams.delete("keyword")
          })
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
          
          return prev.map(k => {
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
      safeUpdateUrl((url) => {
        url.searchParams.set("keyword", keyword.id)
      })
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

  // Show loading state while authentication is in progress
  if (isCheckingSession) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-16 w-16 mb-6">
            <div className="h-full w-full rounded-full border-4 border-[#0071e3]/20 border-t-[#0071e3] animate-spin"></div>
          </div>
          <p className="text-gray-500 animate-pulse">Loading your keywords...</p>
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
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-[#0071e3]/10 flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-[#0071e3]" />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              <span className="text-[#0071e3]">Authentication Required</span>
            </h2>
            <p className="text-gray-500 mb-6">You need to be logged in to access the keyword tracker.</p>
            <Button 
              className="bg-[#0071e3] hover:bg-[#0062c4] text-white font-medium rounded-lg h-11 px-6 shadow-sm transition-all hover:shadow-md"
              onClick={() => router.push('/login')}
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Animated dotted background */}
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
      
      {/* Main content with responsive width */}
      <div className="relative z-10 w-full max-w-[2000px] mx-auto px-6 sm:px-8 lg:px-12 py-12 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <AnimatedTitle>Keyword Tracker</AnimatedTitle>
          </div>
          <p className="text-gray-500 text-lg">Monitor your website's ranking for important keywords and track performance over time.</p>
          
          <div className="flex items-center justify-center space-x-3 mt-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={handleRefreshKeywords}
                disabled={isRefreshing}
                className="h-10 px-4 rounded-lg border-[#d2d2d7] bg-white text-gray-700 hover:bg-gray-50 transition-all"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span>Refresh All</span>
                  </>
                )}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mr-2"
            >
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/overview')}
                className="h-10 px-4 rounded-lg border-[#d2d2d7] bg-white text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>Keywords Overview</span>
              </Button>
            </motion.div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="h-10 px-4 rounded-lg bg-[#0071e3] hover:bg-[#0062c4] text-white font-medium shadow-sm transition-all hover:shadow-md"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Keyword
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl border border-gray-100 shadow-xl p-0 overflow-hidden bg-white">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative"
                >
                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-[#0071e3]/10 flex items-center justify-center mr-4">
                          <Search className="h-6 w-6 text-[#0071e3]" />
                        </div>
                        <div>
                          <h2 className="text-xl font-medium text-gray-900">
                            <span className="text-[#0071e3]">Add New Keyword</span>
                          </h2>
                          <p className="text-gray-500">
                            Track a new keyword for your website
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDialogOpen(false)}
                        className="h-8 w-8 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                    
                    <div className="mt-6">
                      <AddKeywordForm onAddKeyword={handleAddKeyword} />
                    </div>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full border-4 border-[#0071e3]/20 border-t-[#0071e3] animate-spin mb-4"></div>
                <p className="text-gray-500">Loading your keywords...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {keywords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div 
                    className="h-20 w-20 rounded-full bg-[#0071e3]/10 flex items-center justify-center mb-6"
                    style={{
                      boxShadow: `0 0 30px 5px ${glowColor}20`,
                    }}
                  >
                    <Search className="h-10 w-10 text-[#0071e3]" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    <span className="text-[#0071e3]">No keywords tracked yet</span>
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md">Start tracking your first keyword to monitor its ranking position over time</p>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="h-11 px-6 rounded-lg bg-[#0071e3] hover:bg-[#0062c4] text-white font-medium shadow-sm transition-all hover:shadow-md"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Keyword
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1 border border-gray-100 bg-white rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#0071e3]"></div>
                    <CardHeader className="pb-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">
                            <span className="text-[#0071e3]">Your Keywords</span>
                          </h2>
                          <CardDescription className="text-gray-500">Manage and track your keywords</CardDescription>
                        </div>
                        <Badge className="bg-[#0071e3] text-white border-0 hover:bg-[#0062c4]">
                          {keywords.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 rounded-lg border-gray-200 bg-gray-50 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                          />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full hover:bg-gray-200"
                              onClick={() => setSearchTerm("")}
                            >
                              <X className="h-3 w-3 text-gray-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <KeywordList
                        keywords={keywords || []}
                        onRemoveKeyword={handleRemoveKeyword}
                        onSelectKeyword={handleSelectKeyword}
                        onRefreshKeyword={handleRefreshKeyword}
                        selectedKeywordId={selectedKeyword?.id}
                        searchTerm={searchTerm}
                      />
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 p-4 bg-gray-50">
                      <Button
                        variant="outline"
                        className="w-full h-10 rounded-lg border-[#d2d2d7] bg-white text-gray-700 hover:bg-gray-50 transition-all"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Keyword
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="lg:col-span-2 border border-gray-100 bg-white rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#0071e3]"></div>
                    <CardHeader className="pb-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">
                            <span className="text-[#0071e3]">{selectedKeyword?.keyword}</span>
                          </h2>
                          <CardDescription className="text-gray-500">Detailed information for this keyword</CardDescription>
                        </div>
                        
                        {selectedKeyword && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefreshKeyword(selectedKeyword.id)}
                              className="h-9 px-3 rounded-lg border-[#d2d2d7] bg-white text-gray-700 hover:bg-gray-50 transition-all"
                            >
                              <RefreshCw className="mr-2 h-3.5 w-3.5" />
                              Refresh Data
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {selectedKeyword ? (
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList className="mb-6 w-full justify-start bg-gray-50 p-1 rounded-lg">
                            <TabsTrigger 
                              value="details" 
                              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all duration-300"
                            >
                              Details
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="details" className="mt-0 space-y-6 animate-fade-in">
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatCard
                                  title="Current Rank"
                                  value={selectedKeyword.current_rank ? `#${selectedKeyword.current_rank}` : 'Not ranking'}
                                  icon={<BarChart3 className="h-5 w-5" />}
                                />

                                <StatCard
                                  title="Best Rank"
                                  value={calculateBestRank(selectedKeyword) ? `#${calculateBestRank(selectedKeyword)}` : 'Not available'}
                                  icon={<TrendingUp className="h-5 w-5" />}
                                />

                                <StatCard
                                  title="Rank Change"
                                  value={getRankChangeText(selectedKeyword)}
                                  icon={selectedKeyword.previous_rank !== null && 
                                    selectedKeyword.current_rank !== null && 
                                    (selectedKeyword.previous_rank > selectedKeyword.current_rank) ? 
                                    <CheckCircle className="h-5 w-5" /> : 
                                    <AlertCircle className="h-5 w-5" />}
                                  positive={selectedKeyword.previous_rank !== null && 
                                    selectedKeyword.current_rank !== null && 
                                    (selectedKeyword.previous_rank > selectedKeyword.current_rank)}
                                  iconBgColor={selectedKeyword.previous_rank !== null && 
                                    selectedKeyword.current_rank !== null && 
                                    (selectedKeyword.previous_rank > selectedKeyword.current_rank) ? 
                                    "bg-gradient-to-br from-green-50 to-green-100" : "bg-gradient-to-br from-red-50 to-red-100"}
                                  iconColor={selectedKeyword.previous_rank !== null && 
                                    selectedKeyword.current_rank !== null && 
                                    (selectedKeyword.previous_rank > selectedKeyword.current_rank) ? 
                                    "text-green-600" : "text-red-600"}
                                />
                              </div>

                              <div className="mt-6">
                                <h3 className="text-lg font-medium mb-4">
                                  <span className="text-[#0071e3]">Keyword Details</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <Card className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 relative">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-[#0071e3]"></div>
                                    <CardHeader className="pb-2">
                                      <h4 className="text-md font-medium">
                                        <span className="text-[#0071e3]">Basic Information</span>
                                      </h4>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Keyword</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedKeyword.keyword}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Domain</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedKeyword.domain}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Location</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedKeyword.location_name}</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Last Updated</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {selectedKeyword.last_updated ? new Date(selectedKeyword.last_updated).toLocaleDateString() : 'Unknown'}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 relative">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-[#0071e3]"></div>
                                    <CardHeader className="pb-2">
                                      <h4 className="text-md font-medium">
                                        <span className="text-[#0071e3]">Performance Metrics</span>
                                      </h4>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Previous Position</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {selectedKeyword.previous_rank ? `#${selectedKeyword.previous_rank}` : 'Not available'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Position Change</span>
                                        <span className={`text-sm font-medium ${getRankChangeColor(selectedKeyword)}`}>
                                          {getRankChangeText(selectedKeyword)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Search Volume</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {(selectedKeyword as any)?.search_volume ? (selectedKeyword as any).search_volume.toLocaleString() : 'Unknown'}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card className="border border-gray-100 bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md relative">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-[#0071e3]"></div>
                                    <CardHeader className="pb-2">
                                      <h4 className="text-md font-medium">
                                        <span className="text-[#0071e3]">Tracking Information</span>
                                      </h4>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">First Tracked</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {selectedKeyword.last_updated ? new Date(selectedKeyword.last_updated).toLocaleDateString() : 'Unknown'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Tracking Duration</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {selectedKeyword.last_updated ? 
                                            `${Math.floor((new Date().getTime() - new Date(selectedKeyword.last_updated).getTime()) / (1000 * 60 * 60 * 24))} days` : 
                                            'Unknown'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Update Frequency</span>
                                        <span className="text-sm font-medium text-gray-900">Daily</span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-500">Next Update</span>
                                        <span className="text-sm font-medium text-gray-900">
                                          {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[400px]">
                          <div className="h-16 w-16 rounded-full bg-[#0071e3]/10 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-[#0071e3]" />
                          </div>
                          <p className="text-gray-500 mb-4">Select a keyword to view details</p>
                          {keywords.length > 0 && (
                            <Button
                              variant="outline"
                              onClick={() => handleSelectKeyword(keywords[0])}
                              className="h-10 px-4 rounded-lg border-[#d2d2d7] bg-white text-gray-700 hover:bg-gray-50 transition-all"
                            >
                              Select First Keyword
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        /* Base styles that would normally be in globals.css */
        body {
          background-color: #ffffff;
          color: #222222;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* Animation keyframes */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-fade-in-slow {
          animation: fade-in 0.7s ease-out forwards;
        }
        
        .animate-fade-in-slower {
          animation: fade-in 0.9s ease-out forwards;
        }
      `}</style>
    </div>
  )
}