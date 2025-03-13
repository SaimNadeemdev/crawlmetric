import { NextRequest, NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function GET(request: NextRequest) {
  console.log("[get-errors] Request received")
  
  // Get the task ID from the query parameters
  const taskId = request.nextUrl.searchParams.get("taskId")
  const limit = request.nextUrl.searchParams.get("limit") || "100"
  const offset = request.nextUrl.searchParams.get("offset") || "0"
  const filteredFunction = request.nextUrl.searchParams.get("filteredFunction") || null

  if (!taskId) {
    console.log("[get-errors] No taskId provided")
    return NextResponse.json({ error: "No taskId provided" }, { status: 400 })
  }

  console.log(`[get-errors] Fetching errors for taskId: ${taskId}, limit: ${limit}, offset: ${offset}`)

  try {
    // Prepare the request to DataForSEO API for errors
    const apiEndpoint = "https://api.dataforseo.com/v3/on_page/errors"
    const requestBody: any = [
      {
        id: taskId,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    ]

    // Add filtered function if provided
    if (filteredFunction) {
      requestBody[0].filtered_function = filteredFunction
      console.log(`[get-errors] Filtering by function: ${filteredFunction}`)
    }

    console.log(`[get-errors] Making request to DataForSEO API: ${apiEndpoint}`)
    console.log("[get-errors] Request body:", JSON.stringify(requestBody, null, 2))

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
      console.error(`[get-errors] DataForSEO API error: ${response.status} ${errorText}`)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[get-errors] Response received from DataForSEO API:`, JSON.stringify(data, null, 2).substring(0, 500))

    // Check if we have results
    if (
      data &&
      data.tasks &&
      data.tasks.length > 0 &&
      data.tasks[0].result
    ) {
      const result = data.tasks[0].result
      console.log(`[get-errors] Found ${result.length} errors`)
      
      // Transform the data to match our frontend model
      const transformedErrors = result.map((error: any) => ({
        id: error.id || '',
        datetime: error.datetime || '',
        function: error.function || '',
        error_code: error.error_code || 0,
        error_message: error.error_message || '',
        http_url: error.http_url || '',
        http_method: error.http_method || '',
        http_code: error.http_code || 0,
        http_time: error.http_time || 0,
        http_response: error.http_response || ''
      }))
      
      console.log(`[get-errors] Transformed ${transformedErrors.length} errors for frontend`)
      
      // Return the transformed results
      return NextResponse.json({ 
        tasks: [{ 
          result: transformedErrors 
        }] 
      })
    } else {
      console.log("[get-errors] No errors found in the response")
      return NextResponse.json({ 
        tasks: [{ 
          result: [],
          status: "no_errors",
          message: "No errors found for this task."
        }] 
      })
    }
  } catch (error) {
    console.error("[get-errors] Error fetching errors:", error)
    return NextResponse.json({ error: "Failed to fetch errors" }, { status: 500 })
  }
}
