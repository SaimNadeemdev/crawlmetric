import { type NextRequest, NextResponse } from "next/server"

// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId")
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "100", 10)
    const offset = Number.parseInt(request.nextUrl.searchParams.get("offset") || "0", 10)
    const maxPages = Number.parseInt(request.nextUrl.searchParams.get("maxPages") || "100", 10)

    console.log(`Processing request with maxPages: ${maxPages}, limit: ${limit}`)

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Prepare the request to DataForSEO API
    const apiEndpoint = "https://api.dataforseo.com/v3/on_page/pages"
    const apiBody = [
      {
        id: taskId,
        limit: Math.min(limit, maxPages), // Limit results based on maxPages
        offset,
        // Add filters for HTML resources as per documentation
        filters: [
          ["resource_type", "=", "html"]
        ],
        // Order by content word count descending
        order_by: ["meta.content.plain_text_word_count,desc"]
      },
    ]

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
    
    // Log the response structure to help with debugging
    console.log("DataForSEO pages response structure:", 
      JSON.stringify({
        status_code: data.status_code,
        tasks_count: data.tasks_count,
        tasks_error: data.tasks_error,
        has_tasks: !!data.tasks,
        tasks_length: data.tasks?.length,
        max_pages_requested: maxPages
      })
    )
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting task pages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}