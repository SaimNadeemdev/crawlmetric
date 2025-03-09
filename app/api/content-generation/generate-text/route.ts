import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get DataForSEO credentials from environment variables
    const username = process.env.DATAFORSEO_USERNAME
    const password = process.env.DATAFORSEO_PASSWORD

    if (!username || !password) {
      return NextResponse.json({ error: "API credentials not configured" }, { status: 500 })
    }

    // Parse request body
    const body = await request.json()
    const { text, topic = "", description = "", creativity_index = 3, target_words_count = 500 } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Prepare request data for DataForSEO API
    const requestData = [
      {
        topic: topic || text,
        description: description ? description : "No Description", // Send "No Description" if empty
        creativity_index: creativity_index / 5, // Convert from 1-5 scale to 0-1 scale
        word_count: target_words_count,
        include_conclusion: true,
      },
    ]

    console.log("Sending request to DataForSEO:", JSON.stringify(requestData))

    // Create Basic Auth header
    const authHeader = Buffer.from(`${username}:${password}`).toString("base64")

    // Make request to DataForSEO API
    const response = await fetch("https://api.dataforseo.com/v3/content_generation/generate_text/live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(requestData),
    })

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: `DataForSEO API error: ${response.status} ${errorText}`,
        },
        { status: 500 },
      )
    }

    // Parse response
    const data = await response.json()

    // Check for API-level errors
    if (data.status_code !== 20000) {
      return NextResponse.json(
        {
          error: data.status_message || "API error",
        },
        { status: 500 },
      )
    }

    // Check for task-level errors
    if (!data.tasks || !data.tasks[0] || data.tasks[0].status_code !== 20000) {
      return NextResponse.json(
        {
          error: data.tasks?.[0]?.status_message || "Task processing error",
        },
        { status: 500 },
      )
    }

    // Extract the generated text
    const generatedText = data.tasks[0]?.result?.[0]?.generated_text

    if (!generatedText) {
      return NextResponse.json(
        {
          error: "No content was generated",
        },
        { status: 500 },
      )
    }

    // Return successful response
    return NextResponse.json({
      result: [{ generated_text: generatedText }],
    })
  } catch (error) {
    console.error("Error in generate-text API route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}

