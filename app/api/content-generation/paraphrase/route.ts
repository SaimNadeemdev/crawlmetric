import { NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// Gemini API key
const GEMINI_API_KEY = "AIzaSyCe7hCGyC2kCFWC7Nia8RDSaCov4hQOBLk";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { text, creativity_index } = body

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    try {
      console.log("Generating paraphrased text with Gemini API")
      
      // Generate paraphrased text using Gemini
      const paraphrasedText = await paraphraseWithGemini(text, parseFloat(creativity_index) || 0.5);
      
      return NextResponse.json({
        success: true,
        paraphrasedText: paraphrasedText,
        originalText: text,
        metadata: {
          // Estimate token counts based on word count (rough approximation)
          inputTokens: Math.ceil(text.split(/\s+/).length * 1.3),
          outputTokens: Math.ceil(paraphrasedText.split(/\s+/).length * 1.3),
          newTokens: Math.ceil(paraphrasedText.split(/\s+/).length * 0.3), // Estimate 30% new tokens
        },
      })
    } catch (error) {
      console.error("Gemini API error:", error)
      return NextResponse.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to paraphrase text" 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in paraphrase API route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Function to paraphrase text using Google's Gemini API
async function paraphraseWithGemini(text: string, creativityIndex: number = 0.5): Promise<string> {
  try {
    // Convert creativity index to temperature (0.1-1.0)
    const temperature = 0.1 + creativityIndex * 0.9;
    
    // Prepare the request to Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Paraphrase the following text. Maintain the original meaning but use different wording and sentence structure.
                The paraphrased text should be approximately the same length as the original.
                ${creativityIndex > 0.7 ? 'Be creative and use a unique style.' : 'Keep a similar tone to the original text.'}
                
                Here is the text to paraphrase:
                
                "${text}"
                
                Paraphrased version:`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: Math.min(4096, text.length * 2), // Estimate tokens based on text length
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the paraphrased text from the response
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected Gemini API response format");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to paraphrase text");
  }
}
