"use client"

import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getBaseUrl } from "@/lib/utils"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// DataForSEO API credentials
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

// DataForSEO API base URL
const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { endpoint, method = "POST", data } = body

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 })
    }

    // Get the full URL for the DataForSEO API request
    const url = `${DATAFORSEO_BASE_URL}${endpoint}`

    console.log(`Making request to DataForSEO: ${url}`)
    console.log(`Request data:`, JSON.stringify(data))

    // Make the request to DataForSEO
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${AUTH_HEADER}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    // Get the response text first to log it in case of error
    const responseText = await response.text()

    console.log(`DataForSEO response status: ${response.status}`)
    console.log(`DataForSEO response body: ${responseText.substring(0, 500)}...`)

    if (!response.ok) {
      console.error(`DataForSEO API error: ${response.status} ${responseText}`)
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: responseText },
        { status: response.status },
      )
    }

    // Parse the response text as JSON
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Error parsing API response:", parseError)
      return NextResponse.json({ error: "Invalid JSON response from API", responseText }, { status: 500 })
    }

    // Add CORS headers for development
    const headersList = headers()
    const origin = headersList.get("origin") || getBaseUrl()

    return NextResponse.json(result, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("DataForSEO API request failed:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS(request: Request) {
  const headersList = headers()
  const origin = headersList.get("origin") || getBaseUrl()

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

