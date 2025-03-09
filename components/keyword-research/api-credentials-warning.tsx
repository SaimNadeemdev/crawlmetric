"use client"

import { CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ApiCredentialsWarning() {
  // We now have hardcoded credentials, so we'll always show that credentials are configured
  return (
    <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle>API Credentials Configured</AlertTitle>
      <AlertDescription>DataForSEO API credentials are configured and ready to use.</AlertDescription>
    </Alert>
  )
}

