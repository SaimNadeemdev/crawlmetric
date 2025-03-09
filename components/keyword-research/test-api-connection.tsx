"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export function TestApiConnection() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/test-dataforseo")
      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Unknown error")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test connection")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test DataForSEO API Connection</CardTitle>
        <CardDescription>Verify that your DataForSEO API credentials are working correctly</CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Connection successful!</p>
              <p className="text-sm text-green-700">API responded with status {result.status}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Connection failed</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnection} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

