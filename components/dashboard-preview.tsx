"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart, Search, TrendingUp, Grid, Zap, ChevronRight, LineChart, ArrowUp, ArrowDown, RefreshCw, Filter, Download, Plus, Users, ArrowUpRight, FileText, PenTool, CheckSquare, Settings, Clock } from "lucide-react"

// Simulated keyword data for the preview
const previewKeywords = [
  { id: 1, keyword: "SEO optimization", current_rank: 3, previous_rank: 5, volume: 4800, cpc: 2.45, traffic: 1240, difficulty: 62 },
  { id: 2, keyword: "keyword research tools", current_rank: 7, previous_rank: 12, volume: 3200, cpc: 3.18, traffic: 890, difficulty: 58 },
  { id: 3, keyword: "rank tracking software", current_rank: 4, previous_rank: 4, volume: 2900, cpc: 4.25, traffic: 720, difficulty: 65 },
  { id: 4, keyword: "SEO analytics platform", current_rank: 9, previous_rank: 15, volume: 1800, cpc: 3.75, traffic: 420, difficulty: 70 },
  { id: 5, keyword: "backlink checker", current_rank: 5, previous_rank: 8, volume: 5200, cpc: 2.90, traffic: 1560, difficulty: 54 },
  { id: 6, keyword: "SEO competitor analysis", current_rank: 11, previous_rank: 18, volume: 2100, cpc: 3.40, traffic: 380, difficulty: 67 },
  { id: 7, keyword: "keyword position tracker", current_rank: 6, previous_rank: 9, volume: 1900, cpc: 2.85, traffic: 510, difficulty: 60 },
]

// Simulated competitor data for the preview
const previewCompetitors = [
  { id: 1, domain: "seobuddy.com", keywords: 1240, overlap: 68, avgPosition: 4.2, traffic: 45600, topKeywords: ["seo tools", "rank tracker", "keyword finder"] },
  { id: 2, domain: "ranktracker.io", keywords: 980, overlap: 52, avgPosition: 6.8, traffic: 32400, topKeywords: ["rank tracking", "serp api", "position monitor"] },
  { id: 3, domain: "keywordtool.io", keywords: 1560, overlap: 43, avgPosition: 5.1, traffic: 58700, topKeywords: ["keyword research", "seo keywords", "long tail keywords"] },
  { id: 4, domain: "semrush.com", keywords: 8900, overlap: 37, avgPosition: 2.3, traffic: 124000, topKeywords: ["seo platform", "competitor analysis", "backlink checker"] },
]

// Simulated report data for the preview
const previewReports = [
  { 
    id: 1, 
    name: "Monthly SEO Progress", 
    date: "Mar 5, 2025", 
    status: "completed", 
    metrics: {
      keywordsTracked: 156,
      averagePosition: 12.4,
      topRanking: 24,
      trafficIncrease: "18%"
    },
    description: "Overview of keyword rankings and traffic changes for the past month"
  },
  { 
    id: 2, 
    name: "Competitor Analysis", 
    date: "Feb 28, 2025", 
    status: "completed", 
    metrics: {
      competitorsAnalyzed: 8,
      keywordGap: 342,
      contentGap: 15,
      opportunityScore: 76
    },
    description: "Detailed analysis of top competitors and keyword opportunities"
  },
  { 
    id: 3, 
    name: "Content Gap Analysis", 
    date: "Mar 12, 2025", 
    status: "scheduled", 
    metrics: {
      targetKeywords: 45,
      contentOpportunities: 12,
      estimatedTraffic: "5.2K",
      difficulty: "Medium"
    },
    description: "Identifying content opportunities based on competitor rankings"
  },
  { 
    id: 4, 
    name: "Technical SEO Audit", 
    date: "Mar 15, 2025", 
    status: "scheduled", 
    metrics: {
      pagesScanned: 230,
      issuesFound: 18,
      criticalIssues: 3,
      healthScore: 84
    },
    description: "Comprehensive technical audit of website performance and SEO issues"
  }
]

// Simulated keyword suggestions
const keywordSuggestions = [
  { keyword: "content marketing", search_volume: 12500, cpc: 3.45, competition: 0.75, keyword_difficulty: 68 },
  { keyword: "SEO tools", search_volume: 8900, cpc: 5.20, competition: 0.82, keyword_difficulty: 72 },
  { keyword: "keyword research", search_volume: 6700, cpc: 4.10, competition: 0.79, keyword_difficulty: 65 },
  { keyword: "backlink analysis", search_volume: 4200, cpc: 3.80, competition: 0.68, keyword_difficulty: 59 }
]

// Sample keyword suggestions that would come from the DataForSEO API
const keywordSuggestionsData = [
  { keyword: "seo tools comparison", search_volume: 2900, cpc: 1.85, keyword_difficulty: 65 },
  { keyword: "best rank tracking software", search_volume: 1800, cpc: 2.45, keyword_difficulty: 58 },
  { keyword: "keyword research tool", search_volume: 6500, cpc: 3.20, keyword_difficulty: 72 },
  { keyword: "backlink checker free", search_volume: 8200, cpc: 1.75, keyword_difficulty: 48 },
  { keyword: "website seo analyzer", search_volume: 3700, cpc: 2.10, keyword_difficulty: 42 }
]

// CrawlMetric tools data
const crawlMetricTools = [
  { 
    id: 1, 
    name: "Content Generation", 
    description: "AI-powered content creation for SEO-optimized articles and blog posts",
    icon: "PenTool",
    usageCount: 24,
    lastUsed: "2 days ago",
    color: "from-blue-500 to-indigo-600"
  },
  { 
    id: 2, 
    name: "Keyword Research", 
    description: "Discover high-value keywords with volume and competition metrics",
    icon: "Search",
    usageCount: 56,
    lastUsed: "Today",
    color: "from-green-500 to-emerald-600"
  },
  { 
    id: 3, 
    name: "Keyword Tracker", 
    description: "Monitor your rankings for target keywords across search engines",
    icon: "LineChart",
    usageCount: 32,
    lastUsed: "Yesterday",
    color: "from-purple-500 to-violet-600"
  },
  { 
    id: 4, 
    name: "SEO Audit", 
    description: "Comprehensive website analysis with actionable recommendations",
    icon: "CheckSquare",
    usageCount: 18,
    lastUsed: "3 days ago",
    color: "from-orange-500 to-amber-600"
  }
]

// Recent activities
const recentActivities = [
  {
    id: 1,
    type: "keyword_research",
    title: "Researched 'seo tools comparison'",
    timestamp: "Today at 10:23 AM",
    results: "Found 28 related keywords"
  },
  {
    id: 2,
    type: "content_generation",
    title: "Generated article on 'SEO Best Practices 2025'",
    timestamp: "Yesterday at 3:45 PM",
    results: "2,500 words, 92% quality score"
  },
  {
    id: 3,
    type: "seo_audit",
    title: "Completed audit for example.com",
    timestamp: "Mar 8, 2025",
    results: "78/100 score, 12 issues found"
  }
]

// Utility function for rank change color and text
const getRankChangeColor = (current: number, previous: number) => {
  if (current < previous) return "text-green-500";
  if (current > previous) return "text-red-500";
  return "text-gray-500";
};

const getRankChangeText = (current: number, previous: number) => {
  if (current < previous) return `+${previous - current}`;
  if (current > previous) return `-${current - previous}`;
  return "—";
};

// Add a subtle animation to buttons
const buttonVariants = {
  hover: { 
    scale: 1.05, 
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { 
    scale: 0.95,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

// Card hover animation
const cardVariants = {
  hover: { 
    y: -5, 
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: { type: "spring", stiffness: 300, damping: 15 }
  },
  initial: { 
    y: 0, 
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
  }
};

// Table row animation
const tableRowVariants = {
  hover: {
    backgroundColor: "rgba(79, 70, 229, 0.05)",
    transition: { duration: 0.2 }
  },
  tap: {
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    scale: 0.995,
    transition: { duration: 0.1 }
  }
};

// Pagination button variants
const paginationButtonVariants = {
  active: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    color: "#4f46e5",
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  },
  inactive: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    color: "#9ca3af",
    scale: 1
  },
  hover: {
    scale: 1.1,
    backgroundColor: "#f9fafb",
    transition: { type: "spring", stiffness: 500, damping: 30 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
};

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isTyping, setIsTyping] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [typingInterval, setTypingInterval] = useState<NodeJS.Timeout | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showApiData, setShowApiData] = useState(false)
  
  // Simulate typing in the search box
  useEffect(() => {
    const searchQueries = [
      "best seo keywords",
      "competitor analysis",
      "ranking improvements",
      ""
    ]
    let queryIndex = 0
    let charIndex = 0
    let isDeleting = false
    
    const interval = setInterval(() => {
      const currentQuery = searchQueries[queryIndex]
      
      if (isDeleting) {
        // Delete characters
        setSearchText(prev => prev.substring(0, prev.length - 1))
        charIndex--
        
        // When all characters are deleted
        if (charIndex === 0) {
          isDeleting = false
          queryIndex = (queryIndex + 1) % searchQueries.length
          // Pause before typing next query
          setTimeout(() => {
            setIsTyping(false)
          }, 1000)
        }
      } else {
        // Start typing after pause
        if (charIndex === 0) {
          setIsTyping(true)
        }
        
        // Type characters
        if (charIndex < currentQuery.length) {
          setSearchText(prev => prev + currentQuery[charIndex])
          charIndex++
        } 
        // When query is complete, pause before deleting
        else if (currentQuery.length > 0) {
          setTimeout(() => {
            isDeleting = true
          }, 2000)
        } 
        // If empty query, move to next
        else {
          queryIndex = (queryIndex + 1) % searchQueries.length
        }
      }
    }, 150)
    
    setTypingInterval(interval)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (typingInterval) clearInterval(typingInterval)
    }
  }, [typingInterval])
  
  // Simulate DataForSEO API data loading
  useEffect(() => {
    if (activeTab === "overview") {
      const timer = setTimeout(() => {
        setShowApiData(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setShowApiData(false);
    }
  }, [activeTab]);
  
  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowApiData(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto rounded-[24px] overflow-hidden shadow-2xl border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxHeight: "90vh" }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Browser chrome - iOS style */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center space-x-2">
        <div className="flex space-x-1.5">
          <motion.div 
            className="w-3 h-3 rounded-full bg-red-400"
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 500 }}
          ></motion.div>
          <motion.div 
            className="w-3 h-3 rounded-full bg-yellow-400"
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 500 }}
          ></motion.div>
          <motion.div 
            className="w-3 h-3 rounded-full bg-green-400"
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 500 }}
          ></motion.div>
        </div>
        <div className="flex-1 ml-2">
          <div className="bg-white text-xs text-gray-500 rounded-full py-1.5 px-4 text-center overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="mr-1 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
              </div>
              app.crawlmetrics.io/dashboard
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">CrawlMetric Dashboard</h2>
              <p className="text-xs text-gray-500">Last updated: Today at 9:45 AM</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button 
              className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 flex items-center"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Website
            </motion.button>
            
            <div className="relative">
              <motion.div 
                className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1.5"
                whileHover={{ borderColor: "#d1d5db" }}
                animate={isTyping ? { borderColor: "#d1d5db" } : {}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="text-xs w-24 focus:outline-none bg-transparent" 
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                />
              </motion.div>
            </div>
            
            <motion.button 
              className="text-xs bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-gray-500"
              whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {["overview", "keywords", "competitors", "reports"].map((tab) => (
            <motion.button
              key={tab}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                activeTab === tab 
                  ? "bg-indigo-50 text-indigo-600 font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              initial={false}
              animate={activeTab === tab ? {
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
              } : {
                boxShadow: "none",
              }}
            >
              <span className="capitalize">{tab}</span>
              {activeTab === tab && (
                <motion.div 
                  className="h-1 bg-indigo-500 rounded-full mt-1 mx-auto" 
                  layoutId="activeTab"
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Main content area - single scrollable container */}
      <div className="bg-gray-50 overflow-y-auto" style={{ maxHeight: "calc(90vh - 150px)" }}>
        <div className="p-4">
          {/* Tab content */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Content area */}
            <motion.div 
              className="p-4 max-h-[400px] overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {/* Stats cards */}
              {activeTab === "overview" && (
                <>
                  <motion.div 
                    className="grid grid-cols-3 gap-4 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {[
                      { title: "Keywords Tracked", value: "156", change: "+12%", icon: <Zap className="h-4 w-4 text-indigo-500" /> },
                      { title: "Average Position", value: "8.3", change: "+2.1", icon: <ArrowUp className="h-4 w-4 text-green-500" /> },
                      { title: "Organic Traffic", value: "25.4K", change: "+18%", icon: <Users className="h-4 w-4 text-blue-500" /> }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.title}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        variants={cardVariants}
                        whileHover="hover"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500">{stat.title}</p>
                            <h3 className="text-xl font-semibold text-gray-900 mt-1">{stat.value}</h3>
                            <div className="flex items-center mt-1 text-xs font-medium text-green-500">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              {stat.change}
                            </div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                            {stat.icon}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* CrawlMetric Tools Section */}
                  <motion.div 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="mr-2 text-indigo-500">
                          <Settings className="w-4 h-4" />
                        </div>
                        <h3 className="font-medium text-gray-800">CrawlMetric Tools</h3>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Quick Access</span>
                        <motion.button
                          className="text-xs text-indigo-600 flex items-center"
                          whileHover={{ x: 3 }}
                          whileTap={{ x: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          View All <ChevronRight className="h-3 w-3 ml-1" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {!showApiData ? (
                        <motion.div 
                          className="flex justify-center items-center p-8"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative w-10 h-10">
                              <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-indigo-200 opacity-75"></div>
                              <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">Loading tools...</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 grid grid-cols-2 gap-4"
                        >
                          {crawlMetricTools.map((tool, index) => (
                            <motion.div
                              key={tool.id}
                              className="rounded-lg border border-gray-200 overflow-hidden"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + (index * 0.1) }}
                              variants={cardVariants}
                              whileHover="hover"
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`bg-gradient-to-r ${tool.color} px-4 py-3 flex items-center justify-between`}>
                                <h4 className="font-medium text-white text-sm">{tool.name}</h4>
                                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                                  {tool.icon === "PenTool" && <PenTool className="h-3.5 w-3.5 text-white" />}
                                  {tool.icon === "Search" && <Search className="h-3.5 w-3.5 text-white" />}
                                  {tool.icon === "LineChart" && <LineChart className="h-3.5 w-3.5 text-white" />}
                                  {tool.icon === "CheckSquare" && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                                </div>
                              </div>
                              <div className="p-3">
                                <p className="text-xs text-gray-600 mb-3">{tool.description}</p>
                                <div className="flex justify-between items-center">
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium text-gray-700">{tool.usageCount}</span> uses
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Last used: {tool.lastUsed}
                                  </div>
                                </div>
                                <motion.button
                                  className="mt-3 w-full text-xs font-medium text-indigo-600 border border-indigo-100 rounded-md py-1.5 flex items-center justify-center bg-indigo-50/50"
                                  whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.1)" }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Launch Tool
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  {/* Recent Activity Section */}
                  <motion.div 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="mr-2 text-indigo-500">
                          <Clock className="w-4 h-4" />
                        </div>
                        <h3 className="font-medium text-gray-800">Recent Activity</h3>
                      </div>
                      <motion.button
                        className="text-xs text-indigo-600 flex items-center"
                        whileHover={{ x: 3 }}
                        whileTap={{ x: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        View History <ChevronRight className="h-3 w-3 ml-1" />
                      </motion.button>
                    </div>
                    
                    <div className="p-4">
                      {recentActivities.map((activity, index) => (
                        <motion.div 
                          key={activity.id}
                          className={`flex items-start ${index !== recentActivities.length - 1 ? 'mb-4 pb-4 border-b border-gray-100' : ''}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + (index * 0.1) }}
                        >
                          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            {activity.type === "keyword_research" && (
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Search className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                            {activity.type === "content_generation" && (
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <PenTool className="h-4 w-4 text-blue-600" />
                              </div>
                            )}
                            {activity.type === "seo_audit" && (
                              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <CheckSquare className="h-4 w-4 text-orange-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                              <span className="text-xs text-gray-500">{activity.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{activity.results}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
              
              {/* Keywords table */}
              {activeTab === "keywords" && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Tracked Keywords</h3>
                      <p className="text-xs text-gray-500">Showing top performing keywords</p>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button 
                        className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 flex items-center"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        Filter
                      </motion.button>
                      <motion.button 
                        className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 flex items-center"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keyword
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volume
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Traffic
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Difficulty
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewKeywords.map((keyword, index) => (
                          <motion.tr 
                            key={keyword.id}
                            className="hover:bg-gray-50"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            variants={tableRowVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">#{keyword.current_rank}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={`text-sm ${getRankChangeColor(keyword.current_rank, keyword.previous_rank)}`}>
                                {getRankChangeText(keyword.current_rank, keyword.previous_rank)}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {keyword.volume.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {keyword.traffic.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      keyword.difficulty > 65 ? "bg-red-500" : 
                                      keyword.difficulty > 50 ? "bg-yellow-500" : 
                                      "bg-green-500"
                                    }`}
                                    style={{ width: `${keyword.difficulty}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{keyword.difficulty}</span>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500 px-2 mt-2">
                    <div>Showing 7 of 156 keywords</div>
                    <div className="flex space-x-1">
                      <motion.button 
                        className="px-2 py-1 border border-gray-200 rounded bg-white text-indigo-600"
                        variants={paginationButtonVariants}
                        initial="active"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        1
                      </motion.button>
                      <motion.button 
                        className="px-2 py-1 text-gray-400"
                        variants={paginationButtonVariants}
                        initial="inactive"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        2
                      </motion.button>
                      <motion.button 
                        className="px-2 py-1 text-gray-400"
                        variants={paginationButtonVariants}
                        initial="inactive"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        3
                      </motion.button>
                      <motion.button 
                        className="px-2 py-1 text-gray-400"
                        variants={paginationButtonVariants}
                        initial="inactive"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        ...
                      </motion.button>
                      <motion.button 
                        className="px-2 py-1 text-gray-400"
                        variants={paginationButtonVariants}
                        initial="inactive"
                        whileHover="hover"
                        whileTap="tap"
                      >
                        16
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Competitors table */}
              {activeTab === "competitors" && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Competitor Analysis</h3>
                      <p className="text-xs text-gray-500">Tracking 12 competitor domains</p>
                    </div>
                    <motion.button 
                      className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 flex items-center"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Competitor
                    </motion.button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {previewCompetitors.map((competitor, index) => (
                      <motion.div
                        key={competitor.id}
                        className={`bg-white rounded-xl shadow-sm border ${
                          isHovered ? 'border-indigo-300 ring-1 ring-indigo-300' : 'border-gray-200'
                        } p-4 cursor-pointer`}
                        onClick={() => setIsHovered(true)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        variants={cardVariants}
                        whileHover="hover"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{competitor.domain}</h3>
                            <p className="text-xs text-gray-500">{competitor.keywords} keywords</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="h-2 bg-indigo-500 rounded-full" 
                                style={{ width: `${competitor.overlap}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{competitor.overlap}%</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Top Keywords</h4>
                            <ul className="space-y-1">
                              {competitor.topKeywords.map((kw, idx) => (
                                <li key={idx} className="text-sm text-gray-800 flex items-center">
                                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2"></span>
                                  {kw}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Keyword Gap</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500">Your Keywords</span>
                                <span className="text-xs font-medium">1,893</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div className="h-2 bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                              </div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500">Competitor Keywords</span>
                                <span className="text-xs font-medium">1,240</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div className="h-2 bg-indigo-500 rounded-full" style={{ width: "45%" }}></div>
                              </div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500">Overlap</span>
                                <span className="text-xs font-medium">68%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <motion.button 
                            className="text-xs text-indigo-600 font-medium flex items-center"
                            whileHover={{ x: 3 }}
                            whileTap={{ x: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            View full competitor analysis
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Reports list */}
              {activeTab === "reports" && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">SEO Reports</h3>
                      <p className="text-xs text-gray-500">Detailed performance analysis</p>
                    </div>
                    <motion.button 
                      className="text-xs bg-indigo-600 text-white rounded-full px-3 py-1.5 flex items-center"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Create Report
                    </motion.button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {previewReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        variants={cardVariants}
                        whileHover="hover"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{report.name}</h3>
                            <p className="text-xs text-gray-500">{report.date} • {report.status}</p>
                          </div>
                          <motion.button
                            className="text-xs text-indigo-600 flex items-center"
                            whileHover={{ x: 3 }}
                            whileTap={{ x: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            {report.status === "completed" ? "View" : "Edit"} <ChevronRight className="h-3 w-3 ml-1" />
                          </motion.button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                        
                        <div className="grid grid-cols-4 gap-3">
                          {Object.entries(report.metrics).map(([key, value], idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-sm font-medium text-gray-800">{value}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    className="mt-4 flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      className="text-xs text-gray-500 flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      View all reports <ChevronRight className="h-3 w-3 ml-1" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
