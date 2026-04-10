import type {
  CreateSiteAnalyticsEventInput,
  SiteAnalyticsEventRecord,
  SiteAnalyticsLogFilters,
  SiteAnalyticsLogListResult,
  SiteAnalyticsSummary,
} from "../types"

export interface ISiteAnalyticsRepository {
  create(input: CreateSiteAnalyticsEventInput): Promise<SiteAnalyticsEventRecord>
  list(filters?: SiteAnalyticsLogFilters): Promise<SiteAnalyticsLogListResult>
  summarize(filters?: SiteAnalyticsLogFilters): Promise<SiteAnalyticsSummary>
  delete(id: string): Promise<boolean>
  bulkDelete(ids: string[]): Promise<number>
}