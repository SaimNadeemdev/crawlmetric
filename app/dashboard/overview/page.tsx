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
  const [hasSession, setHasSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check for session directly with Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Use hardcoded Supabase credentials for client-side
        const supabaseUrl = 'https://nzxgnnpthtefahosnolm.supabase.co'
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56eGdubnB0aHRlZmFob3Nub2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDQ1MDcsImV4cCI6MjA1Njg4MDUwN30.kPPrr1NaDkl1OxP9g0oO9l2tWnKWNw2h4LXiDD7v3Mg'
        
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'supabase.auth.token',
          }
        })
        
        // Check for session in localStorage first
        const storedSession = localStorage.getItem('supabase.auth.token')
        if (storedSession) {
          console.log("Overview - Found stored session in localStorage")
          try {
            const parsedSession = JSON.parse(storedSession)
            if (parsedSession && parsedSession.access_token) {
              console.log("Overview - Using stored session from localStorage")
              setHasSession(true)
            }
          } catch (e) {
            console.error("Overview - Error parsing stored session:", e)
          }
        }
        
        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Overview - Error getting session:", error.message)
          setHasSession(false)
        } else if (data.session) {
          console.log("Overview - Session check successful, user is authenticated")
          setHasSession(true)
        } else {
          console.log("Overview - No session found")
          setHasSession(false)
        }
      } catch (error) {
        console.error("Overview - Unexpected error checking session:", error)
        setHasSession(false)
      } finally {
        setIsCheckingSession(false)
      }
    }
    
    checkSession()
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isCheckingSession && !hasSession) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }, [hasSession, isCheckingSession])

  useEffect(() => {
    const loadKeywords = async () => {
      if (hasSession) {
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

    if (!isCheckingSession && hasSession) {
      loadKeywords()
    }
  }, [hasSession, isCheckingSession, toast])

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

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!hasSession) {
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
      <div className="space-y-6">
        <div className="container mx-auto p-4 space-y-6">
          {/* Rest of your existing dashboard content */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Keywords Overview</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefreshKeywords} disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Rankings
              </Button>
              <Button onClick={handleExportPdf} disabled={isExporting || filteredKeywords.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Keyword Rankings</CardTitle>
              <CardDescription>Monitor all your keyword rankings in one place</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search keywords or domains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {uniqueDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredKeywords.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("keyword")}>
                          Keyword {sortBy === "keyword" && (sortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("domain")}>
                          Domain {sortBy === "domain" && (sortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 text-right"
                          onClick={() => toggleSort("rank")}
                        >
                          Rank {sortBy === "rank" && (sortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 text-right"
                          onClick={() => toggleSort("change")}
                        >
                          Change {sortBy === "change" && (sortOrder === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead className="text-right">Best</TableHead>
                        <TableHead className="text-right">Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeywords.map((keyword) => {
                        // Calculate change
                        let change = 0
                        let changeElement = <Minus className="h-4 w-4" />

                        if (keyword.previous_rank && keyword.current_rank) {
                          change = keyword.previous_rank - keyword.current_rank
                          if (change > 0) {
                            changeElement = (
                              <span className="flex items-center text-green-600 dark:text-green-500">
                                <ArrowUp className="h-4 w-4 mr-1" />
                                {Math.abs(change)}
                              </span>
                            )
                          } else if (change < 0) {
                            changeElement = (
                              <span className="flex items-center text-red-600 dark:text-red-500">
                                <ArrowDown className="h-4 w-4 mr-1" />
                                {Math.abs(change)}
                              </span>
                            )
                          }
                        }

                        return (
                          <TableRow key={keyword.id}>
                            <TableCell className="font-medium">
                              <Link href={`/dashboard?keyword=${keyword.id}`} className="hover:underline text-primary">
                                {keyword.keyword}
                              </Link>
                            </TableCell>
                            <TableCell>{keyword.domain}</TableCell>
                            <TableCell className="text-right">
                              {keyword.current_rank ? `#${keyword.current_rank}` : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">{changeElement}</TableCell>
                            <TableCell className="text-right">
                              {keyword.best_rank ? `#${keyword.best_rank}` : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              {new Date(keyword.last_updated).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard?keyword=${keyword.id}`}>Details</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || domainFilter !== "all"
                      ? "No keywords match your search criteria"
                      : "No keywords found. Add your first keyword to start tracking."}
                  </p>
                  {(searchQuery || domainFilter !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setDomainFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
