export interface KeywordSuggestion {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  keyword_difficulty: number
  trend: number[]
}

export interface KeywordForSite {
  keyword: string
  search_volume: number
  position: number
  cpc: number
  traffic: number
  traffic_cost: number
  url: string
}

export interface KeywordForCategory {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  category: string
}

export interface HistoricalSearchVolume {
  keyword: string
  search_volume: {
    year: number
    month: number
    search_volume: number
  }[]
}

export interface KeywordDifficulty {
  keyword: string
  keyword_difficulty: number
}

export interface KeywordTrend {
  keyword: string
  trend: number[]
}

export interface SerpCompetitor {
  domain: string
  count: number
  avg_position: number
  sum_position: number
  intersections: {
    keyword: string
    position: number
  }[]
}

export interface KeywordIdea {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  keyword_difficulty: number
}

export interface SearchIntent {
  keyword: string
  intent_types: {
    informational: number
    navigational: number
    transactional: number
    commercial: number
  }
  main_intent: "informational" | "navigational" | "transactional" | "commercial"
}

export type ResearchMode =
  | "keyword_suggestions"
  | "keywords_for_site"
  | "keywords_for_categories"
  | "historical_search_volume"
  | "bulk_keyword_difficulty"
  | "keyword_ideas"
  | "keyword_trends"
  | "serp_competitors"
  | "search_intent"

export interface KeywordResearchParams {
  mode: ResearchMode
  keyword?: string
  locationName: string
  languageName: string
  limit?: number
  target?: string
  category?: string
  keywords?: string[]
}

export interface KeywordResult {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  keyword_difficulty: number
  competition_level: "LOW" | "MEDIUM" | "HIGH"
  historical_data?: {
    date: string
    search_volume: number
  }[]
}

export type KeywordResearchMode =
  | "keyword_suggestions"
  | "keywords_for_site"
  | "keywords_for_categories"
  | "historical_search_volume"
  | "bulk_keyword_difficulty"
  | "keyword_trends"
  | "serp_competitors"
  | "keyword_ideas"
  | "search_intent"

export interface KeywordResearchResults {
  id?: string
  user_id?: string
  mode: ResearchMode
  data: any
  queryParams?: KeywordResearchParams
  query_params?: KeywordResearchParams  // For backward compatibility with existing data
  timestamp: string
  created_at?: string
}
