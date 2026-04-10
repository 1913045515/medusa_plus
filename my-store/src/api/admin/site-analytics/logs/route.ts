import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  siteAnalyticsService,
  setSiteAnalyticsModuleScope,
  type SiteAnalyticsLogFilters,
  type SiteAnalyticsLogSortDirection,
  type SiteAnalyticsLogSortField,
} from "../../../../modules/site-analytics"

const SORT_FIELDS: SiteAnalyticsLogSortField[] = [
  "occurred_at",
  "created_at",
  "event_type",
  "country_code",
  "path",
  "duration_seconds",
]

function getQueryValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }
  return value ?? null
}

function parseNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseFilters(req: MedusaRequest): SiteAnalyticsLogFilters {
  const startAt = getQueryValue(req.query.start_at as string | string[] | undefined)
  const endAt = getQueryValue(req.query.end_at as string | string[] | undefined)
  const countryCode = getQueryValue(req.query.country_code as string | string[] | undefined)
  const path = getQueryValue(req.query.path as string | string[] | undefined)
  const sortBy = getQueryValue(req.query.sort_by as string | string[] | undefined) as SiteAnalyticsLogSortField | null
  const sortDirection = getQueryValue(req.query.sort_direction as string | string[] | undefined) as SiteAnalyticsLogSortDirection | null

  return {
    start_at: startAt,
    end_at: endAt,
    country_code: countryCode?.trim().toLowerCase() || null,
    path: path?.trim() || null,
    limit: Math.min(Math.max(parseNumber(getQueryValue(req.query.limit as any), 20), 1), 100),
    offset: Math.max(parseNumber(getQueryValue(req.query.offset as any), 0), 0),
    sort_by: sortBy && SORT_FIELDS.includes(sortBy) ? sortBy : "occurred_at",
    sort_direction: sortDirection === "asc" ? "asc" : "desc",
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setSiteAnalyticsModuleScope(req.scope)
  try {
    // 日志：记录查询参数
    console.log('[site-analytics] 查询日志参数', req.query)
    const result = await siteAnalyticsService.searchLogs(parseFilters(req))
    // 日志：返回结果数量
    console.log('[site-analytics] 查询日志结果数量', result.logs?.length ?? 0)
    res.json(result)
  } catch (error: any) {
    // 日志：记录错误
    console.error('[site-analytics] 查询日志失败', error)
    res.status(400).json({ message: error?.message ?? "Failed to query analytics logs" })
  }
}