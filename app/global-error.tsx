"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
          <p className="mb-8 text-gray-400">{error.message || "An unexpected error occurred"}</p>
          <Button onClick={reset} variant="default">
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}

