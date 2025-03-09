"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex h-full flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
          <p className="mb-8 text-gray-400">{error.message || "An unexpected error occurred"}</p>
          <Button onClick={reset} variant="default">
            Try again
          </Button>
        </div>
      </main>
    </div>
  )
}

