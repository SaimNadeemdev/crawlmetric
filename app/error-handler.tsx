"use client"

import { useEffect } from "react"

export function GlobalErrorHandler() {
  useEffect(() => {
    // This will catch any unhandled Promise rejections globally
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault() // Prevents the default error from appearing in console
      console.error("Unhandled Promise rejection:", event.reason)
      // You could also log this to an error tracking service
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return null // This component doesn't render anything
}

