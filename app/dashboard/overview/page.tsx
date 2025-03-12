"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, ArrowUp, ArrowDown, Minus, FileDown, ShieldAlert } from "lucide-react"
import { fetchKeywords, refreshKeywordRankings } from "@/lib/api"
import { generatePdfReport } from "@/lib/pdf-report"
import type { Keyword } from "@/types/keyword"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import DashboardLayout from "@/app/dashboard-layout"

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

  // Check for session
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error("Error getting user:", error)
        router.push('/login')
      }
    }
    
    getUser()
  }, [router])

  useEffect(() => {
    const loadKeywords = async () => {
      if (user) {
        try {
          setIsLoading(true)
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
    }

    if (user) {
      loadKeywords()
    }
  }, [user, toast])

  useEffect(() => {
    // Filter and sort keywords whenever dependencies change
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
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6 apple-scrollbar">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium tracking-tight text-white apple-heading">Keywords Overview</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshKeywords}
                disabled={isRefreshing}
                className="apple-button-secondary rounded-xl"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh All
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting || keywords.length === 0}
                className="apple-button-secondary rounded-xl"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm apple-text">
            View and manage all your tracked keywords across different domains.
          </p>
        </div>

        <Card className="apple-card border border-white/5 bg-black/40 backdrop-blur-md rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium tracking-tight apple-heading">Keywords List</CardTitle>
            <CardDescription className="text-gray-400 apple-subheading">
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
                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 rounded-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger className="w-[180px] bg-black/20 border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Filter by domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                      <SelectItem value="all">All Domains</SelectItem>
                      {uniqueDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-black/20 border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
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
                    className="h-10 w-10 rounded-xl bg-black/20 border border-white/10 text-white hover:bg-white/10"
                  >
                    {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : filteredKeywords.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-black/20 backdrop-blur-md">
                  <p className="text-gray-400 apple-text">No keywords found matching your criteria.</p>
                  <Link href="/dashboard/main">
                    <Button className="mt-4 apple-button-secondary rounded-xl">
                      Add New Keywords
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <Table className="w-full">
                    <TableHeader className="bg-black/30 backdrop-blur-md">
                      <TableRow className="border-white/5 hover:bg-white/5">
                        <TableHead className="text-gray-400 w-1/3">Keyword</TableHead>
                        <TableHead className="text-gray-400">Domain</TableHead>
                        <TableHead className="text-gray-400 text-right">Current Rank</TableHead>
                        <TableHead className="text-gray-400 text-right">Previous Rank</TableHead>
                        <TableHead className="text-gray-400 text-right">Change</TableHead>
                        <TableHead className="text-gray-400 text-right">Last Updated</TableHead>
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
                            className="border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <TableCell className="font-medium text-white">
                              <Link 
                                href={`/dashboard/main?keyword=${keyword.id}`}
                                className="hover:text-blue-400 transition-colors"
                              >
                                {keyword.keyword}
                              </Link>
                            </TableCell>
                            <TableCell className="text-gray-300">{keyword.domain}</TableCell>
                            <TableCell className="text-right font-medium">
                              {keyword.current_rank ? (
                                <span className="text-white">{keyword.current_rank}</span>
                              ) : (
                                <span className="text-gray-500">Not ranking</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-gray-300">
                              {keyword.previous_rank || <span className="text-gray-500">-</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              {rankChange > 0 ? (
                                <span className="text-green-400 flex items-center justify-end">
                                  <ArrowUp className="h-4 w-4 mr-1" />
                                  {rankChange}
                                </span>
                              ) : rankChange < 0 ? (
                                <span className="text-red-400 flex items-center justify-end">
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
                            <TableCell className="text-right text-gray-300">
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
    </DashboardLayout>
  )
}
