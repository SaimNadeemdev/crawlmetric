import { type NextRequest, NextResponse } from "next/server"

// DataForSEO API credentials - hardcoded for all users
const API_LOGIN = "saim@makewebeasy.llc"
const API_PASSWORD = "af0929d9a9ee7cad"

// Base64 encode the credentials for Basic Auth
const AUTH_HEADER = Buffer.from(`${API_LOGIN}:${API_PASSWORD}`).toString("base64")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { target, ...options } = body

    if (!target) {
      return NextResponse.json({ error: "Target URL is required" }, { status: 400 })
    }

    // Clean the target URL (remove protocol and www if present)
    let cleanTarget = target.toLowerCase()
    cleanTarget = cleanTarget.replace(/^(https?:\/\/)?(www\.)?/i, "")
    
    // Prepare the request to DataForSEO API with comprehensive options
    const apiEndpoint = "https://api.dataforseo.com/v3/on_page/task_post"
    const apiBody = [
      {
        target: cleanTarget,
        max_crawl_pages: options.max_crawl_pages || 100,
        max_crawl_depth: options.max_crawl_depth || 3,
        load_resources: options.load_resources !== undefined ? options.load_resources : true,
        enable_javascript: options.enable_javascript !== undefined ? options.enable_javascript : true,
        enable_browser_rendering: options.enable_browser_rendering !== undefined ? options.enable_browser_rendering : true,
        custom_js: options.custom_js || null,
        custom_user_agent: options.custom_user_agent || null,
        respect_robots_txt: options.respect_robots_txt !== undefined ? options.respect_robots_txt : true,
        sitemap_check: options.sitemap_check !== undefined ? options.sitemap_check : true,
        custom_sitemap: options.custom_sitemap || null,
        follow_redirects: options.follow_redirects !== undefined ? options.follow_redirects : true,
        check_spell: options.check_spell !== undefined ? options.check_spell : true,
        check_duplicates: options.check_duplicates !== undefined ? options.check_duplicates : true,
        measure_keyword_density: options.measure_keyword_density !== undefined ? options.measure_keyword_density : true,
        obtain_raw_html: options.obtain_raw_html !== undefined ? options.obtain_raw_html : true,
        check_broken_links: options.check_broken_links !== undefined ? options.check_broken_links : true,
        check_broken_resources: options.check_broken_resources !== undefined ? options.check_broken_resources : true,
        check_internal_links: options.check_internal_links !== undefined ? options.check_internal_links : true,
        check_external_links: options.check_external_links !== undefined ? options.check_external_links : true,
        page_screenshot: options.page_screenshot !== undefined ? options.page_screenshot : true,
        sitewide_check: options.sitewide_check !== undefined ? options.sitewide_check : true,
        include_subdomains: options.include_subdomains || false,
        priority_urls: options.priority_urls || null,
        disable_checking_pages: options.disable_checking_pages || null,
        thresholds: options.thresholds || {
          high_loading_time: 3500,
          large_page_size: 2000000
        },
      },
    ]

    console.log("DataForSEO OnPage Task Post Request:", JSON.stringify(apiBody, null, 2))

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
    
    // Log the response for debugging
    console.log("DataForSEO OnPage Task Post Response:", JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error starting site audit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
