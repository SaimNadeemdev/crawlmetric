"use client"

import { NextResponse } from "next/server"

// Use dynamic route handlers to avoid static generation errors
export const dynamic = 'force-dynamic';


// Gemini API key
const GEMINI_API_KEY = "AIzaSyCe7hCGyC2kCFWC7Nia8RDSaCov4hQOBLk";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { text, description = "", creativity_index = 3, target_words_count = 500 } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log("Generating text with Gemini API")

    // Generate text using Gemini API
    try {
      const generatedText = await generateTextWithGemini(
        text,
        description,
        creativity_index,
        target_words_count
      );

      // Return successful response
      return NextResponse.json({
        result: [{ generated_text: generatedText }],
      })
    } catch (error) {
      console.error("Error generating text with Gemini:", error)
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Failed to generate text",
        },
        { status: 500 },
      )
    }
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

// Function to generate text using Google's Gemini API
async function generateTextWithGemini(
  prompt: string,
  description: string = "",
  creativityIndex: number = 3,
  targetWordCount: number = 500
): Promise<string> {
  try {
    // Convert creativity index from 1-5 scale to temperature (0.1-1.0)
    const temperature = 0.1 + (creativityIndex - 1) * 0.225;
    
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
                text: `Generate a well-structured article based on the following prompt: "${prompt}".
                ${description ? `Additional context: ${description}` : ''}
                
                The article should:
                - Be approximately ${targetWordCount} words
                - Include an introduction, body paragraphs, and conclusion
                - Be informative and engaging
                - Use proper grammar and formatting
                - Be written in a professional tone
                
                Please generate the article now, focusing only on the content without any explanations or meta-commentary.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: Math.min(4096, targetWordCount * 2), // Estimate tokens as roughly 2x word count
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the generated text from the response
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
    throw new Error("Failed to generate text");
  }
}
