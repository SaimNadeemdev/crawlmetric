const DATAFORSEO_USERNAME = process.env.DATAFORSEO_USERNAME
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD
const API_URL = "https://api.dataforseo.com/v3/content_generation"

// Base function for making DataForSEO API requests
async function makeRequest(endpoint: string, data: any) {
  try {
    if (!DATAFORSEO_USERNAME || !DATAFORSEO_PASSWORD) {
      throw new Error("DataForSEO credentials not configured")
    }

    const auth = Buffer.from(`${DATAFORSEO_USERNAME}:${DATAFORSEO_PASSWORD}`).toString("base64")

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error in DataForSEO Content API (${endpoint}):`, error)
    throw error
  }
}

// Generate Text
export async function generateText(params: {
  text: string
  creativity_index?: number
  topic?: string
  description?: string
  target_words_count?: number
}) {
  const data = {
    data: [
      {
        text: params.text,
        creativity_index: params.creativity_index || 3,
        topic: params.topic || "",
        description: params.description || "",
        target_words_count: params.target_words_count || 500,
      },
    ],
  }

  return makeRequest("generate/text", data)
}

// Generate Meta Tags
export async function generateMetaTags(params: {
  content: string
  target_type: "title" | "description" | "both"
}) {
  const data = {
    data: [
      {
        content: params.content,
        target_type: params.target_type,
      },
    ],
  }

  return makeRequest("generate/meta_tags", data)
}

// Generate Sub Topics
export async function generateSubTopics(params: {
  topic: string
  subtopics_count?: number
}) {
  const data = {
    data: [
      {
        topic: params.topic,
        subtopics_count: params.subtopics_count || 5,
      },
    ],
  }

  return makeRequest("generate/sub_topics", data)
}

// Paraphrase
export async function paraphraseText(params: {
  text: string
  creativity_index?: number
}) {
  const data = {
    data: [
      {
        text: params.text,
        creativity_index: params.creativity_index || 3,
      },
    ],
  }

  return makeRequest("paraphrase", data)
}

// Check Grammar
export async function checkGrammar(params: {
  text: string
  language_code?: string
  language_name?: string
}) {
  const data = {
    data: [
      {
        text: params.text,
        language_code: params.language_code || "en",
        language_name: params.language_name || "English",
      },
    ],
  }

  return makeRequest("check_grammar", data)
}

// Get Grammar Check Languages
export async function getGrammarLanguages() {
  return makeRequest("check_grammar/languages", { data: [{}] })
}

// Get Grammar Rules
export async function getGrammarRules(params: {
  language_code?: string
  language_name?: string
}) {
  const data = {
    data: [
      {
        language_code: params.language_code || "en",
        language_name: params.language_name || "English",
      },
    ],
  }

  return makeRequest("grammar_rules", data)
}

// Text Summary
export async function generateTextSummary(params: {
  text: string
  language_code?: string
  language_name?: string
  sentences_count?: number
}) {
  const data = {
    data: [
      {
        text: params.text,
        language_code: params.language_code || "en",
        language_name: params.language_name || "English",
        sentences_count: params.sentences_count || 3,
      },
    ],
  }

  return makeRequest("text_summary", data)
}

// Get Text Summary Languages
export async function getTextSummaryLanguages() {
  return makeRequest("text_summary/languages", { data: [{}] })
}

