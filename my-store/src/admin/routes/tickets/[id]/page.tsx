import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Container,
  Heading,
  Button,
  Badge,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"

type Ticket = {
  id: string
  title: string
  status: string
  customer_email: string | null
  guest_token: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

type TicketMessage = {
  id: string
  ticket_id: string
  sender_type: "user" | "admin"
  content: string
  created_at: string
}

const STATUS_COLORS: Record<string, "grey" | "green" | "blue" | "orange" | "red"> = {
  open: "blue",
  pending: "orange",
  resolved: "green",
  closed: "grey",
}

const STATUS_LABELS: Record<string, string> = {
  open: "待处理",
  pending: "跟进中",
  resolved: "已解决",
  closed: "已关闭",
}

const STATUS_TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  open: [{ label: "标记跟进", next: "pending" }, { label: "关闭工单", next: "closed" }],
  pending: [{ label: "标记已解决", next: "resolved" }, { label: "关闭工单", next: "closed" }],
  resolved: [{ label: "重新开启", next: "open" }, { label: "关闭工单", next: "closed" }],
  closed: [{ label: "重新开启", next: "open" }],
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/admin${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const data = await apiFetch<{ ticket: Ticket; messages: TicketMessage[] }>(`/tickets/${id}`)
      setTicket(data.ticket)
      setMessages(data.messages)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleReply = async () => {
    if (!replyContent.trim() || !id) return
    setSending(true)
    try {
      await apiFetch(`/tickets/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: replyContent }),
      })
      setReplyContent("")
      await load()
      toast.success("回复已发送")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (nextStatus: string) => {
    if (!id) return
    setUpdatingStatus(true)
    try {
      await apiFetch(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      })
      await load()
      toast.success(`状态已更新为：${STATUS_LABELS[nextStatus] ?? nextStatus}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">加载中...</Text>
      </Container>
    )
  }

  if (!ticket) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">工单不存在</Text>
      </Container>
    )
  }

  const transitions = STATUS_TRANSITIONS[ticket.status] ?? []

  return (
    <Container>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="transparent" size="small" onClick={() => navigate("/tickets")}>
          <ArrowLeft />
        </Button>
        <div className="flex-1">
          <Heading level="h1">{ticket.title}</Heading>
          <div className="flex items-center gap-3 mt-1">
            <Badge color={STATUS_COLORS[ticket.status] ?? "grey"}>
              {STATUS_LABELS[ticket.status] ?? ticket.status}
            </Badge>
            <Text size="small" className="text-ui-fg-subtle">
              来源：{ticket.customer_email ?? "游客"}
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              创建：{new Date(ticket.created_at).toLocaleString("zh-CN")}
            </Text>
          </div>
        </div>
        {/* Status action buttons */}
        <div className="flex gap-2">
          {transitions.map((t) => (
            <Button
              key={t.next}
              variant="secondary"
              size="small"
              disabled={updatingStatus}
              onClick={() => handleStatusChange(t.next)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 mb-6 max-h-[60vh] overflow-y-auto p-1">
        {messages.length === 0 ? (
          <Text className="text-ui-fg-subtle text-center py-8">暂无消息</Text>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-xl px-4 py-3 ${
                  msg.sender_type === "admin"
                    ? "bg-ui-bg-interactive text-ui-fg-on-color"
                    : "bg-ui-bg-subtle border border-ui-border-base"
                }`}
              >
                <Text size="small" className="whitespace-pre-wrap">{msg.content}</Text>
                <Text
                  size="xsmall"
                  className={`mt-1 ${msg.sender_type === "admin" ? "text-ui-fg-on-color opacity-70" : "text-ui-fg-subtle"}`}
                >
                  {msg.sender_type === "admin" ? "管理员" : "用户"} · {new Date(msg.created_at).toLocaleString("zh-CN")}
                </Text>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply input */}
      {ticket.status !== "closed" ? (
        <div className="border-t border-ui-border-base pt-4">
          <Textarea
            placeholder="输入回复内容..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="mb-3"
            rows={4}
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              disabled={!replyContent.trim() || sending}
              onClick={handleReply}
            >
              {sending ? "发送中..." : "发送回复"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-ui-border-base pt-4">
          <Text className="text-ui-fg-subtle text-center">此工单已关闭，无法继续回复</Text>
        </div>
      )}
    </Container>
  )
}
