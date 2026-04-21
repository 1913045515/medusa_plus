"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  listTickets,
  createTicket,
  migrateGuestTickets,
  getGuestToken,
  setGuestToken,
  type Ticket,
} from "@modules/ticket/api"
import { getTicketDictionary, type TicketDictionary } from "@lib/i18n/dictionaries"

type TicketWithUnread = Ticket & { last_admin_reply_at?: string | null }

function isZh(locale?: string | null) {
  return locale?.startsWith("zh") ?? false
}

function getStatusLabel(status: string, dict: TicketDictionary): string {
  switch (status) {
    case "open": return dict.statusOpen
    case "pending": return dict.statusPending
    case "resolved": return dict.statusResolved
    case "closed": return dict.statusClosed
    default: return status
  }
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
}

const LAST_VIEWED_PREFIX = "ticket_last_viewed_"
const UNREAD_PREFIX = "ticket_unread_"

function getLastViewed(ticketId: string): number {
  if (typeof window === "undefined") return 0
  return parseInt(localStorage.getItem(LAST_VIEWED_PREFIX + ticketId) ?? "0", 10)
}

function isTicketUnread(ticket: TicketWithUnread): boolean {
  const adminReplyAt = ticket.last_admin_reply_at
  if (!adminReplyAt) return false
  const lastViewedMs = getLastViewed(ticket.id)
  return new Date(adminReplyAt).getTime() > lastViewedMs
}

function syncUnreadFlags(tickets: TicketWithUnread[]) {
  if (typeof window === "undefined") return
  tickets.forEach((t) => {
    if (isTicketUnread(t)) {
      localStorage.setItem(UNREAD_PREFIX + t.id, "1")
    } else {
      localStorage.removeItem(UNREAD_PREFIX + t.id)
    }
  })
}

type Props = {
  customerEmail?: string | null
  countryCode: string
  locale?: string | null
}

export default function TicketListClient({ customerEmail, countryCode, locale }: Props) {
  const dict = getTicketDictionary(locale)
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketWithUnread[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [, forceUpdate] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const token = getGuestToken()
      const data = await listTickets({
        customer_email: customerEmail || undefined,
        guest_token: !customerEmail ? (token || undefined) : undefined,
      })
      const ticketList = data.tickets as TicketWithUnread[]
      setTickets(ticketList)
      syncUnreadFlags(ticketList)

      if (customerEmail && token) {
        await migrateGuestTickets(token, customerEmail).catch(() => {})
        localStorage.removeItem("ticket_guest_token")
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [customerEmail])

  useEffect(() => { load() }, [load])

  // Force re-render every 10s so unread status refreshes if localStorage changes
  useEffect(() => {
    const t = setInterval(() => forceUpdate((n) => n + 1), 10000)
    return () => clearInterval(t)
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError("")
    try {
      const token = getGuestToken()
      const result = await createTicket({
        title,
        content,
        customer_email: customerEmail || undefined,
        guest_token: token || undefined,
      })
      if (result.guest_token) {
        setGuestToken(result.guest_token)
      }
      router.push(`/${countryCode}/support/tickets/${result.ticket.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const dateStr = (isoStr: string) =>
    isZh(locale)
      ? new Date(isoStr).toLocaleString("zh-CN")
      : new Date(isoStr).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })

  const hasAnyUnread = tickets.some(isTicketUnread)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Guest banner */}
      {!customerEmail && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800">{dict.guestBanner}</p>
          <a
            href={`/${countryCode}/account`}
            className="ml-4 text-sm font-medium text-amber-900 underline whitespace-nowrap"
          >
            {dict.guestRegister}
          </a>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          {dict.pageTitle}
          {hasAnyUnread && (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" title={dict.unread} />
          )}
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          {showForm ? dict.cancelNewTicket : dict.newTicket}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold">{dict.createTitle}</h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">{dict.titleLabel}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={dict.titlePlaceholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{dict.contentLabel}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={dict.contentPlaceholder}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? dict.submitting : dict.submitTicket}
          </button>
        </form>
      )}

      {/* Ticket list */}
      {loading ? (
        <p className="text-center text-gray-500">{dict.loading}</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">{isZh(locale) ? "暂无工单" : "No tickets yet"}</p>
          <p className="text-sm">{isZh(locale) ? "点击右上角新建工单向我们反馈问题" : "Click \"New Ticket\" to get help"}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => {
            const unread = isTicketUnread(ticket)
            return (
              <li key={ticket.id}>
                <a
                  href={`/${countryCode}/support/tickets/${ticket.id}`}
                  className={`block bg-white border rounded-xl p-4 hover:border-gray-400 transition-colors ${
                    unread ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate flex items-center gap-2">
                        {ticket.title}
                        {unread && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                            {dict.unread}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {dateStr(ticket.updated_at)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[ticket.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {getStatusLabel(ticket.status, dict)}
                    </span>
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
