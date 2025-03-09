import { NextResponse } from "next/server"
import { getRequestData } from "@/lib/dataforseo"

// Define the interface for the text analysis result
interface TextAnalysisResult {
  sentences: number
  paragraphs: number
  words: number
  characters_without_spaces: number
  characters_with_spaces: number
  words_per_sentence: number
  characters_per_word: number
  vocabulary_density: number
  keyword_density: Record<string, number>
  automated_readability_index: number
  coleman_liau_index: number
  flesch_kincaid_grade_level: number
  smog_readability_index: number
  spelling_errors: number
  grammar_errors: number
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { text, language_name } = body

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    console.log("[SERVER] Processing text analysis request")

    // Prepare request data for DataForSEO API
    const requestData = [
      {
        text: text,
        language_name: language_name || "English (United States)",
      },
    ]

    console.log("[SERVER] Sending request to DataForSEO Text Summary API")

    // Send request to DataForSEO API
    const apiResponse = await getRequestData("content_generation/text_summary/live", requestData)

    console.log("[SERVER] DataForSEO API response received")

    // Check if the API response is valid
    if (!apiResponse || !apiResponse.tasks || apiResponse.tasks.length === 0) {
      console.error("[SERVER] Invalid API response:", apiResponse)
      return NextResponse.json({ success: false, error: "Invalid API response" }, { status: 500 })
    }

    // Extract the task from the response
    const task = apiResponse.tasks[0]

    // Check if the task was successful
    if (task.status_code !== 20000) {
      console.error("[SERVER] Task failed:", task)
      return NextResponse.json(
        {
          success: false,
          error: task.status_message || "Task failed",
        },
        { status: 500 },
      )
    }

    // Check if the task has results
    if (!task.result || task.result.length === 0) {
      console.error("[SERVER] No results in task:", task)
      return NextResponse.json({ success: false, error: "No results returned from API" }, { status: 500 })
    }

    // Extract the analysis result from the response
    const analysisResult = task.result[0] as TextAnalysisResult

    // Generate a human-readable summary from the analysis data
    const generatedSummary = generateSummaryFromAnalysis(analysisResult, text)

    // Return the analysis result and generated summary
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      summary: generatedSummary,
    })
  } catch (error) {
    console.error("[TEXT_SUMMARY_ERROR]", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Function to generate a human-readable summary from the analysis data
function generateSummaryFromAnalysis(analysis: TextAnalysisResult, originalText: string): string {
  // Extract top keywords (up to 5)
  const topKeywords = Object.entries(analysis.keyword_density)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => `"${word}" (${count} times)`)

  // Calculate readability level
  let readabilityLevel = "moderate"
  const fleschScore = analysis.flesch_kincaid_grade_level
  if (fleschScore > 90) readabilityLevel = "very easy"
  else if (fleschScore > 80) readabilityLevel = "easy"
  else if (fleschScore > 70) readabilityLevel = "fairly easy"
  else if (fleschScore > 60) readabilityLevel = "standard"
  else if (fleschScore > 50) readabilityLevel = "fairly difficult"
  else if (fleschScore > 30) readabilityLevel = "difficult"
  else readabilityLevel = "very difficult"

  // Generate first sentence of original text (up to 100 chars)
  const firstSentence = originalText.split(/[.!?]/, 1)[0].trim()
  const truncatedFirstSentence = firstSentence.length > 100 ? firstSentence.substring(0, 97) + "..." : firstSentence

  // Generate the summary
  return `Text Analysis Summary:

The text "${truncatedFirstSentence}" contains ${analysis.sentences} sentences and ${analysis.paragraphs} paragraphs with a total of ${analysis.words} words.

Key metrics:
- Average words per sentence: ${analysis.words_per_sentence.toFixed(1)}
- Characters per word: ${analysis.characters_per_word.toFixed(1)}
- Vocabulary density: ${(analysis.vocabulary_density * 100).toFixed(1)}%
- Readability level: ${readabilityLevel}
- Spelling errors: ${analysis.spelling_errors}
- Grammar errors: ${analysis.grammar_errors}

Top keywords: ${topKeywords.join(", ")}

This text has a Coleman-Liau Index of ${analysis.coleman_liau_index.toFixed(1)}, suggesting it's suitable for readers at approximately grade ${Math.round(analysis.coleman_liau_index)} level.`
}

