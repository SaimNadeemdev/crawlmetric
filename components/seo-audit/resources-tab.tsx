"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  ImageIcon, 
  FileTextIcon, 
  FileCodeIcon, 
  FileIcon, 
  AlertTriangleIcon,
  ArrowUpDown,
  Search,
  SlidersHorizontal
} from "lucide-react"
import { formatNumber } from "@/lib/utils"

// Simple animated title component
const AnimatedTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 400, damping: 25 }}
      className="mb-6"
    >
      <h2 className="text-2xl font-bold tracking-tight">{children}</h2>
    </motion.div>
  )
}

// Resource type icons
const ResourceTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "image":
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    case "stylesheet":
      return <FileTextIcon className="h-4 w-4 text-purple-500" />
    case "script":
      return <FileCodeIcon className="h-4 w-4 text-amber-500" />
    case "broken":
      return <AlertTriangleIcon className="h-4 w-4 text-red-500" />
    default:
      return <FileIcon className="h-4 w-4 text-gray-500" />
  }
}

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
    minSize: "0",
    orderBy: "size,desc"
  })

  // Resource type counts
  const resourceTypeCounts = resources.reduce((acc, resource) => {
    const type = resource.resource_type || "unknown"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Filter resources
  const filteredResources = resources.filter(resource => {
    // Filter by active tab (resource type)
    if (activeTab !== "all" && resource.resource_type !== activeTab) {
      return false
    }

    // Filter by search term
    if (searchTerm && !resource.url.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Filter by minimum size (if not "0" which means "Any size")
    const minSizeValue = parseInt(filters.minSize, 10);
    if (minSizeValue > 0 && resource.size < minSizeValue) {
      return false;
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
        resourceType: value === "all" ? "" : value
      })
    }
  }

  // Handle filter change
  const handleFilterChange = (key: keyof ResourceFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Call onFilterChange if provided
    if (onFilterChange) {
      // For minSize, pass empty string to API when "Any size" (0) is selected
      if (key === "minSize" && value === "0") {
        onFilterChange({
          ...newFilters,
          minSize: ""  // API expects empty string for no minimum size filter
        });
      } else {
        onFilterChange(newFilters);
      }
    }
  }

  // Calculate total size
  const totalSize = filteredResources.reduce((acc, resource) => acc + resource.size, 0)

  return (
    <div className="space-y-6">
      <AnimatedTitle>Resources</AnimatedTitle>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-20" /> : formatNumber(resources.length)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-20" /> : formatFileSize(totalSize)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-20" /> : formatNumber(resourceTypeCounts.image || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Scripts & Styles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? 
                <Skeleton className="h-8 w-20" /> : 
                formatNumber((resourceTypeCounts.script || 0) + (resourceTypeCounts.stylesheet || 0))
              }
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-gray-100/50 backdrop-blur-xl">
            <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
            <TabsTrigger value="image" className="text-xs md:text-sm">Images</TabsTrigger>
            <TabsTrigger value="stylesheet" className="text-xs md:text-sm">CSS</TabsTrigger>
            <TabsTrigger value="script" className="text-xs md:text-sm">Scripts</TabsTrigger>
            <TabsTrigger value="broken" className="text-xs md:text-sm">Broken</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search resources..."
              className="pl-8 bg-white/50 backdrop-blur-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select 
              value={filters.minSize} 
              onValueChange={(value) => handleFilterChange("minSize", value)}
            >
              <SelectTrigger className="w-[140px] bg-white/50 backdrop-blur-xl">
                <SelectValue placeholder="Min size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any size</SelectItem>
                <SelectItem value="10000">10 KB+</SelectItem>
                <SelectItem value="50000">50 KB+</SelectItem>
                <SelectItem value="100000">100 KB+</SelectItem>
                <SelectItem value="500000">500 KB+</SelectItem>
                <SelectItem value="1000000">1 MB+</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.orderBy} 
              onValueChange={(value) => handleFilterChange("orderBy", value)}
            >
              <SelectTrigger className="w-[140px] bg-white/50 backdrop-blur-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="size,desc">Size (Largest)</SelectItem>
                <SelectItem value="size,asc">Size (Smallest)</SelectItem>
                <SelectItem value="url,asc">URL (A-Z)</SelectItem>
                <SelectItem value="url,desc">URL (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/50 backdrop-blur-xl rounded-lg p-4 border border-gray-100">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-xl rounded-lg p-8 text-center border border-gray-100">
          <p className="text-gray-500">No resources found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white/50 backdrop-blur-xl rounded-lg border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="w-[120px]">Size</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Media Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource, index) => (
                <TableRow key={index} className="group hover:bg-gray-50">
                  <TableCell>
                    <ResourceTypeIcon type={resource.resource_type} />
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[300px]">
                    <div className="truncate">
                      {resource.url}
                    </div>
                    {resource.meta?.title && (
                      <div className="text-xs text-gray-500 truncate">
                        {resource.meta.title}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatFileSize(resource.size)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={resource.status_code >= 400 ? "destructive" : "outline"}
                      className={resource.status_code >= 400 ? "bg-red-100 text-red-800 hover:bg-red-100" : ""}
                    >
                      {resource.status_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {resource.media_type || "unknown"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
