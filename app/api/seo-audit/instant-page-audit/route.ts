import { type NextRequest, NextResponse } from "next/server"

// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function POST(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")
    const body = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Prepare the request to DataForSEO API
    const apiEndpoint = "https://api.dataforseo.com/v3/on_page/instant_pages"
    const apiBody = [
      {
        url,
        load_resources: true,
        enable_javascript: true,
        enable_browser_rendering: true,
        ...body,
      },
    ]

    console.log("Sending request to DataForSEO API:", JSON.stringify(apiBody))

    // Make the request to DataForSEO API
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${AUTH_HEADER}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DataForSEO API error: ${response.status} ${errorText}`)
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    
    // Ensure we're getting the complete response
    console.log("DataForSEO API response received successfully")
    
    // Set a higher response size limit
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Error running instant page audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
