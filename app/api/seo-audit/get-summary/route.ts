import { type NextRequest, NextResponse } from "next/server"

// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Prepare the request to DataForSEO API
    const apiEndpoint = "https://api.dataforseo.com/v3/on_page/summary"
    const apiBody = [
      {
        id: taskId,
        limit: 1,
      },
    ]

    console.log(`Getting summary for task ID: ${taskId}`)

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
    
    // Log a snippet of the response for debugging
    console.log(`Summary response for task ${taskId}:`, JSON.stringify(data).substring(0, 500) + "...")
    
    // Process and enhance the response data
    if (data.tasks && data.tasks.length > 0 && data.tasks[0].result && data.tasks[0].result.length > 0) {
      const result = data.tasks[0].result[0]
      
      // Add additional metadata for better UI rendering
      if (result.page_metrics) {
        // Calculate overall health score based on various metrics
        const healthMetrics = [
          result.page_metrics.broken_links ? 0 : 100,
          result.page_metrics.broken_resources ? 0 : 100,
          result.page_metrics.duplicate_content ? 0 : 100,
          result.page_metrics.duplicate_title_tags ? 0 : 100,
          result.page_metrics.no_description_tag ? 0 : 100,
          result.page_metrics.no_h1_tag ? 0 : 100,
          result.page_metrics.no_image_alt ? 0 : 100,
          result.page_metrics.no_image_title ? 50 : 100, // Less critical
          result.page_metrics.redirect_loop ? 0 : 100,
          result.page_metrics.high_loading_time ? 0 : 100,
        ]
        
        const validMetrics = healthMetrics.filter(m => m !== undefined)
        const healthScore = validMetrics.length > 0 
          ? Math.round(validMetrics.reduce((sum, val) => sum + val, 0) / validMetrics.length) 
          : null
          
        result.health_score = healthScore
        
        // Categorize issues by severity
        result.issues = {
          critical: [],
          important: [],
          minor: []
        }
        
        // Add critical issues
        if (result.page_metrics.broken_links) {
          result.issues.critical.push({
            type: "broken_links",
            count: result.page_metrics.broken_links,
            message: "Broken links found on the website"
          })
        }
        
        if (result.page_metrics.broken_resources) {
          result.issues.critical.push({
            type: "broken_resources",
            count: result.page_metrics.broken_resources,
            message: "Broken resources (images, scripts, etc.) found"
          })
        }
        
        if (result.page_metrics.redirect_loop) {
          result.issues.critical.push({
            type: "redirect_loop",
            count: result.page_metrics.redirect_loop,
            message: "Redirect loops detected"
          })
        }
        
        // Add important issues
        if (result.page_metrics.duplicate_title_tags) {
          result.issues.important.push({
            type: "duplicate_title_tags",
            count: result.page_metrics.duplicate_title_tags,
            message: "Pages with duplicate title tags"
          })
        }
        
        if (result.page_metrics.duplicate_content) {
          result.issues.important.push({
            type: "duplicate_content",
            count: result.page_metrics.duplicate_content,
            message: "Pages with duplicate content"
          })
        }
        
        if (result.page_metrics.no_description_tag) {
          result.issues.important.push({
            type: "no_description_tag",
            count: result.page_metrics.no_description_tag,
            message: "Pages missing meta description"
          })
        }
        
        if (result.page_metrics.no_h1_tag) {
          result.issues.important.push({
            type: "no_h1_tag",
            count: result.page_metrics.no_h1_tag,
            message: "Pages missing H1 heading"
          })
        }
        
        // Add minor issues
        if (result.page_metrics.no_image_alt) {
          result.issues.minor.push({
            type: "no_image_alt",
            count: result.page_metrics.no_image_alt,
            message: "Images missing alt text"
          })
        }
        
        if (result.page_metrics.no_image_title) {
          result.issues.minor.push({
            type: "no_image_title",
            count: result.page_metrics.no_image_title,
            message: "Images missing title attribute"
          })
        }
        
        if (result.page_metrics.high_loading_time) {
          result.issues.minor.push({
            type: "high_loading_time",
            count: result.page_metrics.high_loading_time,
            message: "Pages with slow loading time"
          })
        }
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting task summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
