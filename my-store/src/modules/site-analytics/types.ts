export type SiteAnalyticsEventType = "page_view" | "page_leave"

export type SiteAnalyticsEventRecord = {
  id: string
  event_type: SiteAnalyticsEventType
  visitor_id: string
  session_id: string | null
  path: string
  full_path: string | null
  country_code: string | null
  duration_seconds: number | null
  referrer: string | null
  user_agent: string | null
  ip_address: string | null
  metadata: Record<string, unknown> | null
  occurred_at: string
  created_at: string
  updated_at: string
}

export type CreateSiteAnalyticsEventInput = {
  event_type: SiteAnalyticsEventType
  visitor_id: string
  session_id?: string | null
  path: string
  full_path?: string | null
  country_code?: string | null
  duration_seconds?: number | null
  referrer?: string | null
  user_agent?: string | null
  ip_address?: string | null
  occurred_at?: string | null
  metadata?: Record<string, unknown> | null
}

export type SiteAnalyticsLogSortField =
  | "occurred_at"
  | "created_at"
  | "event_type"
  | "country_code"
  | "path"
  | "duration_seconds"

export type SiteAnalyticsLogSortDirection = "asc" | "desc"

export type SiteAnalyticsLogFilters = {
  start_at?: string | null
  end_at?: string | null
  country_code?: string | null
  path?: string | null
  limit?: number
  offset?: number
  sort_by?: SiteAnalyticsLogSortField
  sort_direction?: SiteAnalyticsLogSortDirection
}

export type SiteAnalyticsLogListResult = {
  logs: SiteAnalyticsEventRecord[]
  count: number
  limit: number
  offset: number
}

export type SiteAnalyticsDailyMetric = {
  date: string
  page_views: number
  unique_visitors: number
}

export type SiteAnalyticsCountryDailyMetric = SiteAnalyticsDailyMetric & {
  country_code: string
}

export type SiteAnalyticsPageMetric = {
  path: string
  page_views: number
  average_dwell_seconds: number | null
}

export type SiteAnalyticsSummary = {
  total_page_views: number
  total_unique_visitors: number
  total_dwell_events: number
  average_dwell_seconds: number | null
  daily_metrics: SiteAnalyticsDailyMetric[]
  country_daily_metrics: SiteAnalyticsCountryDailyMetric[]
  page_metrics: SiteAnalyticsPageMetric[]
}

export type SiteAnalyticsSearchResult = SiteAnalyticsLogListResult & {
  summary: SiteAnalyticsSummary
}