import { NextResponse } from "next/server"
import { getRequestData } from "@/lib/dataforseo"

// Define the request body type
interface RequestBody {
  text: string
  target_keywords?: string[]
  creativity?: number
}

// Function to clean and truncate text
function preprocessText(text: string, maxLength = 1500): string {
  // Remove excessive whitespace and newlines
  let cleaned = text.replace(/\s+/g, " ").trim()

  // Truncate if too long
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength)
  }

  return cleaned
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: RequestBody = await request.json()
    let { text, target_keywords = [], creativity = 0.8 } = body

    // Validate the request
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Text must be at least 10 characters long" }, { status: 400 })
    }

    // Preprocess the text to avoid API errors
    text = preprocessText(text)
    console.log(`[SERVER] Preprocessed text length: ${text.length} characters`)

    // Prepare the request data
    const requestData = [
      {
        text,
        target_keywords,
        creativity,
      },
    ]

    console.log("[SERVER] Sending request to DataForSEO Meta Tags API")

    // Send request to DataForSEO API
    const data = await getRequestData("content_generation/generate_meta_tags/live", requestData)

    // Check if the response is valid
    if (!data || !data.tasks || !data.tasks[0]) {
      console.error("[META_TAGS_ERROR] Invalid response from DataForSEO API:", data)
      return NextResponse.json({ error: "Failed to generate meta tags. Invalid response from API." }, { status: 500 })
    }

    // Check for task-level errors
    if (data.tasks[0].status_code !== 20000) {
      console.error(`[META_TAGS_ERROR] Task error: ${data.tasks[0].status_message}`, data.tasks[0])
      return NextResponse.json({ error: `API Error: ${data.tasks[0].status_message}` }, { status: 500 })
    }

    // Extract the meta tags from the response
    const result = data.tasks[0].result?.[0]

    if (!result || !result.title || !result.description) {
      console.error("[META_TAGS_ERROR] No meta tags in response:", result)
      return NextResponse.json({ error: "No meta tags returned from API" }, { status: 500 })
    }

    // Return the meta tags
    return NextResponse.json({
      metaTitle: result.title,
      metaDescription: result.description,
    })
  } catch (error) {
    console.error("[META_TAGS_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

