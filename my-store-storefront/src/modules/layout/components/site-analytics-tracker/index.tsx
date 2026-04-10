"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import {
  detectPublicIp,
  getSessionId,
  getVisitorId,
  sendSiteAnalyticsEvent,
} from "@lib/analytics/client"

export default function SiteAnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const visitKeyRef = useRef<string | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pagePathRef = useRef<string>("")
  const fullPathRef = useRef<string>("")
  const clientIpRef = useRef<string | null>(null)
  const hasFlushedRef = useRef<boolean>(false)
  const hiddenRef = useRef<boolean>(false)

  useEffect(() => {
    detectPublicIp().then((ip) => {
      clientIpRef.current = ip
    })
  }, [])

  useEffect(() => {
    if (!pathname) {
      return
    }

    const search = searchParams?.toString()
    const fullPath = search ? `${pathname}?${search}` : pathname

    pagePathRef.current = pathname
    fullPathRef.current = fullPath
    startTimeRef.current = Date.now()
    hasFlushedRef.current = false
    hiddenRef.current = document.visibilityState === "hidden"
    visitKeyRef.current = `${fullPath}::${startTimeRef.current}`

    const visitorId = getVisitorId()
    const sessionId = getSessionId()

    sendSiteAnalyticsEvent({
      event_type: "page_view",
      visitor_id: visitorId,
      session_id: sessionId,
      path: pathname,
      full_path: fullPath,
      client_ip: clientIpRef.current,
      referrer: document.referrer || null,
    })

    return () => {
      flushCurrentVisit("route_change")
    }
  }, [pathname, searchParams])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenRef.current = true
        flushCurrentVisit("hidden")
        return
      }

      if (hiddenRef.current && document.visibilityState === "visible") {
        hiddenRef.current = false
        restartVisit("visible_return")
      }
    }

    const handlePageHide = () => {
      flushCurrentVisit("pagehide")
    }

    window.addEventListener("pagehide", handlePageHide)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("pagehide", handlePageHide)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const restartVisit = (reason: string) => {
    startTimeRef.current = Date.now()
    hasFlushedRef.current = false
    visitKeyRef.current = `${fullPathRef.current}::${startTimeRef.current}`

    sendSiteAnalyticsEvent({
      event_type: "page_view",
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      path: pagePathRef.current,
      full_path: fullPathRef.current,
      client_ip: clientIpRef.current,
      referrer: document.referrer || null,
      metadata: { reason },
    })
  }

  const flushCurrentVisit = (reason: string) => {
    if (hasFlushedRef.current || !startTimeRef.current || !visitKeyRef.current) {
      return
    }

    hasFlushedRef.current = true

    const durationSeconds = Math.max(0, Math.round((Date.now() - startTimeRef.current) / 1000))

    sendSiteAnalyticsEvent({
      event_type: "page_leave",
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      path: pagePathRef.current,
      full_path: fullPathRef.current,
      client_ip: clientIpRef.current,
      duration_seconds: durationSeconds,
      referrer: document.referrer || null,
      metadata: { reason },
    })
  }

  return null
}