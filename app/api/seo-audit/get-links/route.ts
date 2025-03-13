import { NextRequest, NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function GET(request: NextRequest) {
  console.log("[get-links] Request received")
  
  // Get the task ID from the query parameters
  const taskId = request.nextUrl.searchParams.get("taskId")
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "100")
  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0")

  if (!taskId) {
    console.log("[get-links] No taskId provided")
    return NextResponse.json({ error: "No taskId provided" }, { status: 400 })
  }

  console.log(`[get-links] Fetching links for taskId: ${taskId}, limit: ${limit}, offset: ${offset}`)

  try {
    // Prepare the request to DataForSEO API
    const apiEndpoint = "https://api.dataforseo.com/v3/on_page/links"
    const requestBody = [
      {
        id: taskId,
        limit,
        offset,
      },
    ]

    console.log("[get-links] Making request to DataForSEO API:", apiEndpoint)
    console.log("[get-links] Request body:", JSON.stringify(requestBody))

    // Make the request to DataForSEO API
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${AUTH_HEADER}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[get-links] DataForSEO API error: ${response.status} ${errorText}`)
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("[get-links] Response received from DataForSEO API:", JSON.stringify(data, null, 2).substring(0, 500) + '...')

    // Check if we have results
    if (
      data &&
      data.tasks &&
      data.tasks.length > 0 &&
      data.tasks[0].result &&
      data.tasks[0].result.length > 0 &&
      data.tasks[0].result[0].items
    ) {
      const items = data.tasks[0].result[0].items;
      console.log(`[get-links] Found ${items.length} links results`)
      
      // Transform the data to match our frontend model
      const transformedLinks = items.map((item: any) => ({
        url: item.link_to || '',
        type: item.direction === "internal" ? "internal" : "external",
        status_code: item.page_to_status_code || 0,
        source_url: item.link_from || ''
      }));
      
      console.log(`[get-links] Transformed ${transformedLinks.length} links for frontend`)
      
      // Return the transformed data
      return NextResponse.json({ tasks: [{ result: transformedLinks }] })
    } else {
      console.log("[get-links] No results found in API response")
      return NextResponse.json({ error: "No results found" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("[get-links] Error fetching links:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
