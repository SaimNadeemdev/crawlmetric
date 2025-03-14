export const dynamic = 'force-dynamic';

export const dynamic = "force-dynamic"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get DataForSEO credentials
    const username = process.env.DATAFORSEO_USERNAME || "saim@makewebeasy.llc"
    const password = process.env.DATAFORSEO_PASSWORD || "af0929d9a9ee7cad"

    // Create Basic Auth header
    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Test endpoint - using a DataForSEO Labs endpoint
    const apiUrl = "https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages"

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      const responseText = await response.text()
      console.log(`Test API response status: ${response.status}`)
      console.log(`Test API response preview: ${responseText.substring(0, 200)}...`)

      try {
        const responseData = JSON.parse(responseText)
        return NextResponse.json({
          success: true,
          status: response.status,
          data: responseData,
        })
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          error: "Failed to parse response",
          responseText: responseText.substring(0, 500),
          status: response.status,
        })
      }
    } catch (fetchError) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch",
        message: fetchError instanceof Error ? fetchError.message : "Unknown fetch error",
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

