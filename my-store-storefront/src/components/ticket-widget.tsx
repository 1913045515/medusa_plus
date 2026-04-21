"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { getTicketDictionary } from "@lib/i18n/dictionaries"

const LAST_VIEWED_PREFIX = "ticket_last_viewed_"
const UNREAD_PREFIX = "ticket_unread_"
const POLL_INTERVAL = 30_000 // 30 s

export default function TicketWidget({
  locale,
  customerEmail,
}: {
  locale?: string | null
  customerEmail?: string | null
}) {
  const dict = getTicketDictionary(locale)
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Extract countryCode from pathname (e.g. /cn/... → cn)
  const countryCode = pathname?.split("/")?.[1] || "us"

  // Don't show on support pages (already there)
  const isOnSupportPage = pathname?.includes("/support/tickets")

  useEffect(() => {
    // Small delay to avoid hydration flicker
    const t = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(t)
  }, [])

  // ── Unread polling ──────────────────────────────────────────────────────────
  useEffect(() => {
    const BACKEND =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
    const PUB_KEY =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ??
      ""

    const check = async () => {
      if (typeof window === "undefined") return
      const guestToken = localStorage.getItem("ticket_guest_token")
      if (!customerEmail && !guestToken) {
        setHasUnread(false)
        return
      }

      try {
        const params = new URLSearchParams()
        if (customerEmail) params.set("customer_email", customerEmail)
        else if (guestToken) params.set("guest_token", guestToken)

        const res = await fetch(`${BACKEND}/store/tickets?${params}`, {
          credentials: "include",
          headers: { "x-publishable-api-key": PUB_KEY },
        })
        if (!res.ok) return

        const data = await res.json()
        const tickets: Array<{ id: string; last_admin_reply_at?: string | null }> =
          data.tickets ?? []

        let anyUnread = false
        for (const t of tickets) {
          if (!t.last_admin_reply_at) {
            localStorage.removeItem(UNREAD_PREFIX + t.id)
            continue
          }
          const lastViewedMs = parseInt(
            localStorage.getItem(LAST_VIEWED_PREFIX + t.id) ?? "0",
            10
          )
          const isUnread =
            new Date(t.last_admin_reply_at).getTime() > lastViewedMs
          if (isUnread) {
            anyUnread = true
            localStorage.setItem(UNREAD_PREFIX + t.id, "1")
          } else {
            localStorage.removeItem(UNREAD_PREFIX + t.id)
          }
        }
        setHasUnread(anyUnread)
      } catch {
        // non-critical – silently ignore
      }
    }

    check()
    timerRef.current = setInterval(check, POLL_INTERVAL)

    // Sync when another tab updates localStorage (e.g. user reads a ticket)
    const onStorage = () => check()
    window.addEventListener("storage", onStorage)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      window.removeEventListener("storage", onStorage)
    }
  }, [customerEmail])

  if (!visible || isOnSupportPage) return null

  return (
    <button
      onClick={() => router.push(`/${countryCode}/support/tickets`)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      aria-label={dict.widgetLabel}
    >
      {/* Chat icon with red dot badge */}
      <span className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900" />
        )}
      </span>
      <span className="text-sm font-medium">{dict.widgetLabel}</span>
    </button>
  )
}
