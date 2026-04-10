import { ContainerRegistrationKeys, generateEntityId } from "@medusajs/framework/utils"
import type { Knex } from "knex"
import type {
  CreateSiteAnalyticsEventInput,
  SiteAnalyticsCountryDailyMetric,
  SiteAnalyticsDailyMetric,
  SiteAnalyticsEventRecord,
  SiteAnalyticsLogFilters,
  SiteAnalyticsLogListResult,
  SiteAnalyticsPageMetric,
  SiteAnalyticsSummary,
} from "../types"
import type { ISiteAnalyticsRepository } from "./site-analytics.repository"

type SiteAnalyticsRow = {
  id: string
  event_type: "page_view" | "page_leave"
  visitor_id: string
  session_id: string | null
  path: string
  full_path: string | null
  country_code: string | null
  duration_seconds: number | null
  referrer: string | null
  user_agent: string | null
  ip_address: string | null
  metadata: Record<string, unknown> | string | null
  occurred_at: Date | string
  created_at: Date | string
  updated_at: Date | string
}

const SORT_COLUMN_MAP = {
  occurred_at: "occurred_at",
  created_at: "created_at",
  event_type: "event_type",
  country_code: "country_code",
  path: "path",
  duration_seconds: "duration_seconds",
} as const

export class SiteAnalyticsOrmRepository implements ISiteAnalyticsRepository {
  constructor(private readonly scope: any) {}

  private get knex(): Knex {
    const knex = this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
    if (!knex) {
      throw new Error("Could not resolve 'pg_connection' from request scope")
    }
    return knex
  }

  private baseQuery() {
    return this.knex("site_analytics_event").whereNull("deleted_at")
  }

  private applyFilters(query: Knex.QueryBuilder, filters?: SiteAnalyticsLogFilters) {
    if (!filters) {
      return query
    }

    if (filters.start_at) {
      query.where("occurred_at", ">=", new Date(filters.start_at))
    }

    if (filters.end_at) {
      query.where("occurred_at", "<=", new Date(filters.end_at))
    }

    if (filters.country_code) {
      query.where("country_code", filters.country_code)
    }

    if (filters.path) {
      query.where("path", filters.path)
    }

    return query
  }

  private mapRow(row: SiteAnalyticsRow): SiteAnalyticsEventRecord {
    const metadata = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata

    return {
      id: row.id,
      event_type: row.event_type,
      visitor_id: row.visitor_id,
      session_id: row.session_id,
      path: row.path,
      full_path: row.full_path,
      country_code: row.country_code,
      duration_seconds: row.duration_seconds,
      referrer: row.referrer,
      user_agent: row.user_agent,
      ip_address: row.ip_address,
      metadata: metadata ?? null,
      occurred_at: new Date(row.occurred_at).toISOString(),
      created_at: new Date(row.created_at).toISOString(),
      updated_at: new Date(row.updated_at).toISOString(),
    }
  }

  async create(input: CreateSiteAnalyticsEventInput): Promise<SiteAnalyticsEventRecord> {
    const now = new Date()
    const occurredAt = input.occurred_at ? new Date(input.occurred_at) : now
    const id = generateEntityId("", "sae")

    await this.knex("site_analytics_event").insert({
      id,
      event_type: input.event_type,
      visitor_id: input.visitor_id,
      session_id: input.session_id ?? null,
      path: input.path,
      full_path: input.full_path ?? null,
      country_code: input.country_code ?? null,
      duration_seconds: input.duration_seconds ?? null,
      referrer: input.referrer ?? null,
      user_agent: input.user_agent ?? null,
      ip_address: input.ip_address ?? null,
      occurred_at: occurredAt,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      created_at: now,
      updated_at: now,
    })

    const created = await this.baseQuery()
      .select(
        "id",
        "event_type",
        "visitor_id",
        "session_id",
        "path",
        "full_path",
        "country_code",
        "duration_seconds",
        "referrer",
        "user_agent",
        "ip_address",
        "metadata",
        "occurred_at",
        "created_at",
        "updated_at"
      )
      .where({ id })
      .first()

    if (!created) {
      throw new Error("Failed to create site analytics event")
    }

    return this.mapRow(created as SiteAnalyticsRow)
  }

  async list(filters?: SiteAnalyticsLogFilters): Promise<SiteAnalyticsLogListResult> {
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100)
    const offset = Math.max(filters?.offset ?? 0, 0)
    const sortBy = filters?.sort_by ?? "occurred_at"
    const sortDirection = filters?.sort_direction ?? "desc"
    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? SORT_COLUMN_MAP.occurred_at

    const rowsQuery = this.baseQuery().select(
      "id",
      "event_type",
      "visitor_id",
      "session_id",
      "path",
      "full_path",
      "country_code",
      "duration_seconds",
      "referrer",
      "user_agent",
      "ip_address",
      "metadata",
      "occurred_at",
      "created_at",
      "updated_at"
    )

    this.applyFilters(rowsQuery, filters)

    rowsQuery.orderBy(sortColumn, sortDirection).orderBy("id", "desc").limit(limit).offset(offset)

    const countQuery = this.baseQuery().count<{ count: string }[]>({ count: "id" })
    this.applyFilters(countQuery, filters)

    const [rows, countRows] = await Promise.all([rowsQuery, countQuery])
    const count = Number(countRows[0]?.count ?? 0)

    return {
      logs: rows.map((row) => this.mapRow(row as SiteAnalyticsRow)),
      count,
      limit,
      offset,
    }
  }

  async summarize(filters?: SiteAnalyticsLogFilters): Promise<SiteAnalyticsSummary> {
    const pageViewBase = this.baseQuery().where({ event_type: "page_view" })
    const dwellBase = this.baseQuery().where({ event_type: "page_leave" })

    this.applyFilters(pageViewBase, filters)
    this.applyFilters(dwellBase, filters)

    const totalPageViewsQuery = pageViewBase.clone().count<{ count: string }[]>({ count: "id" })
    const totalUniqueVisitorsQuery = pageViewBase
      .clone()
      .select(
        this.knex.raw(
          `count(distinct (date(occurred_at at time zone 'UTC')::text || ':' || visitor_id))::int as count`
        )
      )
      .first()
    const dwellSummaryQuery = dwellBase
      .clone()
      .select(
        this.knex.raw("count(id)::int as total_dwell_events"),
        this.knex.raw("avg(duration_seconds)::float as average_dwell_seconds")
      )
      .first()

    const dailyMetricsQuery = pageViewBase
      .clone()
      .select(this.knex.raw("date(occurred_at at time zone 'UTC')::text as date"))
      .select(this.knex.raw("count(id)::int as page_views"))
      .select(this.knex.raw("count(distinct visitor_id)::int as unique_visitors"))
      .groupByRaw("date(occurred_at at time zone 'UTC')")
      .orderBy("date", "desc")

    const countryDailyMetricsQuery = pageViewBase
      .clone()
      .select(this.knex.raw("date(occurred_at at time zone 'UTC')::text as date"))
      .select(this.knex.raw("coalesce(country_code, 'unknown') as country_code"))
      .select(this.knex.raw("count(id)::int as page_views"))
      .select(this.knex.raw("count(distinct visitor_id)::int as unique_visitors"))
      .groupByRaw("date(occurred_at at time zone 'UTC'), coalesce(country_code, 'unknown')")
      .orderBy([{ column: "date", order: "desc" }, { column: "country_code", order: "asc" }])

    const pageMetricsQuery = this.baseQuery()
      .select("path")
      .select(this.knex.raw("sum(case when event_type = 'page_view' then 1 else 0 end)::int as page_views"))
      .select(this.knex.raw("avg(case when event_type = 'page_leave' then duration_seconds end)::float as average_dwell_seconds"))
      .whereNotNull("path")
      .groupBy("path")
      .orderBy([{ column: "page_views", order: "desc" }, { column: "path", order: "asc" }])
      .limit(50)

    this.applyFilters(pageMetricsQuery, filters)

    const [totalPageViewsRows, totalUniqueVisitorsRows, dwellSummary, dailyMetricsRows, countryDailyMetricsRows, pageMetricsRows] =
      await Promise.all([
        totalPageViewsQuery,
        totalUniqueVisitorsQuery,
        dwellSummaryQuery,
        dailyMetricsQuery,
        countryDailyMetricsQuery,
        pageMetricsQuery,
      ])

    const dailyMetrics: SiteAnalyticsDailyMetric[] = dailyMetricsRows.map((row: any) => ({
      date: row.date,
      page_views: Number(row.page_views ?? 0),
      unique_visitors: Number(row.unique_visitors ?? 0),
    }))

    const countryDailyMetrics: SiteAnalyticsCountryDailyMetric[] = countryDailyMetricsRows.map((row: any) => ({
      date: row.date,
      country_code: row.country_code,
      page_views: Number(row.page_views ?? 0),
      unique_visitors: Number(row.unique_visitors ?? 0),
    }))

    const pageMetrics: SiteAnalyticsPageMetric[] = pageMetricsRows.map((row: any) => ({
      path: row.path,
      page_views: Number(row.page_views ?? 0),
      average_dwell_seconds:
        row.average_dwell_seconds === null || row.average_dwell_seconds === undefined
          ? null
          : Number(row.average_dwell_seconds),
    }))

    return {
      total_page_views: Number(totalPageViewsRows[0]?.count ?? 0),
      total_unique_visitors: Number((totalUniqueVisitorsRows as any)?.count ?? 0),
      total_dwell_events: Number((dwellSummary as any)?.total_dwell_events ?? 0),
      average_dwell_seconds:
        (dwellSummary as any)?.average_dwell_seconds === null ||
        (dwellSummary as any)?.average_dwell_seconds === undefined
          ? null
          : Number((dwellSummary as any).average_dwell_seconds),
      daily_metrics: dailyMetrics,
      country_daily_metrics: countryDailyMetrics,
      page_metrics: pageMetrics,
    }
  }

  async delete(id: string): Promise<boolean> {
    const now = new Date()
    const count = await this.baseQuery().where({ id }).update({ deleted_at: now, updated_at: now })
    return count > 0
  }

  async bulkDelete(ids: string[]): Promise<number> {
    if (!ids.length) {
      return 0
    }

    const now = new Date()
    const count = await this.baseQuery().whereIn("id", ids).update({ deleted_at: now, updated_at: now })
    return Number(count ?? 0)
  }
}