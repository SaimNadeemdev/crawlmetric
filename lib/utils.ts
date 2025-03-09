import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatNumber(input: number): string {
  return new Intl.NumberFormat().format(input)
}

export function truncateText(input: string, length: number): string {
  if (input.length <= length) return input
  return `${input.substring(0, length)}...`
}

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Client-side: use the current window location origin
    // This ensures we use whatever port the browser is currently on
    return window.location.origin
  }
  
  // Server-side
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  
  // For local development, try to detect if port 3000 is in use
  // This is a best effort approach - the most reliable solution is to use window.location.origin on the client
  try {
    // Default to 3000 but allow override via PORT env var
    const port = process.env.PORT || 3001 // Default to 3001 since 3000 seems to be in use
    return `http://localhost:${port}`
  } catch (e) {
    // Fallback to 3000 if anything goes wrong
    return "http://localhost:3000"
  }
}

/**
 * Checks if the DataForSEO API credentials are configured
 * Now always returns true since we have hardcoded credentials
 */
export function isDataForSeoConfigured(): boolean {
  return true
}
