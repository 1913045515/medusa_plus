export type SiteAnalyticsEventType = "page_view" | "page_leave"

export type SiteAnalyticsPayload = {
  event_type: SiteAnalyticsEventType
  visitor_id: string
  session_id: string
  path: string
  full_path: string
  client_ip?: string | null
  duration_seconds?: number | null
  referrer?: string | null
  occurred_at?: string
  metadata?: Record<string, unknown> | null
}

const VISITOR_ID_STORAGE_KEY = "acs_visitor_id"
const SESSION_ID_STORAGE_KEY = "acs_session_id"
const CLIENT_IP_KEY = "acs_client_ip"
const TRACK_ENDPOINT = "/api/site-analytics"

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getStorageItem(storage: Storage, key: string, prefix: string): string {
  const existing = storage.getItem(key)
  if (existing) {
    return existing
  }

  const next = createId(prefix)
  storage.setItem(key, next)
  return next
}

export function getVisitorId(): string {
  return getStorageItem(window.localStorage, VISITOR_ID_STORAGE_KEY, "visitor")
}

export function getSessionId(): string {
  return getStorageItem(window.sessionStorage, SESSION_ID_STORAGE_KEY, "session")
}

export async function detectPublicIp(): Promise<string | null> {
  try {
    const cached = window.sessionStorage.getItem(CLIENT_IP_KEY)
    if (cached) {
      return cached
    }
  } catch {
    // sessionStorage 不可用时跳过
  }

  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    })

    if (!res.ok) {
      return null
    }

    const data = (await res.json()) as { ip?: unknown }
    const ip = typeof data.ip === "string" && data.ip ? data.ip : null

    if (ip) {
      try {
        window.sessionStorage.setItem(CLIENT_IP_KEY, ip)
      } catch {
        // 写缓存失败无影响
      }
    }

    return ip
  } catch {
    return null
  }
}

function serializePayload(payload: SiteAnalyticsPayload): string {
  return JSON.stringify({
    ...payload,
    occurred_at: payload.occurred_at ?? new Date().toISOString(),
  })
}

export function sendSiteAnalyticsEvent(payload: SiteAnalyticsPayload) {
  const body = serializePayload(payload)

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(
      TRACK_ENDPOINT,
      new Blob([body], { type: "application/json" })
    )

    if (sent) {
      return
    }
  }

  void fetch(TRACK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
    cache: "no-store",
  }).catch(() => undefined)
}