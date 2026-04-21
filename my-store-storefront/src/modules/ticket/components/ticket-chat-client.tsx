"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  getTicket,
  sendMessage,
  closeTicket,
  getGuestToken,
  type Ticket,
  type TicketMessage,
} from "@modules/ticket/api"
import { getTicketDictionary, type TicketDictionary } from "@lib/i18n/dictionaries"

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
}

const LAST_VIEWED_PREFIX = "ticket_last_viewed_"
const UNREAD_PREFIX = "ticket_unread_"

function markAsRead(ticketId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_VIEWED_PREFIX + ticketId, String(Date.now()))
    localStorage.removeItem(UNREAD_PREFIX + ticketId)
  }
}

type Props = {
  ticketId: string
  customerEmail?: string | null
  countryCode: string
  locale?: string | null
}

export default function TicketChatClient({ ticketId, customerEmail, countryCode, locale }: Props) {
  const dict: TicketDictionary = getTicketDictionary(locale)
  const isZh = locale?.startsWith("zh") ?? false
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Mark as read when entering the chat and whenever message count changes
    markAsRead(ticketId)
  }, [ticketId, messages.length])

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await getTicket(ticketId)
      setTicket(data.ticket)
      setMessages((prev) => {
        if (prev.length !== data.messages.length) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
          // Mark as read when new messages arrive (admin replies)
          markAsRead(ticketId)
        }
        return data.messages
      })
    } catch {
      // ignore poll errors
    } finally {
      if (!silent) setLoading(false)
    }
  }, [ticketId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [loading])

  // 10-second polling
  useEffect(() => {
    pollRef.current = setInterval(() => load(true), 10000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [load])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    setError("")
    try {
      const token = getGuestToken()
      await sendMessage(ticketId, content, token)
      setContent("")
      await load(true)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleClose = async () => {
    try {
      await closeTicket(ticketId)
      await load(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return dict.statusOpen
      case "pending": return dict.statusPending
      case "resolved": return dict.statusResolved
      case "closed": return dict.statusClosed
      default: return status
    }
  }

  const dateStr = (isoStr: string) =>
    isZh
      ? new Date(isoStr).toLocaleString("zh-CN")
      : new Date(isoStr).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">
        {dict.loading}
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">
        {isZh ? "工单不存在或无权访问" : "Ticket not found or access denied"}
      </div>
    )
  }

  const isClosed = ticket.status === "closed"

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col min-h-[80vh]">
      {/* Guest banner */}
      {!customerEmail && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800">{dict.guestBanner}</p>
          <a
            href={`/${countryCode}/account`}
            className="ml-4 text-sm font-medium text-amber-900 underline whitespace-nowrap"
          >
            {dict.guestRegister}
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <button
            onClick={() => router.push(`/${countryCode}/support/tickets`)}
            className="text-sm text-gray-500 hover:text-gray-800 mb-1 flex items-center gap-1"
          >
            ← {dict.backToList}
          </button>
          <h1 className="text-xl font-semibold">{ticket.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status] ?? "bg-gray-100 text-gray-700"}`}>
              {getStatusLabel(ticket.status)}
            </span>
            <span className="text-xs text-gray-500">
              {dict.created} {dateStr(ticket.created_at)}
            </span>
          </div>
        </div>
        {!isClosed && (
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {dict.closeTicket}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4 min-h-[300px]">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-8">{dict.noMessages}</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.sender_type === "user"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_type === "user" ? "text-gray-400" : "text-gray-500"}`}>
                  {msg.sender_type === "user" ? dict.you : dict.admin} · {dateStr(msg.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {isClosed ? (
        <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
          {dict.closedNotice}
        </div>
      ) : (
        <form onSubmit={handleSend} className="border-t border-gray-200 pt-4">
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <div className="flex gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={dict.sendPlaceholder}
              rows={3}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e as any)
                }
              }}
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="self-end bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {sending ? dict.sending : dict.send}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {isZh ? "按 Enter 发送，Shift+Enter 换行" : "Enter to send, Shift+Enter for new line"}
          </p>
        </form>
      )}
    </div>
  )
}

