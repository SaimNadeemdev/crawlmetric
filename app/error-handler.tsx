"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function GlobalErrorHandler() {
  const { toast } = useToast()
  
  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection caught by ErrorHandler:", event.reason)
      // You can also log this to an error tracking service
      toast({
        title: "An unexpected error occurred",
        description: event.reason?.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      // Safe check for browser environment
      if (typeof window !== 'undefined') {
        window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      }
    }
  }, [toast])

  return null // This component doesn't render anything
}
