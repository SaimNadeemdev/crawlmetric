import { NextResponse } from "next/server"

// Gemini API key
const GEMINI_API_KEY = "AIzaSyCe7hCGyC2kCFWC7Nia8RDSaCov4hQOBLk";

// Define the request body type
interface RequestBody {
  text: string
  target_keywords?: string[]
  creativity?: number
}

// Function to clean and truncate text
function preprocessText(text: string, maxLength = 4000): string {
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
    // Parse request body
    const body = await request.json()
    const { text, target_keywords, creativity } = body

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    try {
      console.log("Generating meta tags with Gemini API")
      
      // Generate meta tags using Gemini
      const metaTags = await generateMetaTagsWithGemini(
        text, 
        Array.isArray(target_keywords) ? target_keywords : [], 
        parseFloat(creativity) || 0.8
      );
      
      // Final validation to ensure description doesn't get cut off
      let description = metaTags.description;
      
      // If description ends with ellipsis or is cut mid-sentence, fix it
      if (description.endsWith('...') || 
          (description.length > 10 && !description.endsWith('.') && !description.endsWith('!') && !description.endsWith('?'))) {
        
        // Find the last complete sentence
        const lastSentenceEnd = Math.max(
          description.lastIndexOf('.'), 
          description.lastIndexOf('!'), 
          description.lastIndexOf('?')
        );
        
        if (lastSentenceEnd > description.length * 0.6) { // Only truncate if we have a substantial description
          description = description.substring(0, lastSentenceEnd + 1);
        } else {
          // If no good sentence break, ensure it ends with punctuation
          if (!description.endsWith('.') && !description.endsWith('!') && !description.endsWith('?')) {
            description = description + '.';
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        title: metaTags.title,
        description: description,
      })
    } catch (error) {
      console.error("Gemini API error:", error)
      return NextResponse.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate meta tags" 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in generate-meta-tags API route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Function to generate meta tags using Google's Gemini API
async function generateMetaTagsWithGemini(
  text: string, 
  targetKeywords: string[] = [], 
  creativity: number = 0.8
): Promise<{ title: string; description: string }> {
  try {
    // Convert creativity to temperature (0.1-1.0)
    const temperature = Math.min(Math.max(creativity, 0.1), 1.0);
    
    // Format target keywords for the prompt
    const keywordsText = targetKeywords.length > 0 
      ? `Primary keyword: "${targetKeywords[0]}". Secondary keywords: ${targetKeywords.slice(1).map(k => `"${k}"`).join(', ')}.` 
      : 'Extract the most relevant keywords from the content.';
    
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
                text: `You are an expert SEO specialist following Yoast SEO best practices. Create highly effective meta title and meta description for the following content.

IMPORTANT: The input content may contain navigation elements, menu items, or other website structural elements that should NOT be included in meta tags. Examples of things to ignore:
- Navigation menu items (Home, About, Contact, etc.)
- Footer links
- Repeated UI elements
- Form labels
- Button text
- Lists of categories or tags

Instead, focus ONLY on the main content and purpose of the page.

YOAST SEO REQUIREMENTS FOR META TITLE:
1. Length: 50-60 characters (Yoast green zone)
2. Include the primary keyword near the beginning of the title
3. Follow the format: "Primary Keyword - Brand Name" or "Primary Keyword: Secondary Aspect | Brand"
4. Be specific and descriptive, avoid generic titles
5. Use power words that trigger emotion or curiosity
6. Include numbers or specific benefits when relevant (e.g., "5 Ways to...")
7. Avoid keyword stuffing or duplicate keywords
8. Use proper capitalization (capitalize important words)
9. NEVER include navigation items or menu text

YOAST SEO REQUIREMENTS FOR META DESCRIPTION:
1. Length: 120-155 characters MAXIMUM (Yoast green zone)
2. Must end with a complete sentence - no ellipses or cut-off phrases
3. Include primary keyword in the first half of the description
4. Include a clear call-to-action (Learn more, Discover, Find out, etc.)
5. Provide a unique value proposition or benefit
6. Use active voice and conversational tone
7. Match search intent (informational, navigational, transactional)
8. Be specific and descriptive about what users will find
9. NEVER include navigation items, menu text, or lists of links
10. Structure as 2-3 short, complete sentences

${keywordsText}

CONTENT CLEANING INSTRUCTIONS:
1. First, identify and remove all navigation elements, menu items, and structural UI elements
2. Focus on paragraphs of text that describe services, products, or main content
3. Ignore repeated elements that appear to be part of the website template
4. If the content seems very messy or unclear, focus on business name, location, and main service/product

Return ONLY a JSON object with "title" and "description" fields, no explanations or other text.

Content to create meta tags for:
${text}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the meta tags from the response
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const metaTags = JSON.parse(jsonMatch[0]);
          
          if (!metaTags.title || !metaTags.description) {
            throw new Error("Missing title or description in generated meta tags");
          }
          
          // Ensure the description doesn't exceed 155 characters and ends with a complete sentence
          let description = metaTags.description;
          if (description.length > 155) {
            // Find the last complete sentence that fits within 155 characters
            const lastPeriodIndex = description.lastIndexOf('.', 155);
            if (lastPeriodIndex > 100) { // Only truncate if we have a substantial description
              description = description.substring(0, lastPeriodIndex + 1);
            } else {
              // If no good sentence break, truncate at a word boundary
              description = description.substring(0, 155).replace(/\s\S*$/, '');
              if (!description.endsWith('.')) description += '.';
            }
          }
          
          return {
            title: metaTags.title,
            description: description
          };
        } catch (error) {
          console.error("Error parsing Gemini meta tags JSON:", error);
          throw new Error("Failed to parse meta tags data");
        }
      } else {
        throw new Error("Could not extract JSON from Gemini response");
      }
    } else {
      throw new Error("Unexpected Gemini API response format");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate meta tags");
  }
}
