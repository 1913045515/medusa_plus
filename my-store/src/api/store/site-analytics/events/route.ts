import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  siteAnalyticsService,
  setSiteAnalyticsModuleScope,
  type CreateSiteAnalyticsEventInput,
  type SiteAnalyticsEventType,
} from "../../../../modules/site-analytics"
import { resolveRequestCountryCode } from "./resolve-country-code"

const ALLOWED_EVENT_TYPES: SiteAnalyticsEventType[] = ["page_view", "page_leave"]

function readHeader(req: MedusaRequest, name: string): string | null {
  const value = (req.headers as Record<string, string | string[] | undefined>)?.[name.toLowerCase()]
  if (Array.isArray(value)) {
    return value[0] ?? null
  }
  return value ?? null
}

function asText(value: unknown, maxLength = 512): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, maxLength) : null
}

function asDuration(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function parseInput(req: MedusaRequest): CreateSiteAnalyticsEventInput {
  const body = (req.body ?? {}) as Record<string, unknown>
  const eventType = asText(body.event_type, 32) as SiteAnalyticsEventType | null

  if (!eventType || !ALLOWED_EVENT_TYPES.includes(eventType)) {
    throw new Error("event_type must be one of: page_view, page_leave")
  }

  const path = asText(body.path, 1024)
  const visitorId = asText(body.visitor_id, 128)

  if (!path) {
    throw new Error("path is required")
  }

  if (!visitorId) {
    throw new Error("visitor_id is required")
  }

  const forwardedFor = asText(readHeader(req, "x-forwarded-for"), 256)
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || asText(readHeader(req, "x-real-ip"), 128) || asText(req.ip, 128)
  const clientIp = asText(body.client_ip, 128)

  return {
    event_type: eventType,
    visitor_id: visitorId,
    session_id: asText(body.session_id, 128),
    path,
    full_path: asText(body.full_path, 2048),
    country_code: resolveRequestCountryCode(req, ipAddress, clientIp),
    duration_seconds: asDuration(body.duration_seconds),
    referrer: asText(body.referrer, 2048),
    user_agent: asText(readHeader(req, "user-agent"), 512),
    ip_address: ipAddress,
    occurred_at: asText(body.occurred_at, 64),
    metadata: typeof body.metadata === "object" && body.metadata !== null ? (body.metadata as Record<string, unknown>) : null,
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setSiteAnalyticsModuleScope(req.scope)
  try {
    // 日志：记录收到的原始请求体
    console.log('[site-analytics] 收到埋点请求', {
      body: req.body,
      headers: req.headers,
      ip: req.ip
    })
    const input = parseInput(req)
    // 日志：记录解析后的埋点参数
    console.log('[site-analytics] 解析后参数', input)
    const event = await siteAnalyticsService.trackEvent(input)
    // 日志：记录写入成功
    console.log('[site-analytics] 埋点写入成功', { eventId: event.id })
    res.status(202).json({ accepted: true, event_id: event.id })
  } catch (error: any) {
    // 日志：记录错误
    console.error('[site-analytics] 埋点写入失败', error)
    res.status(400).json({ message: error?.message ?? "Failed to accept analytics event" })
  }
}