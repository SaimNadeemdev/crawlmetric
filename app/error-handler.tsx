"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { safeWindowAddEventListener } from "@/lib/client-utils"

export function GlobalErrorHandler() {
  const { toast } = useToast()
  
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: Event) => {
      // Cast to PromiseRejectionEvent since we know it's a promise rejection event
      const promiseEvent = event as PromiseRejectionEvent;
      console.error("Unhandled promise rejection caught by ErrorHandler:", promiseEvent.reason)
      // You can also log this to an error tracking service
      toast({
        title: "An unexpected error occurred",
        description: promiseEvent.reason?.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }

    // Use safe event listener from client utils
    return safeWindowAddEventListener("unhandledrejection", handleUnhandledRejection)
  }, [toast])

  return null
}
