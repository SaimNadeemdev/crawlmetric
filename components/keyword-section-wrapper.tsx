"use client"

import React, { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KeywordSectionWrapperProps {
  children: React.ReactNode
}

export function KeywordSectionWrapper({ children }: KeywordSectionWrapperProps) {
  const [hasError, setHasError] = useState(false)
  const [errorInfo, setErrorInfo] = useState<string | null>(null)

  // Add a global error handler for this section
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught by KeywordSectionWrapper:", event.error)
      setHasError(true)
      setErrorInfo(event.error?.message || "An unexpected error occurred")

      // Prevent the error from propagating
      event.preventDefault()
    }

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection caught by KeywordSectionWrapper:", event.reason)
      setHasError(true)
      setErrorInfo(event.reason?.message || "An unhandled promise rejection occurred")

      // Prevent the rejection from propagating
      event.preventDefault()
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{errorInfo || "An unexpected error occurred"}</p>
        <Button
          onClick={() => {
            setHasError(false)
            setErrorInfo(null)
          }}
          className="mb-4"
        >
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    )
  }

  return <React.Fragment>{children}</React.Fragment>
}

