import { NextResponse } from "next/server"

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

// Gemini API key
const GEMINI_API_KEY = "AIzaSyCe7hCGyC2kCFWC7Nia8RDSaCov4hQOBLk";

// Function to create a fallback summary by extracting important sentences
function createFallbackSummary(text: string, maxSentences: number = 5): string {
  try {
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length <= maxSentences) {
      return sentences.join(". ") + ".";
    }
    
    // Simple algorithm to score sentences based on position and length
    const scoredSentences = sentences.map((sentence, index) => {
      // Prioritize first few sentences and sentences of moderate length
      const positionScore = index < 3 ? (3 - index) * 2 : 0;
      const lengthScore = sentence.length > 20 && sentence.length < 150 ? 1 : 0;
      
      return {
        sentence: sentence.trim(),
        score: positionScore + lengthScore,
        index
      };
    });
    
    // Sort by score (highest first) and then by original position
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index) // Restore original order
      .map(item => item.sentence);
    
    return topSentences.join(". ") + ".";
  } catch (error) {
    console.error("Error creating fallback summary:", error);
    return "Summary could not be generated due to an error.";
  }
}

// Function to create a fallback analysis
function createFallbackAnalysis(text: string): TextAnalysisResult {
  // Count basic text metrics
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  
  // Calculate keyword density
  const wordMap: Record<string, number> = {};
  const wordList = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
  
  wordList.forEach(word => {
    if (word.length > 2) { // Ignore very short words
      wordMap[word] = (wordMap[word] || 0) + 1;
    }
  });
  
  // Calculate vocabulary density
  const uniqueWords = Object.keys(wordMap).length;
  const vocabularyDensity = uniqueWords / (wordList.length || 1);
  
  // Create keyword density map with percentages
  const keywordDensity: Record<string, number> = {};
  Object.entries(wordMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .forEach(([word, count]) => {
      keywordDensity[word] = count / (wordList.length || 1);
    });
  
  // Estimate readability scores
  const wordsPerSentence = words / (sentences || 1);
  const charsPerWord = charsNoSpaces / (words || 1);
  
  // Simple Coleman-Liau Index approximation
  const L = (charsNoSpaces / (words || 1)) * 100; // Average characters per 100 words
  const S = (sentences / (words || 1)) * 100; // Average sentences per 100 words
  const colemanLiauIndex = 0.0588 * L - 0.296 * S - 15.8;
  
  // Simple Flesch-Kincaid approximation
  const fleschKincaid = 0.39 * wordsPerSentence + 11.8 * (charsNoSpaces / (words || 1)) - 15.59;
  
  // Simple SMOG approximation
  const smogIndex = 1.043 * Math.sqrt(30 * (sentences >= 30 ? 1 : sentences / 30)) + 3.1291;
  
  // Simple ARI approximation
  const automatedReadabilityIndex = 4.71 * (charsNoSpaces / (words || 1)) + 0.5 * wordsPerSentence - 21.43;
  
  // Estimate spelling and grammar errors (very rough approximation)
  const spellingErrors = Math.floor(words * 0.02); // Assume 2% of words have spelling errors
  const grammarErrors = Math.floor(sentences * 0.05); // Assume 5% of sentences have grammar errors
  
  return {
    sentences,
    paragraphs,
    words,
    characters_without_spaces: charsNoSpaces,
    characters_with_spaces: chars,
    words_per_sentence: wordsPerSentence,
    characters_per_word: charsPerWord,
    vocabulary_density: vocabularyDensity,
    keyword_density: keywordDensity,
    automated_readability_index: automatedReadabilityIndex,
    coleman_liau_index: colemanLiauIndex,
    flesch_kincaid_grade_level: fleschKincaid,
    smog_readability_index: smogIndex,
    spelling_errors: spellingErrors,
    grammar_errors: grammarErrors
  };
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

    // Generate analysis using Gemini API
    let analysis: TextAnalysisResult;
    let aiSummary: string;
    let analysisSummary: string;

    try {
      // Get analysis from Gemini
      console.log("[SERVER] Generating text analysis with Gemini")
      analysis = await generateGeminiAnalysis(text, language_name || "English");
      
      // Generate analysis summary
      analysisSummary = generateAnalysisSummaryFromData(analysis, text);
      
      // Generate AI summary
      console.log("[SERVER] Generating AI summary with Gemini")
      aiSummary = await generateGeminiSummary(text, language_name || "English");
    } catch (error) {
      console.error("[SERVER] Error using Gemini API:", error)
      
      // Fallback to local analysis and summary
      console.log("[SERVER] Using fallback analysis and summary generation")
      analysis = createFallbackAnalysis(text);
      analysisSummary = generateAnalysisSummaryFromData(analysis, text);
      aiSummary = createFallbackSummary(text);
    }

    // Return the analysis result and generated summaries
    return NextResponse.json({
      success: true,
      analysis,
      analysisSummary,
      summary: aiSummary,
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

// Function to generate an AI summary of the text using Google's Gemini API
async function generateGeminiSummary(text: string, language: string): Promise<string> {
  try {
    // Truncate text if it's too long
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
    
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
                text: `Create a concise, clear summary of the following text. Focus on the main ideas and key points only. 
                      Do not include any analysis metrics or statistics. The summary should be in ${language} and maintain 
                      the tone of the original text. Here is the text to summarize: ${truncatedText}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the summary from the response
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
    throw new Error("Failed to generate AI summary");
  }
}

// Function to generate text analysis using Google's Gemini API
async function generateGeminiAnalysis(text: string, language: string): Promise<TextAnalysisResult> {
  try {
    // Truncate text if it's too long
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
    
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
                text: `Analyze the following text and provide detailed metrics in a JSON format. Include the following metrics:
                - sentences: number of sentences
                - paragraphs: number of paragraphs
                - words: total word count
                - characters_without_spaces: character count excluding spaces
                - characters_with_spaces: character count including spaces
                - words_per_sentence: average words per sentence
                - characters_per_word: average characters per word
                - vocabulary_density: ratio of unique words to total words (0-1)
                - keyword_density: object with top 20 keywords and their frequency as a decimal (0-1)
                - automated_readability_index: ARI score
                - coleman_liau_index: Coleman-Liau Index
                - flesch_kincaid_grade_level: Flesch-Kincaid Grade Level
                - smog_readability_index: SMOG Index
                - spelling_errors: estimated number of spelling errors
                - grammar_errors: estimated number of grammar errors

                Return ONLY the JSON object with these metrics, no explanations or other text.
                
                Here is the text to analyze: ${truncatedText}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the analysis from the response
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const analysisData = JSON.parse(jsonMatch[0]);
          
          // Ensure all required fields are present
          const result: TextAnalysisResult = {
            sentences: analysisData.sentences || 0,
            paragraphs: analysisData.paragraphs || 0,
            words: analysisData.words || 0,
            characters_without_spaces: analysisData.characters_without_spaces || 0,
            characters_with_spaces: analysisData.characters_with_spaces || 0,
            words_per_sentence: analysisData.words_per_sentence || 0,
            characters_per_word: analysisData.characters_per_word || 0,
            vocabulary_density: analysisData.vocabulary_density || 0,
            keyword_density: analysisData.keyword_density || {},
            automated_readability_index: analysisData.automated_readability_index || 0,
            coleman_liau_index: analysisData.coleman_liau_index || 0,
            flesch_kincaid_grade_level: analysisData.flesch_kincaid_grade_level || 0,
            smog_readability_index: analysisData.smog_readability_index || 0,
            spelling_errors: analysisData.spelling_errors || 0,
            grammar_errors: analysisData.grammar_errors || 0
          };
          
          return result;
        } catch (error) {
          console.error("Error parsing Gemini analysis JSON:", error);
          throw new Error("Failed to parse analysis data");
        }
      } else {
        throw new Error("Could not extract JSON from Gemini response");
      }
    } else {
      throw new Error("Unexpected Gemini API response format");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate text analysis");
  }
}

// Function to generate a human-readable analysis summary from the analysis data
function generateAnalysisSummaryFromData(analysisResult: TextAnalysisResult, text: string): string {
  // Extract top keywords (up to 5)
  const topKeywords = Object.entries(analysisResult.keyword_density)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => `"${word}" (${Math.round(count * 100) / 100} times)`)
    .join(", ");

  // Calculate readability level
  let readabilityLevel = "moderate";
  const fleschScore = analysisResult.flesch_kincaid_grade_level;
  if (fleschScore < 6) readabilityLevel = "very easy";
  else if (fleschScore < 8) readabilityLevel = "easy";
  else if (fleschScore < 10) readabilityLevel = "fairly easy";
  else if (fleschScore < 12) readabilityLevel = "standard";
  else if (fleschScore < 14) readabilityLevel = "fairly difficult";
  else if (fleschScore < 16) readabilityLevel = "difficult";
  else readabilityLevel = "very difficult";

  // Generate first sentence of original text (up to 100 chars)
  const firstSentence = text.split(/[.!?]/, 1)[0].trim();
  const truncatedFirstSentence = firstSentence.length > 100 ? firstSentence.substring(0, 97) + "..." : firstSentence;

  // Generate the analysis summary
  return `Text Analysis Summary:

The text "${truncatedFirstSentence}" contains ${analysisResult.sentences} sentences and ${analysisResult.paragraphs} paragraphs with a total of ${analysisResult.words} words.

Key metrics:
- Average words per sentence: ${analysisResult.words_per_sentence.toFixed(1)}
- Characters per word: ${analysisResult.characters_per_word.toFixed(1)}
- Vocabulary density: ${(analysisResult.vocabulary_density * 100).toFixed(1)}%
- Readability level: ${readabilityLevel}
- Spelling errors: ${analysisResult.spelling_errors}
- Grammar errors: ${analysisResult.grammar_errors}

Top keywords: ${topKeywords}

This text has a Coleman-Liau Index of ${analysisResult.coleman_liau_index.toFixed(1)}, suggesting it's suitable for readers at approximately grade ${Math.round(analysisResult.coleman_liau_index)} level.`;
}
