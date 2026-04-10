import { SiteAnalyticsService } from "../services/site-analytics.service"
import type { ISiteAnalyticsRepository } from "../repositories/site-analytics.repository"
import type {
  SiteAnalyticsEventRecord,
  SiteAnalyticsSummary,
} from "../types"

const makeEvent = (overrides: Partial<SiteAnalyticsEventRecord> = {}): SiteAnalyticsEventRecord => ({
  id: "sae_01",
  event_type: "page_view",
  visitor_id: "visitor_01",
  session_id: "session_01",
  path: "/us",
  full_path: "/us",
  country_code: "us",
  duration_seconds: null,
  referrer: null,
  user_agent: "jest",
  ip_address: "127.0.0.1",
  metadata: null,
  occurred_at: "2026-04-09T10:00:00.000Z",
  created_at: "2026-04-09T10:00:00.000Z",
  updated_at: "2026-04-09T10:00:00.000Z",
  ...overrides,
})

const makeSummary = (overrides: Partial<SiteAnalyticsSummary> = {}): SiteAnalyticsSummary => ({
  total_page_views: 10,
  total_unique_visitors: 4,
  total_dwell_events: 5,
  average_dwell_seconds: 12.5,
  daily_metrics: [
    {
      date: "2026-04-09",
      page_views: 10,
      unique_visitors: 4,
    },
  ],
  country_daily_metrics: [
    {
      date: "2026-04-09",
      country_code: "us",
      page_views: 10,
      unique_visitors: 4,
    },
  ],
  page_metrics: [
    {
      path: "/us",
      page_views: 10,
      average_dwell_seconds: 12.5,
    },
  ],
  ...overrides,
})

const makeRepo = (overrides: Partial<ISiteAnalyticsRepository> = {}): ISiteAnalyticsRepository => ({
  create: jest.fn().mockResolvedValue(makeEvent()),
  list: jest.fn().mockResolvedValue({
    logs: [makeEvent()],
    count: 1,
    limit: 20,
    offset: 0,
  }),
  summarize: jest.fn().mockResolvedValue(makeSummary()),
  delete: jest.fn().mockResolvedValue(true),
  bulkDelete: jest.fn().mockResolvedValue(1),
  ...overrides,
})

describe("SiteAnalyticsService", () => {
  it("normalizes analytics event input before persisting", async () => {
    const repo = makeRepo()
    const service = new SiteAnalyticsService(repo)

    await service.trackEvent({
      event_type: "page_leave",
      visitor_id: "  visitor_01  ",
      session_id: "  session_01  ",
      path: "  /us/courses  ",
      full_path: "  /us/courses?tab=all  ",
      country_code: "US",
      duration_seconds: 12.7,
      referrer: " https://example.com ",
      user_agent: " Test Agent ",
      ip_address: " 127.0.0.1 ",
      metadata: { reason: "hidden" },
    })

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        visitor_id: "visitor_01",
        session_id: "session_01",
        path: "/us/courses",
        full_path: "/us/courses?tab=all",
        country_code: "us",
        duration_seconds: 13,
        referrer: "https://example.com",
        user_agent: "Test Agent",
        ip_address: "127.0.0.1",
      })
    )
  })

  it("combines list and summary results for admin queries", async () => {
    const repo = makeRepo()
    const service = new SiteAnalyticsService(repo)

    const result = await service.searchLogs({
      country_code: "us",
      limit: 20,
      offset: 0,
      sort_by: "occurred_at",
      sort_direction: "desc",
    })

    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({ country_code: "us" })
    )
    expect(repo.summarize).toHaveBeenCalledWith(
      expect.objectContaining({ country_code: "us" })
    )
    expect(result.summary.total_page_views).toBe(10)
    expect(result.logs).toHaveLength(1)
  })

  it("throws when deleting a missing analytics log", async () => {
    const repo = makeRepo({ delete: jest.fn().mockResolvedValue(false) })
    const service = new SiteAnalyticsService(repo)

    await expect(service.deleteLog("missing")).rejects.toThrow(
      "Analytics log missing not found"
    )
  })
})