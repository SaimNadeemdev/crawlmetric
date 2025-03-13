"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function GlobalErrorHandler() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Safe check for browser environment
    if (typeof window === 'undefined') return
    
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error caught by GlobalErrorHandler:", event.error)
      // You can also log this to an error tracking service
      toast({
        title: "An unexpected error occurred",
        description: event.error?.message || "An unexpected error occurred",
        variant: "destructive",
      })
      // Optionally redirect to an error page
      // router.push('/error')
    }

    window.addEventListener("error", handleError)

    return () => {
      // Safe check for browser environment
      if (typeof window === 'undefined') return
      window.removeEventListener("error", handleError)
    }
  }, [toast])

  return null
}
