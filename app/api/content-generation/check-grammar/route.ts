import { NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// Gemini API key
const GEMINI_API_KEY = "AIzaSyCe7hCGyC2kCFWC7Nia8RDSaCov4hQOBLk";

// Define the interface for grammar error
interface GrammarError {
  id: string;
  offset: number;
  length: number;
  description: string;
  suggestions: string[];
  type: string;
}

export async function POST(request: Request) {
  try {
    const { text, language_code } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    console.log("[SERVER] Checking grammar with Gemini API")

    try {
      // Get grammar errors from Gemini
      const errors = await checkGrammarWithGemini(text, language_code || "en-US");
      
      // Format the response
      const formattedResponse = {
        success: true,
        originalText: text,
        errors: errors,
      }

      return NextResponse.json(formattedResponse)
    } catch (error) {
      console.error("[SERVER] Gemini API error:", error)
      return NextResponse.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to check grammar" 
      }, { status: 500 })
    }
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

// Function to check grammar using Google's Gemini API
async function checkGrammarWithGemini(text: string, languageCode: string): Promise<GrammarError[]> {
  try {
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
                text: `Check the following text for grammar, spelling, and punctuation errors. 
                For each error found, provide:
                1. The error text
                2. The position (offset) of the error in the text
                3. The length of the error text
                4. A description of the error
                5. Suggestions for correction
                6. The type of error (grammar, spelling, punctuation, style)
                
                Return ONLY a JSON array of errors with these fields: id, offset, length, description, suggestions (array), and type.
                If there are no errors, return an empty array.
                
                Language: ${languageCode}
                
                Text to check:
                "${text}"`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the grammar check results from the response
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response text
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const errors = JSON.parse(jsonMatch[0]);
          
          // Validate and format the errors
          return errors.map((error: any, index: number) => ({
            id: error.id || `error-${index + 1}`,
            offset: error.offset || 0,
            length: error.length || 0,
            description: error.description || "Unknown error",
            suggestions: Array.isArray(error.suggestions) ? error.suggestions : [],
            type: error.type || "grammar"
          }));
        } catch (error) {
          console.error("Error parsing Gemini grammar check JSON:", error);
          throw new Error("Failed to parse grammar check data");
        }
      } else {
        // If no JSON array is found, assume no errors
        return [];
      }
    } else {
      throw new Error("Unexpected Gemini API response format");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to check grammar");
  }
}
