"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { safeWindowAddEventListener } from "@/lib/client-utils"

interface KeywordSectionWrapperProps {
  children: React.ReactNode
}

export function KeywordSectionWrapper({ children }: KeywordSectionWrapperProps) {
  const [hasError, setHasError] = useState(false)
  const [errorInfo, setErrorInfo] = useState<string | null>(null)
  const router = useRouter()

  // Add a global error handler for this section
  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return
    
    // Handle errors and rejections
    const handleError = (e: Event) => {
      // Cast to ErrorEvent since we know it's an error event
      const event = e as ErrorEvent;
      console.error("Caught error:", event.error?.message)
      setHasError(true)
      setErrorInfo(event.error?.message || "An unexpected error occurred")
      // Prevent the error from propagating
      event.preventDefault()
    }

    // Handle promise rejections
    const handleRejection = (e: Event) => {
      // Cast to PromiseRejectionEvent since we know it's a rejection event
      const event = e as PromiseRejectionEvent;
      console.error("Caught rejection:", event.reason)
      setHasError(true)
      setErrorInfo(event.reason?.message || "An unhandled promise rejection occurred")
      // Prevent the rejection from propagating
      event.preventDefault()
    }

    safeWindowAddEventListener("error", handleError)
    safeWindowAddEventListener("unhandledrejection", handleRejection)

    return () => {
      safeWindowAddEventListener("error", handleError, true)
      safeWindowAddEventListener("unhandledrejection", handleRejection, true)
    }
  }, [])

  // Function to safely reload the page
  const handleReload = () => {
    // Use the safe window object from client-utils
    import('@/lib/client-utils').then(({ safeWindow }) => {
      const win = safeWindow();
      if (win) {
        win.location.reload();
      }
    });
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-black/40 backdrop-blur-md border border-white/5 rounded-xl shadow-lg">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-medium mb-2 text-white tracking-tight">Something went wrong</h2>
        <p className="text-gray-400 mb-6 max-w-md">{errorInfo || "An unexpected error occurred"}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              setHasError(false)
              setErrorInfo(null)
            }}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
          >
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReload}
            className="rounded-xl border-white/5 bg-black/40 hover:bg-white/5 hover:text-white transition-all duration-300"
          >
            Reload page
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
