"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

// Define a simple AnimatedTitle component since the import is missing
const AnimatedTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

interface ErrorsTabProps {
  errors: any[];
  loading: boolean;
}

interface ErrorItem {
  id: string
  datetime: string
  function: string
  error_code: number
  error_message: string
  http_url: string
  http_method: string
  http_code: number
  http_time: number
  http_response: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
}

export function ErrorsTab({ errors, loading }: ErrorsTabProps) {
  const [filteredFunction, setFilteredFunction] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter errors based on selected function
  const filteredErrors = filteredFunction 
    ? errors.filter(error => error.function === filteredFunction)
    : errors;

  // Get unique functions for filtering
  const uniqueFunctions = Array.from(new Set(errors.map(error => error.function)))

  // Function to format the datetime
  const formatDateTime = (dateTimeStr: string) => {
    try {
      return format(new Date(dateTimeStr), "MMM d, yyyy h:mm a")
    } catch (e) {
      return dateTimeStr
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <AnimatedTitle>
          <h2 className="text-2xl font-bold tracking-tight">Errors</h2>
        </AnimatedTitle>
        <p className="text-muted-foreground">
          View errors encountered during the SEO audit process.
        </p>
      </div>

      {/* Filter options */}
      {!loading && uniqueFunctions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge 
            variant={filteredFunction === null ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/90 transition-all"
            onClick={() => setFilteredFunction(null)}
          >
            All
          </Badge>
          {uniqueFunctions.map(func => (
            <Badge 
              key={func}
              variant={filteredFunction === func ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-all"
              onClick={() => setFilteredFunction(func)}
            >
              {func}
            </Badge>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden backdrop-blur-xl bg-white/50 border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredErrors.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredErrors.map((error, index) => (
            <motion.div key={`${error.id}-${index}`} variants={item}>
              <Card className="overflow-hidden backdrop-blur-xl bg-white/50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline" className="font-medium">
                        {error.function}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(error.datetime)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Error Code:</span>
                        <span className="text-sm">{error.error_code}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">Error Message:</span>
                        <span className="text-sm break-words">{error.error_message}</span>
                      </div>
                      
                      {error.http_url && (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">URL:</span>
                          <span className="text-sm break-words">{error.http_url}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {error.http_method && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Method:</span>
                            <span className="text-sm">{error.http_method}</span>
                          </div>
                        )}
                        
                        {error.http_code > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">HTTP Code:</span>
                            <span className="text-sm">{error.http_code}</span>
                          </div>
                        )}
                        
                        {error.http_time > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Time:</span>
                            <span className="text-sm">{error.http_time.toFixed(2)}s</span>
                          </div>
                        )}
                      </div>
                      
                      {error.http_response && (
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="font-medium text-sm">Response:</span>
                          <div className="bg-gray-50 p-3 rounded-md text-sm font-mono overflow-x-auto">
                            {error.http_response}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="overflow-hidden backdrop-blur-xl bg-white/50 border border-gray-200 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No Errors Found</h3>
            <p className="text-muted-foreground text-sm">
              Great news! No errors were detected during the SEO audit process.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
