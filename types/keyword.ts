export interface Keyword {
  id: string
  keyword: string
  domain: string
  location_name: string
  language_name: string
  location_code?: string
  language_code?: string
  current_rank: number | null
  previous_rank: number | null
  best_rank: number | null
  url: string | null
  snippet: string | null
  last_updated: string
  user_id: string
  history?: { date: string; position: number }[]
}

export interface KeywordSuggestion {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  keyword_difficulty: number
}

