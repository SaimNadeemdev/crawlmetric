"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, ArrowUp, ArrowDown, Minus, FileDown, ShieldAlert, ListFilter, ArrowLeft } from "lucide-react"
import { fetchKeywords, refreshKeywordRankings } from "@/lib/api"
import { generatePdfReport } from "@/lib/pdf-report"
import type { Keyword } from "@/types/keyword"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { motion } from "framer-motion"
import { AnimatedTitle } from "@/components/client-success-section"
import { useRef } from "react"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';


// Initialize Supabase client with hardcoded credentials for client-side use
const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
  },
})

export default function OverviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [filteredKeywords, setFilteredKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("keyword")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [user, setUser] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animated dotted background
  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawDottedBackground = (t: number) => {
      if (!ctx) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const spacing = 30
      const dotSize = 1
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
    
    resizeCanvas()
    animate()

    // Add resize listener
    window.addEventListener("resize", resizeCanvas)

    // Clean up
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Check for session
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    getUser()
  }, [])

  // Load keywords on mount
  useEffect(() => {
    const loadKeywords = async () => {
      try {
        const data = await fetchKeywords()
        setKeywords(data)
        setFilteredKeywords(data)
      } catch (error) {
        console.error("Error loading keywords:", error)
        toast({
          title: "Error loading keywords",
          description: "There was an error loading your keywords. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadKeywords()
    }
  }, [user, toast])

  // Filter and sort keywords when dependencies change
  useEffect(() => {
    let result = [...keywords]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (k) =>
          k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.domain.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply domain filter
    if (domainFilter !== "all") {
      result = result.filter((k) => k.domain === domainFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "keyword":
          valueA = a.keyword.toLowerCase()
          valueB = b.keyword.toLowerCase()
          break
        case "domain":
          valueA = a.domain.toLowerCase()
          valueB = b.domain.toLowerCase()
          break
        case "rank":
          valueA = a.current_rank || 101
          valueB = b.current_rank || 101
          break
        case "change":
          const changeA = a.previous_rank && a.current_rank ? a.previous_rank - a.current_rank : 0
          const changeB = b.previous_rank && b.current_rank ? b.previous_rank - b.current_rank : 0
          valueA = changeA
          valueB = changeB
          break
        default:
          valueA = a.keyword.toLowerCase()
          valueB = b.keyword.toLowerCase()
      }

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    setFilteredKeywords(result)
  }, [keywords, searchQuery, sortBy, sortOrder, domainFilter])

  const handleRefreshKeywords = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      // Use the dedicated refresh function instead
      const data = await refreshKeywordRankings()
      setKeywords(data)
      setFilteredKeywords(data)

      toast({
        title: "Keywords refreshed",
        description: "Your keyword rankings have been updated.",
      })
    } catch (error) {
      console.error("Error refreshing keywords:", error)
      toast({
        title: "Error refreshing keywords",
        description: "There was an error updating your keywords. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExportPdf = async () => {
    if (isExporting) return

    setIsExporting(true)
    try {
      await generatePdfReport(filteredKeywords)

      toast({
        title: "Report generated",
        description: "Your keyword report has been downloaded.",
      })
    } catch (error) {
      console.error("Error generating PDF report:", error)
      toast({
        title: "Error generating report",
        description: "There was an error creating your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  // Get unique domains for filter
  const uniqueDomains = Array.from(new Set(keywords.map((k) => k.domain)))

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-6 max-w-md">You need to be logged in to access this page.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
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
            <AnimatedTitle>Keywords Overview</AnimatedTitle>
          </div>
          <p className="text-gray-500 text-lg">View and manage all your tracked keywords across different domains.</p>
          
          <div className="flex items-center justify-center space-x-2 mt-6">
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
            >
              <Button
                variant="outline"
                onClick={handleExportPdf}
                disabled={isExporting || keywords.length === 0}
                className="h-10 px-4 rounded-lg border-[#d2d2d7] bg-white text-gray-700 hover:bg-gray-50 transition-all"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    <span>Export PDF</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <Card className="border border-gray-100 bg-white/50 backdrop-blur-xl rounded-[22px] shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-medium tracking-tight">Keywords List</CardTitle>
            <CardDescription className="text-gray-500">
              {filteredKeywords.length} keywords tracked across {uniqueDomains.length} domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search keywords or domains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/80 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger className="w-[180px] bg-white/80 border-gray-200 text-gray-900 rounded-xl">
                      <SelectValue placeholder="Filter by domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-gray-900 backdrop-blur-xl rounded-xl">
                      <SelectItem value="all">All Domains</SelectItem>
                      {uniqueDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-white/80 border-gray-200 text-gray-900 rounded-xl">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-gray-900 backdrop-blur-xl rounded-xl">
                      <SelectItem value="keyword">Keyword</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                      <SelectItem value="rank">Current Rank</SelectItem>
                      <SelectItem value="change">Rank Change</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="h-10 w-10 rounded-xl bg-white/80 border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
                </div>
              ) : filteredKeywords.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-white/50 backdrop-blur-md">
                  <p className="text-gray-500">No keywords found matching your criteria.</p>
                  <Link href="/dashboard/main">
                    <Button className="mt-4 h-10 px-4 rounded-lg bg-[#0071e3] hover:bg-[#0062c4] text-white font-medium shadow-sm transition-all hover:shadow-md">
                      Add New Keywords
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-50">
                      <TableRow className="border-gray-200 hover:bg-gray-100">
                        <TableHead className="text-gray-500 w-1/3">Keyword</TableHead>
                        <TableHead className="text-gray-500">Domain</TableHead>
                        <TableHead className="text-gray-500 text-right">Current Rank</TableHead>
                        <TableHead className="text-gray-500 text-right">Previous Rank</TableHead>
                        <TableHead className="text-gray-500 text-right">Change</TableHead>
                        <TableHead className="text-gray-500 text-right">Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeywords.map((keyword) => {
                        const rankChange = keyword.previous_rank && keyword.current_rank
                          ? keyword.previous_rank - keyword.current_rank
                          : 0

                        return (
                          <TableRow 
                            key={keyword.id} 
                            className="border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-900">
                              <Link 
                                href={`/dashboard/main?keyword=${keyword.id}`}
                                className="hover:text-[#0071e3] transition-colors"
                              >
                                {keyword.keyword}
                              </Link>
                            </TableCell>
                            <TableCell className="text-gray-600">{keyword.domain}</TableCell>
                            <TableCell className="text-right font-medium">
                              {keyword.current_rank ? (
                                <span className="text-gray-900">{keyword.current_rank}</span>
                              ) : (
                                <span className="text-gray-400">Not ranking</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {keyword.previous_rank || <span className="text-gray-400">-</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              {rankChange > 0 ? (
                                <span className="text-green-600 flex items-center justify-end">
                                  <ArrowUp className="h-4 w-4 mr-1" />
                                  {rankChange}
                                </span>
                              ) : rankChange < 0 ? (
                                <span className="text-red-600 flex items-center justify-end">
                                  <ArrowDown className="h-4 w-4 mr-1" />
                                  {Math.abs(rankChange)}
                                </span>
                              ) : (
                                <span className="text-gray-400 flex items-center justify-end">
                                  <Minus className="h-4 w-4 mr-1" />
                                  0
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-gray-600">
                              {new Date(keyword.last_updated).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
