"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { KeywordList } from "@/components/keyword-list"
import { AddKeywordForm } from "@/components/add-keyword-form"
import { KeywordChart } from "@/components/keyword-chart"
import { KeywordSectionWrapper } from "@/components/keyword-section-wrapper"
// import { GrowthMetrics } from "@/components/growth-metrics" // Import the GrowthMetrics component
import { Loader2, Plus, RefreshCw, Grid, AlertTriangle, ShieldAlert, BarChart, FileText, Search } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { fetchKeywords, removeKeyword, refreshKeywordRankings } from "@/lib/api"
import Link from "next/link"
import type { Keyword } from "@/types/keyword"
import DashboardLayout from "@/app/dashboard-layout"
import { createClient } from "@supabase/supabase-js"
import { safeNavigate, safeUpdateUrl, safeGetWindowLocation } from "@/lib/client-utils"

// Force dynamic rendering to prevent serialization errors
export const dynamic = 'force-dynamic';

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
  const [stats, setStats] = useState({
    keywords: 0,
    contentGenerations: 0,
    audits: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)

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
          console.log("Dashboard - Found stored session in localStorage")
          try {
            const parsedSession = JSON.parse(storedSession)
            if (parsedSession && parsedSession.access_token) {
              console.log("Dashboard - Using stored session from localStorage")
              setHasSession(true)
            }
          } catch (e) {
            console.error("Dashboard - Error parsing stored session:", e)
          }
        }
        
        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Dashboard - Error getting session:", error.message)
          setHasSession(false)
          setUser(null)
        } else if (data.session) {
          console.log("Dashboard - Session check successful, user is authenticated")
          setHasSession(true)
          setUser(data.session.user)
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
      safeNavigate('/login')
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)

        // Fetch keywords count
        const keywordsRes = await fetch("/api/keywords")
        const keywordsData = await keywordsRes.json()

        // Fetch content generations (this endpoint would need to be created)
        const contentRes = await fetch("/api/content/history")
        const contentData = await contentRes.json()

        // Fetch audits (this endpoint would need to be created)
        const auditsRes = await fetch("/api/audit/history")
        const auditsData = await auditsRes.json()

        setStats({
          keywords: keywordsData.keywords?.length || 0,
          contentGenerations: contentData.generations?.length || 0,
          audits: auditsData.audits?.length || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Use placeholder data if API calls fail
        setStats({
          keywords: 0,
          contentGenerations: 0,
          audits: 0,
        })
      } finally {
        setStatsLoading(false)
      }
    }

    if (user) {
      fetchStats()
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
            safeUpdateUrl((url) => {
              url.searchParams.delete("keyword")
            })
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

  const handleSelectKeyword = useCallback(
    (keyword: Keyword) => {
      // Safety check for authentication
      if (!user) return

      if (!keyword || !keyword.id) return

      setSelectedKeyword(keyword)

      // Update URL without reloading the page
      try {
        safeUpdateUrl((url) => {
          url.searchParams.set("keyword", keyword.id)
        })
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
      const data = await refreshKeywordRankings()

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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Show login required message if not authenticated
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

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link href="/dashboard/overview">
                <Grid className="mr-2 h-4 w-4" />
                Overview
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshKeywords}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button className="flex-1 sm:flex-none">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Keyword
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add New Keyword</SheetTitle>
                  <SheetDescription>Enter a keyword to track its ranking in search results.</SheetDescription>
                </SheetHeader>
                <KeywordSectionWrapper>
                  <AddKeywordForm onAddKeyword={handleAddKeyword} />
                </KeywordSectionWrapper>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <p className="text-gray-400">
          Welcome back, {user?.user_metadata?.name || "User"}! Here's an overview of your SEO activities.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-gray-800 bg-black/50 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Keywords Tracked</CardTitle>
              <BarChart className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <div className="h-8 w-16 animate-pulse rounded bg-gray-800"></div> : stats.keywords}
              </div>
              <p className="text-xs text-gray-400">Keywords you're currently tracking</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-black/50 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Content Generations</CardTitle>
              <FileText className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-800"></div>
                ) : (
                  stats.contentGenerations
                )}
              </div>
              <p className="text-xs text-gray-400">Pieces of content generated</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-black/50 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SEO Audits</CardTitle>
              <Search className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <div className="h-8 w-16 animate-pulse rounded bg-gray-800"></div> : stats.audits}
              </div>
              <p className="text-xs text-gray-400">Website audits performed</p>
            </CardContent>
          </Card>
        </div>

        {/* Add GrowthMetrics component here */}
        {/* <GrowthMetrics /> */}

        {error && (
          <div className="bg-destructive/10 p-4 rounded-md flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Your Keywords</CardTitle>
              <CardDescription>Manage and track your keywords</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <KeywordSectionWrapper>
                  <KeywordList
                    keywords={keywords || []}
                    onRemoveKeyword={handleRemoveKeyword}
                    onSelectKeyword={handleSelectKeyword}
                    selectedKeywordId={selectedKeyword?.id}
                  />
                </KeywordSectionWrapper>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedKeyword ? `"${selectedKeyword.keyword}" Performance` : "Keyword Performance"}
              </CardTitle>
              <CardDescription>
                {selectedKeyword
                  ? `Tracking for ${selectedKeyword.domain} in ${selectedKeyword.location_name}`
                  : "Select a keyword to view detailed performance"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedKeyword ? (
                <Tabs defaultValue="chart">
                  <TabsList className="mb-4">
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chart" className="mt-0 border-none p-0">
                    <KeywordSectionWrapper>
                      <KeywordChart keyword={selectedKeyword} />
                    </KeywordSectionWrapper>
                  </TabsContent>
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Rank</h3>
                          <p className="text-2xl font-bold">
                            {selectedKeyword.current_rank ? `#${selectedKeyword.current_rank}` : "Not ranking"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Previous Rank</h3>
                          <p className="text-2xl font-bold">
                            {selectedKeyword.previous_rank ? `#${selectedKeyword.previous_rank}` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Rank</h3>
                          <p className="text-2xl font-bold">
                            {selectedKeyword.best_rank ? `#${selectedKeyword.best_rank}` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                          <p className="text-lg">{new Date(selectedKeyword.last_updated).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {selectedKeyword.url && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ranking URL</h3>
                          <a
                            href={selectedKeyword.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline break-all"
                          >
                            {selectedKeyword.url}
                          </a>
                        </div>
                      )}

                      {selectedKeyword.snippet && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">SERP Snippet</h3>
                          <p className="text-sm border p-3 rounded-md bg-muted">{selectedKeyword.snippet}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <p className="text-muted-foreground mb-4">
                    Select a keyword from the list to view detailed performance data
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Keyword
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Add New Keyword</SheetTitle>
                        <SheetDescription>Enter a keyword to track its ranking in search results.</SheetDescription>
                      </SheetHeader>
                      <KeywordSectionWrapper>
                        <AddKeywordForm onAddKeyword={handleAddKeyword} />
                      </KeywordSectionWrapper>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
