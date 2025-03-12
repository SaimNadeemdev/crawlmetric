import { NextRequest, NextResponse } from "next/server"

// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function GET(request: NextRequest) {
  console.log("[get-duplicate-tags] Request received")
  
  // Get the task ID from the query parameters
  const taskId = request.nextUrl.searchParams.get("taskId")

  if (!taskId) {
    console.log("[get-duplicate-tags] No taskId provided")
    return NextResponse.json({ error: "No taskId provided" }, { status: 400 })
  }

  console.log(`[get-duplicate-tags] Fetching duplicate tags for taskId: ${taskId}`)

  try {
    // We'll try multiple tag types in sequence
    const tagTypes = ["duplicate_title", "duplicate_description"];
    let allResults: any[] = [];
    
    // Try each tag type
    for (const type of tagTypes) {
      try {
        // Prepare the request to DataForSEO API with the correct parameters
        const apiEndpoint = "https://api.dataforseo.com/v3/on_page/duplicate_tags"
        const requestBody = [
          {
            id: taskId,
            type: type,
            limit: 100
          }
        ]

        console.log(`[get-duplicate-tags] Making request to DataForSEO API for ${type}:`, apiEndpoint)
        console.log("[get-duplicate-tags] Request body:", JSON.stringify(requestBody))

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
          console.error(`[get-duplicate-tags] DataForSEO API error for ${type}: ${response.status} ${errorText}`)
          continue; // Try the next tag type
        }

        const data = await response.json()
        console.log(`[get-duplicate-tags] Response received from DataForSEO API for ${type}:`, JSON.stringify(data, null, 2))

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
          console.log(`[get-duplicate-tags] Found ${items.length} duplicate ${type} groups`)
          
          // Transform the data to match our frontend model and add the tag type
          const transformedTags = items.map((item: any) => ({
            tag_type: type,
            duplicate_value: item.accumulator || '',
            pages: item.pages ? item.pages.map((page: any) => page.url) : []
          }));
          
          // Add to our collection
          allResults = [...allResults, ...transformedTags];
        }
      } catch (error: any) {
        console.error(`[get-duplicate-tags] Error fetching ${type}:`, error.message)
        // Continue with the next tag type
      }
    }
    
    console.log(`[get-duplicate-tags] Transformed ${allResults.length} total duplicate tag groups for frontend`)
    
    // Return the combined results
    return NextResponse.json({ 
      tasks: [{ 
        result: allResults 
      }] 
    })
  } catch (error: any) {
    console.error("[get-duplicate-tags] Error fetching duplicate tags:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
