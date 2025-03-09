import { NextResponse } from "next/server"
import { getRequestData } from "@/lib/dataforseo"

export async function POST(request: Request) {
  try {
    const { text, language_code } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    // Prepare request data for DataForSEO
    const requestData = [
      {
        text,
        language_code: language_code || "en-US",
      },
    ]

    console.log("[SERVER] Sending request to DataForSEO Grammar Check API:", JSON.stringify(requestData))

    // Send request to DataForSEO - Using the correct endpoint from documentation
    const response = await getRequestData("content_generation/check_grammar/live", requestData)

    console.log("[SERVER] DataForSEO API response:", JSON.stringify(response))

    // Check if response is valid
    if (!response || !response.tasks || !response.tasks[0] || !response.tasks[0].result) {
      return NextResponse.json({ success: false, error: "Invalid response from DataForSEO" }, { status: 500 })
    }

    // Extract grammar check results
    const result = response.tasks[0].result[0]

    if (!result) {
      return NextResponse.json({ success: false, error: "No results returned from DataForSEO" }, { status: 500 })
    }

    // Format the response
    const formattedResponse = {
      success: true,
      originalText: result.initial_text || text,
      errors: result.items || [],
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error("[SERVER] Error in check-grammar API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

