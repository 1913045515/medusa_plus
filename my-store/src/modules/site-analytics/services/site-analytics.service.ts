import type {
  CreateSiteAnalyticsEventInput,
  SiteAnalyticsLogFilters,
  SiteAnalyticsSearchResult,
} from "../types"
import type { ISiteAnalyticsRepository } from "../repositories/site-analytics.repository"

export class SiteAnalyticsService {
  constructor(private readonly repo: ISiteAnalyticsRepository) {}

  async trackEvent(input: CreateSiteAnalyticsEventInput) {
    if (!input.visitor_id.trim()) {
      throw new Error("visitor_id is required")
    }

    if (!input.path.trim()) {
      throw new Error("path is required")
    }

    return await this.repo.create({
      ...input,
      visitor_id: input.visitor_id.trim(),
      session_id: input.session_id?.trim() || null,
      path: input.path.trim(),
      full_path: input.full_path?.trim() || null,
      country_code: input.country_code?.trim().toLowerCase() || null,
      duration_seconds:
        input.duration_seconds === null || input.duration_seconds === undefined
          ? null
          : Math.max(0, Math.round(input.duration_seconds)),
      referrer: input.referrer?.trim() || null,
      user_agent: input.user_agent?.trim() || null,
      ip_address: input.ip_address?.trim() || null,
      metadata: input.metadata ?? null,
    })
  }

  async searchLogs(filters?: SiteAnalyticsLogFilters): Promise<SiteAnalyticsSearchResult> {
    const [listResult, summary] = await Promise.all([
      this.repo.list(filters),
      this.repo.summarize(filters),
    ])

    return {
      ...listResult,
      summary,
    }
  }

  async deleteLog(id: string): Promise<void> {
    const deleted = await this.repo.delete(id)
    if (!deleted) {
      throw new Error(`Analytics log ${id} not found`)
    }
  }

  async bulkDeleteLogs(ids: string[]): Promise<number> {
    return await this.repo.bulkDelete(ids)
  }
}