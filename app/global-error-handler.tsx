"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { safeWindowAddEventListener } from "@/lib/client-utils"

export function GlobalErrorHandler() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleError = (event: Event) => {
      // Cast to ErrorEvent since we know it's an error event
      const errorEvent = event as ErrorEvent;
      console.error("Unhandled error caught by GlobalErrorHandler:", errorEvent.error)
      // You can also log this to an error tracking service
      toast({
        title: "An unexpected error occurred",
        description: errorEvent.error?.message || "An unexpected error occurred",
        variant: "destructive",
      })
      // Optionally redirect to an error page
      // router.push('/error')
    }

    // Use safe event listener from client utils
    return safeWindowAddEventListener("error", handleError)
  }, [toast, router])

  return null
}
