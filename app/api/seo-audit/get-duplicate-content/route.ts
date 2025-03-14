"use client"

import { NextRequest, NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

// Helper function to ensure URL has https:// prefix
function ensureHttpsPrefix(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export async function GET(request: NextRequest) {
  console.log("[get-duplicate-content] Request received")
  
  // Get the task ID from the query parameters
  const taskId = request.nextUrl.searchParams.get("taskId")
  const url = request.nextUrl.searchParams.get("url")

  if (!taskId) {
    console.log("[get-duplicate-content] No taskId provided")
    return NextResponse.json({ error: "No taskId provided" }, { status: 400 })
  }

  if (!url) {
    console.log("[get-duplicate-content] No url provided")
    return NextResponse.json({ error: "No url provided" }, { status: 400 })
  }

  // Ensure URL has https:// prefix
  const formattedUrl = ensureHttpsPrefix(url)
  console.log(`[get-duplicate-content] Fetching duplicate content for taskId: ${taskId}, url: ${formattedUrl}`)

  try {
    // Prepare the request to DataForSEO API for duplicate content
    const apiEndpoint = "https://api.dataforseo.com/v3/on_page/duplicate_content"
    const requestBody = [
      {
        id: taskId,
        url: formattedUrl,
        similarity_threshold: 0.6, // 60% similarity threshold
        limit: 100
      }
    ]

    console.log(`[get-duplicate-content] Making request to DataForSEO API: ${apiEndpoint}`)
    console.log("[get-duplicate-content] Request body:", JSON.stringify(requestBody, null, 2))

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
      console.error(`[get-duplicate-content] DataForSEO API error: ${response.status} ${errorText}`)
      
      // If we get a 404, it might mean the endpoint doesn't exist or the task ID is invalid
      if (response.status === 404) {
        console.log("[get-duplicate-content] Trying alternative approach with /on_page/pages endpoint")
        
        // Try to use the pages endpoint to get pages with duplicate content
        const pagesEndpoint = "https://api.dataforseo.com/v3/on_page/pages"
        const pagesRequestBody = [
          {
            id: taskId,
            limit: 100,
            filters: [
              ["duplicate_content", "=", true]
            ]
          }
        ]
        
        console.log(`[get-duplicate-content] Making request to pages endpoint: ${pagesEndpoint}`)
        console.log("[get-duplicate-content] Pages request body:", JSON.stringify(pagesRequestBody, null, 2))
        
        const pagesResponse = await fetch(pagesEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Basic ${AUTH_HEADER}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pagesRequestBody),
        })
        
        if (!pagesResponse.ok) {
          const pagesErrorText = await pagesResponse.text()
          console.error(`[get-duplicate-content] DataForSEO pages API error: ${pagesResponse.status} ${pagesErrorText}`)
          return NextResponse.json({ error: pagesErrorText }, { status: pagesResponse.status })
        }
        
        const pagesData = await pagesResponse.json()
        console.log(`[get-duplicate-content] Pages response received:`, JSON.stringify(pagesData, null, 2).substring(0, 500))
        
        // Check if we have results
        if (
          pagesData &&
          pagesData.tasks &&
          pagesData.tasks.length > 0 &&
          pagesData.tasks[0].result &&
          pagesData.tasks[0].result.length > 0 &&
          pagesData.tasks[0].result[0].items
        ) {
          const items = pagesData.tasks[0].result[0].items;
          console.log(`[get-duplicate-content] Found ${items.length} pages with duplicate content`)
          
          // Group pages by their duplicate content
          const duplicateGroups = new Map();
          
          items.forEach((item: any) => {
            if (item.duplicate_content) {
              const url = item.url;
              const pageInfo = {
                url: url,
                meta: {
                  title: item.meta?.title || '',
                  description: item.meta?.description || ''
                },
                content: {
                  plain_text_word_count: item.meta?.content?.plain_text_word_count || 0
                }
              };
              
              // If we don't have a good way to group, just create individual groups
              if (!duplicateGroups.has(url)) {
                duplicateGroups.set(url, {
                  url: url,
                  total_count: 1,
                  pages: [
                    {
                      similarity: 1.0, // We don't have actual similarity data, so use 1.0 for the page itself
                      page: pageInfo
                    }
                  ]
                });
              }
            }
          });
          
          // Convert the Map to an array for the response
          const transformedContent = Array.from(duplicateGroups.values());
          console.log(`[get-duplicate-content] Created ${transformedContent.length} duplicate content groups from pages data`)
          
          // Return the transformed results
          return NextResponse.json({ 
            tasks: [{ 
              result: transformedContent 
            }] 
          })
        } else {
          console.log("[get-duplicate-content] No pages with duplicate content found in the response")
          return NextResponse.json({ tasks: [{ result: [] }] })
        }
      }
      
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[get-duplicate-content] Response received from DataForSEO API:`, JSON.stringify(data, null, 2))

    // Check if we have results
    if (
      data &&
      data.tasks &&
      data.tasks.length > 0 &&
      data.tasks[0].result &&
      data.tasks[0].result.length > 0
    ) {
      const result = data.tasks[0].result;
      console.log(`[get-duplicate-content] Found result data, checking for items`)
      
      // Check if there are items in the result
      if (result[0].items && result[0].items.length > 0) {
        const items = result[0].items;
        console.log(`[get-duplicate-content] Found ${items.length} duplicate content groups`)
        
        // Transform the data to match our frontend model
        const transformedContent = items.map((item: any) => ({
          url: item.url || '',
          total_count: item.total_count || 0,
          pages: item.pages ? item.pages.map((page: any) => ({
            similarity: page.similarity || 0,
            page: {
              url: page.page?.url || '',
              meta: {
                title: page.page?.meta?.title || '',
                description: page.page?.meta?.description || ''
              },
              content: {
                plain_text_word_count: page.page?.content?.plain_text_word_count || 0
              }
            }
          })) : []
        }));
        
        console.log(`[get-duplicate-content] Transformed ${transformedContent.length} duplicate content groups for frontend`)
        
        // Return the transformed results
        return NextResponse.json({ 
          tasks: [{ 
            result: transformedContent 
          }] 
        })
      } else {
        console.log("[get-duplicate-content] No items found in the result")
        return NextResponse.json({ tasks: [{ result: [] }] })
      }
    } else {
      console.log("[get-duplicate-content] No duplicate content found in the response")
      return NextResponse.json({ tasks: [{ result: [] }] })
    }
  } catch (error) {
    console.error("[get-duplicate-content] Error fetching duplicate content:", error)
    return NextResponse.json({ error: "Failed to fetch duplicate content" }, { status: 500 })
  }
}
