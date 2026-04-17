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

const STATUS_LABELS: Record<string, string> = {
  open: "待处理",
  pending: "跟进中",
  resolved: "已解决",
  closed: "已关闭",
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
}

type Props = {
  customerEmail?: string | null
  countryCode: string
}

export default function TicketListClient({ customerEmail, countryCode }: Props) {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [guestToken, setGuestTokenState] = useState<string | null>(null)

  // Read guest token from localStorage on client
  useEffect(() => {
    setGuestTokenState(getGuestToken())
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const token = getGuestToken()
      const data = await listTickets({
        customer_email: customerEmail || undefined,
        guest_token: !customerEmail ? (token || undefined) : undefined,
      })
      setTickets(data.tickets)

      // Auto-migrate guest tickets when user is now logged in
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
      // Save new guest_token if returned
      if (result.guest_token) {
        setGuestToken(result.guest_token)
        setGuestTokenState(result.guest_token)
      }
      router.push(`/${countryCode}/support/tickets/${result.ticket.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Guest banner */}
      {!customerEmail && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            您当前以游客身份使用工单，<strong>注册账号</strong>可永久保存工单历史。
          </p>
          <a
            href={`/${countryCode}/account`}
            className="ml-4 text-sm font-medium text-amber-900 underline whitespace-nowrap"
          >
            立即注册
          </a>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">我的工单</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          {showForm ? "取消" : "+ 新建工单"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold">新建工单</h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请简要描述您的问题"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请详细描述您遇到的问题..."
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
            {submitting ? "提交中..." : "提交工单"}
          </button>
        </form>
      )}

      {/* Ticket list */}
      {loading ? (
        <p className="text-center text-gray-500">加载中...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">暂无工单</p>
          <p className="text-sm">点击右上角"新建工单"向我们反馈问题</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <a
                href={`/${countryCode}/support/tickets/${ticket.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ticket.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      更新于 {new Date(ticket.updated_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[ticket.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
