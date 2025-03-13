"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ImageIcon,
  FileTextIcon,
  FileCodeIcon,
  FileIcon,
  AlertTriangleIcon,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  Info,
  ExternalLink,
} from "lucide-react"
import { formatNumber, cn } from "@/lib/utils"

// Animated title component with Apple-style animation
const AnimatedTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 400, damping: 30 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{children}</h2>
    </motion.div>
  )
}

// Resource type icons with Apple-style colors
const ResourceTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "image":
      return <ImageIcon className="h-4 w-4 text-[#0071e3]" />
    case "stylesheet":
      return <FileTextIcon className="h-4 w-4 text-[#9f44fa]" />
    case "script":
      return <FileCodeIcon className="h-4 w-4 text-[#ff9f0a]" />
    case "broken":
      return <AlertTriangleIcon className="h-4 w-4 text-[#ff3b30]" />
    default:
      return <FileIcon className="h-4 w-4 text-[#8e8e93]" />
  }
}

// Format file size with Apple-style precision
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

interface ResourceItem {
  resource_type: string
  url: string
  size: number
  encoded_size: number
  total_transfer_size: number
  status_code: number
  media_type: string
  content_encoding: string | null
  meta?: {
    alternative_text?: string
    title?: string
    original_width?: number
    original_height?: number
    width?: number
    height?: number
  }
  checks: {
    no_content_encoding?: boolean
    high_loading_time?: boolean
    is_redirect?: boolean
    is_4xx_code?: boolean
    is_5xx_code?: boolean
    is_broken?: boolean
    is_www?: boolean
    is_https?: boolean
    is_http?: boolean
    is_minified?: boolean
    has_subrequests?: boolean
    original_size_displayed?: boolean
  }
  fetch_time: string
  cache_control: {
    cachable: boolean
    ttl: number
  }
}

interface ResourcesTabProps {
  resources: ResourceItem[]
  loading: boolean
  onFilterChange?: (filters: ResourceFilters) => void
}

interface ResourceFilters {
  resourceType: string
  minSize: string
  orderBy: string
}

export function ResourcesTab({ resources = [], loading = false, onFilterChange }: ResourcesTabProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<ResourceFilters>({
    resourceType: "",
    minSize: "10000",
    orderBy: "size,desc",
  })
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  // Debug resources data
  useEffect(() => {
    console.log("ResourcesTab received resources:", resources)
    console.log("ResourcesTab resources length:", resources?.length || 0)
    console.log("ResourcesTab first resource:", resources?.[0] || "No resources")
  }, [resources])

  // Resource type counts
  const resourceTypeCounts = resources.reduce(
    (acc, resource) => {
      const type = resource.resource_type || "unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    // Filter by active tab (resource type)
    if (activeTab !== "all" && resource.resource_type !== activeTab) {
      return false
    }

    // Filter by search term
    if (searchTerm && !resource.url.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Filter by minimum size (if not "0" which means "Any size")
    const minSizeValue = Number.parseInt(filters.minSize, 10)
    if (minSizeValue > 0 && resource.size < minSizeValue) {
      return false
    }

    return true
  })

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update filters if onFilterChange is provided
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        resourceType: value === "all" ? "" : value,
      })
    }
  }

  // Handle filter change
  const handleFilterChange = (key: keyof ResourceFilters, value: string) => {
    const updatedFilters = { ...filters, [key]: value }
    setFilters(updatedFilters)

    // Update filters if onFilterChange is provided
    if (onFilterChange) {
      onFilterChange(updatedFilters)
    }
  }

  // Calculate total size
  const totalSize = filteredResources.reduce((acc, resource) => acc + resource.size, 0)

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  return (
    <div className="space-y-8">
      <AnimatedTitle>Resources</AnimatedTitle>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Resources",
            value: loading ? null : formatNumber(resources.length),
            icon: <FileIcon className="h-5 w-5 text-[#0071e3]" />,
            color: "from-[#0071e3]/10 to-[#0071e3]/5",
          },
          {
            title: "Total Size",
            value: loading ? null : formatFileSize(totalSize),
            icon: <SlidersHorizontal className="h-5 w-5 text-[#9f44fa]" />,
            color: "from-[#9f44fa]/10 to-[#9f44fa]/5",
          },
          {
            title: "Images",
            value: loading ? null : formatNumber(resourceTypeCounts.image || 0),
            icon: <ImageIcon className="h-5 w-5 text-[#ff9f0a]" />,
            color: "from-[#ff9f0a]/10 to-[#ff9f0a]/5",
          },
          {
            title: "Scripts & Styles",
            value: loading
              ? null
              : formatNumber((resourceTypeCounts.script || 0) + (resourceTypeCounts.stylesheet || 0)),
            icon: <FileCodeIcon className="h-5 w-5 text-[#30d158]" />,
            color: "from-[#30d158]/10 to-[#30d158]/5",
          },
        ].map((card, i) => (
          <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="overflow-hidden border border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-50`} />
              <CardHeader className="pb-2 relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
                  <div className="rounded-full bg-white/80 p-1.5 shadow-sm">{card.icon}</div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-semibold text-gray-900">
                  {loading ? <Skeleton className="h-8 w-24 rounded-md" /> : card.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-[22px] border border-gray-200/60 p-4 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-auto overflow-x-auto pb-1 md:pr-4">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-[#f5f5f7] p-1 rounded-[18px] h-auto inline-flex w-auto min-w-full md:min-w-0">
                  <TabsTrigger
                    value="all"
                    className="rounded-[14px] text-sm px-4 py-2 transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-sm whitespace-nowrap"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="rounded-[14px] text-sm px-4 py-2 transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-sm whitespace-nowrap"
                  >
                    <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                    Images
                  </TabsTrigger>
                  <TabsTrigger
                    value="stylesheet"
                    className="rounded-[14px] text-sm px-4 py-2 transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-sm whitespace-nowrap"
                  >
                    <FileTextIcon className="h-3.5 w-3.5 mr-1.5" />
                    CSS
                  </TabsTrigger>
                  <TabsTrigger
                    value="script"
                    className="rounded-[14px] text-sm px-4 py-2 transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:text-[#0071e3] data-[state=active]:shadow-sm whitespace-nowrap"
                  >
                    <FileCodeIcon className="h-3.5 w-3.5 mr-1.5" />
                    Scripts
                  </TabsTrigger>
                  <TabsTrigger
                    value="broken"
                    className="rounded-[14px] text-sm px-4 py-2 transition-all duration-300 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:text-[#ff3b30] data-[state=active]:shadow-sm whitespace-nowrap"
                  >
                    <AlertTriangleIcon className="h-3.5 w-3.5 mr-1.5" />
                    Broken
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow sm:max-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  className="pl-9 h-10 rounded-[14px] border-gray-200 bg-white focus:border-[#06c] focus:ring-1 focus:ring-[#06c]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                <Select value={filters.minSize} onValueChange={(value) => handleFilterChange("minSize", value)}>
                  <SelectTrigger className="w-full sm:w-[110px] h-10 rounded-[14px] border-gray-200 bg-white focus:ring-1 focus:ring-[#0071e3]">
                    <SelectValue placeholder="Min size" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px] border-gray-200 shadow-lg">
                    <SelectItem value="10000">10 KB+</SelectItem>
                    <SelectItem value="50000">50 KB+</SelectItem>
                    <SelectItem value="100000">100 KB+</SelectItem>
                    <SelectItem value="500000">500 KB+</SelectItem>
                    <SelectItem value="1000000">1 MB+</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.orderBy} onValueChange={(value) => handleFilterChange("orderBy", value)}>
                  <SelectTrigger className="w-full sm:w-[110px] h-10 rounded-[14px] border-gray-200 bg-white focus:ring-1 focus:ring-[#0071e3]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[14px] border-gray-200 shadow-lg">
                    <SelectItem value="size,desc">Size (Largest)</SelectItem>
                    <SelectItem value="size,asc">Size (Smallest)</SelectItem>
                    <SelectItem value="url,asc">URL (A-Z)</SelectItem>
                    <SelectItem value="url,desc">URL (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : filteredResources.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-200/60 shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f5f5f7]/50 hover:bg-[#f5f5f7]/50">
                    <TableHead className="w-[50px] font-medium text-gray-500">Type</TableHead>
                    <TableHead className="font-medium text-gray-500">URL</TableHead>
                    <TableHead className="w-[120px] font-medium text-gray-500">
                      <div className="flex items-center">
                        Size
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px] font-medium text-gray-500">Status</TableHead>
                    <TableHead className="w-[120px] font-medium text-gray-500">Media Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource, index) => (
                    <motion.tr
                      key={index}
                      className={cn(
                        "group transition-colors duration-200",
                        hoveredRow === index ? "bg-[#f5f5f7]" : "hover:bg-[#f5f5f7]/50",
                      )}
                      onMouseEnter={() => setHoveredRow(index)}
                      onMouseLeave={() => setHoveredRow(null)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.03,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <TableCell className="py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 group-hover:bg-white transition-colors duration-200">
                          <ResourceTypeIcon type={resource.resource_type} />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 py-3">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="truncate max-w-[300px]">{resource.url}</span>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{
                                opacity: hoveredRow === index ? 1 : 0,
                                scale: hoveredRow === index ? 1 : 0.8,
                              }}
                              transition={{ duration: 0.2 }}
                              className="ml-2"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-[#0071e3]" />
                            </motion.div>
                          </div>
                          {resource.meta?.title && (
                            <div className="text-xs text-gray-500 truncate mt-0.5">{resource.meta.title}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full font-medium border-0 px-2.5 py-0.5 text-xs",
                            resource.size > 500000
                              ? "bg-[#ff3b30]/10 text-[#ff3b30]"
                              : resource.size > 100000
                                ? "bg-[#ff9f0a]/10 text-[#ff9f0a]"
                                : "bg-[#30d158]/10 text-[#30d158]",
                          )}
                        >
                          {formatFileSize(resource.size)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant={resource.status_code >= 400 ? "destructive" : "outline"}
                          className={cn(
                            "rounded-full font-medium border-0 px-2.5 py-0.5 text-xs",
                            resource.status_code >= 400
                              ? "bg-[#ff3b30]/10 text-[#ff3b30]"
                              : resource.status_code >= 300
                                ? "bg-[#ff9f0a]/10 text-[#ff9f0a]"
                                : "bg-[#30d158]/10 text-[#30d158]",
                          )}
                        >
                          {resource.status_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 py-3">
                        <div className="truncate max-w-[120px]">{resource.media_type || "unknown"}</div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200/60 px-4 py-3 bg-[#f5f5f7]/50">
              <div className="text-sm text-gray-500 flex items-center">
                <Info className="h-3.5 w-3.5 text-[#0071e3] mr-2" />
                Showing {filteredResources.length} of {resources.length} resources
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 rounded-full border-gray-200 bg-white hover:bg-[#0071e3] hover:text-white hover:border-[#0071e3] transition-colors duration-200"
              >
                Export Results
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inject CSS styles */}
      <style jsx global>{`
        /* Animation keyframes */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f5f5f7;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #d1d1d6;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a6;
        }
      `}</style>
    </div>
  )
}
