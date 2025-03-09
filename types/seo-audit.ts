export interface InstantPageAuditOptions {
  enable_javascript?: boolean
  enable_browser_rendering?: boolean
  load_resources?: boolean
  custom_js?: string
  custom_user_agent?: string
}

export interface FullSiteAuditOptions {
  max_crawl_pages?: number
  max_crawl_depth?: number
  start_url?: string
  include_subdomains?: boolean
  enable_javascript?: boolean
  enable_browser_rendering?: boolean
  load_resources?: boolean
  custom_js?: string
  custom_user_agent?: string
  priority_urls?: string[]
  respect_robots_txt?: boolean
  follow_redirects?: boolean
  check_spell?: boolean
  check_duplicates?: boolean
}

export interface AuditTask {
  id: string
  status_code: number
  status_message: string
  time: string
  cost: number
  result_count: number
  path: string[]
  data: any
  result: any
}

export interface PageAuditResult {
  crawl_progress: string
  crawl_status: {
    status_code: number
    status_message: string
  }
  domain: string
  checks: {
    meta: {
      title: {
        status: string
        description: string
      }
      description: {
        status: string
        description: string
      }
      // ... other meta checks
    }
    content: {
      // content checks
    }
    links: {
      // link checks
    }
    // ... other check categories
  }
  meta: {
    title: string
    description: string
    charset: string
    canonical: string
    // ... other meta data
  }
  page_timing: {
    time_to_interactive: number
    dom_complete: number
    largest_contentful_paint: number
    // ... other timing metrics
  }
  onpage_score: number
  total_dom_size: number
  content: {
    plain_text_size: number
    plain_text_rate: number
    plain_text_word_count: number
    automated_readability_index: number
    // ... other content metrics
  }
  page_screenshot_data: string
  // ... other page data
}

export interface SiteAuditSummary {
  crawl_progress: string
  crawl_status: {
    status_code: number
    status_message: string
  }
  pages_count: number
  pages_crawled: number
  domain_info: {
    name: string
    cms: string
    ip: string
    server: string
    // ... other domain info
  }
  page_metrics: {
    broken_resources: number
    broken_links: number
    duplicate_title: number
    duplicate_description: number
    duplicate_content: number
    https_pages: number
    // ... other metrics
  }
  // ... other summary data
}

export interface AuditTaskStatus {
  id: string
  status_code: number
  status_message: string
  time: string
}

export interface PageData {
  url: string
  meta: {
    title: string
    description: string
    // ... other meta data
  }
  onpage_score: number
  page_timing: {
    time_to_interactive: number
    // ... other timing metrics
  }
  // ... other page data
}

export interface DuplicateTag {
  type: string
  tag: string
  count: number
  urls: string[]
}

export interface LinkData {
  source_url: string
  destination_url: string
  link_type: string
  link_attributes: string[]
  dofollow: boolean
  // ... other link data
}

export interface LighthouseData {
  url: string
  categories: {
    performance: {
      score: number
    }
    accessibility: {
      score: number
    }
    best_practices: {
      score: number
    }
    seo: {
      score: number
    }
    // ... other categories
  }
  audits: {
    [key: string]: {
      id: string
      title: string
      description: string
      score: number
      // ... other audit data
    }
  }
  // ... other lighthouse data
}

