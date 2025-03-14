"use client"

import { type NextRequest, NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


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

    console.log(`Processing request with maxPages: ${maxPages}, limit: ${limit}, offset: ${offset}`)

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

    console.log(`Sending request to DataForSEO API: ${JSON.stringify(apiBody)}`)

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
    
    // Check if we have valid data in the expected format
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result[0];
      
      // Log the first result to understand its structure
      console.log("First result structure:", JSON.stringify({
        has_items: !!result.items,
        items_count: result.items?.length,
        total_items_count: result.total_items_count,
        crawl_progress: result.crawl_progress
      }));
      
      // Return a more structured response with pagination info
      return NextResponse.json({
        status: "success",
        crawl_progress: result.crawl_progress,
        crawl_status: result.crawl_status,
        total_items_count: result.total_items_count,
        items_count: result.items?.length || 0,
        offset: offset,
        limit: limit,
        items: result.items || []
      });
    }
    
    // Return empty result if no valid data
    return NextResponse.json({
      status: "success",
      crawl_progress: "unknown",
      crawl_status: {
        max_crawl_pages: maxPages,
        pages_in_queue: 0,
        pages_crawled: 0
      },
      total_items_count: 0,
      items_count: 0,
      offset: offset,
      limit: limit,
      items: []
    })
  } catch (error) {
    console.error("Error getting task pages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
