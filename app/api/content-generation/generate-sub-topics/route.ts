"use client"

import { NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    // Get credentials from environment variables
    const username = process.env.DATAFORSEO_USERNAME
    const password = process.env.DATAFORSEO_PASSWORD

    if (!username || !password) {
      console.error("DataForSEO credentials not configured")
      return NextResponse.json({ error: "API credentials not configured" }, { status: 500 })
    }

    // Parse request body
    const body = await request.json()
    const { topic, depth = 1 } = body

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    // Create auth header
    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Prepare request data
    const requestData = [
      {
        topic: topic,
        depth: depth,
      },
    ]

    console.log("Sending request to DataForSEO Generate Sub Topics API:", requestData)

    // Make request to DataForSEO API
    const response = await fetch("https://api.dataforseo.com/v3/content_generation/generate_sub_topics/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(requestData),
    })

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text()
      console.error("DataForSEO API error:", response.status, errorText)
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status })
    }

    // Parse response
    const data = await response.json()
    console.log("DataForSEO API response:", data)

    // Check for API-level errors
    if (data.status_code !== 20000) {
      console.error("DataForSEO API returned error:", data.status_message)
      return NextResponse.json({ error: data.status_message || "Unknown API error" }, { status: 500 })
    }

    // Check for task-level errors
    if (data.tasks?.[0]?.status_code !== 20000) {
      console.error("DataForSEO task error:", data.tasks?.[0]?.status_message)
      return NextResponse.json({ error: data.tasks?.[0]?.status_message || "Task processing error" }, { status: 500 })
    }

    // Extract the sub topics
    const result = data.tasks?.[0]?.result?.[0]

    if (!result) {
      console.error("No result returned from API:", data)
      return NextResponse.json({ error: "No sub topics returned from API" }, { status: 500 })
    }

    return NextResponse.json({
      subTopics: result.sub_topics || [],
      originalTopic: topic,
    })
  } catch (error) {
    console.error("Error in generate sub topics API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

