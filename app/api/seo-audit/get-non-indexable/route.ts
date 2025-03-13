import { NextRequest, NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function GET(request: NextRequest) {
  console.log("[get-non-indexable] Request received")
  
  // Get the task ID from the query parameters
  const taskId = request.nextUrl.searchParams.get("taskId")

  if (!taskId) {
    console.log("[get-non-indexable] No taskId provided")
    return NextResponse.json({ error: "No taskId provided" }, { status: 400 })
  }

  console.log(`[get-non-indexable] Fetching non-indexable pages for taskId: ${taskId}`)

  try {
    // Prepare the request to DataForSEO API
    const apiEndpoint = "https://api.dataforseo.com/v3/on_page/non_indexable"
    const requestBody = [
      {
        id: taskId
      },
    ]

    console.log("[get-non-indexable] Making request to DataForSEO API:", apiEndpoint)
    console.log("[get-non-indexable] Request body:", JSON.stringify(requestBody))

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
      console.error(`[get-non-indexable] DataForSEO API error: ${response.status} ${errorText}`)
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("[get-non-indexable] Response received from DataForSEO API:", JSON.stringify(data, null, 2).substring(0, 500) + '...')

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
      console.log(`[get-non-indexable] Found ${items.length} non-indexable pages`)
      
      // Transform the data to match our frontend model
      const transformedPages = items.map((item: any) => ({
        url: item.url || '',
        reason: item.reason || 'Unknown reason',
        status_code: item.status_code || 0
      }));
      
      console.log(`[get-non-indexable] Transformed ${transformedPages.length} non-indexable pages for frontend`)
      
      // Return the transformed data
      return NextResponse.json({ tasks: [{ result: transformedPages }] })
    } else {
      console.log("[get-non-indexable] No results found in API response")
      return NextResponse.json({ error: "No results found" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("[get-non-indexable] Error fetching non-indexable pages:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
