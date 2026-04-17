import { defineRouteConfig } from "@medusajs/admin-sdk"
import { InformationCircle } from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Heading,
  Button,
  Table,
  Badge,
  Text,
  Input,
  Select,
  toast,
} from "@medusajs/ui"

export const config = defineRouteConfig({
  label: "工单管理",
  icon: InformationCircle,
})

type Ticket = {
  id: string
  title: string
  status: string
  customer_email: string | null
  guest_token: string | null
  created_at: string
  updated_at: string
}

type TicketStats = {
  open: number
  pending: number
  resolved: number
  closed: number
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

export default function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats>({ open: 0, pending: 0, resolved: 0, closed: 0 })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const limit = 20

  const loadStats = useCallback(async () => {
    try {
      const data = await apiFetch<{ stats: TicketStats }>("/tickets/stats")
      setStats(data.stats)
    } catch {
      // ignore
    }
  }, [])

  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (statusFilter) params.set("status", statusFilter)
      if (q) params.set("q", q)
      const data = await apiFetch<{ tickets: Ticket[]; count: number }>(`/tickets?${params}`)
      setTickets(data.tickets)
      setTotal(data.count)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, q])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { loadTickets() }, [loadTickets])

  const totalPages = Math.ceil(total / limit)

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">工单管理</Heading>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(["open", "pending", "resolved", "closed"] as const).map((s) => (
          <div
            key={s}
            className="bg-ui-bg-subtle rounded-lg p-4 cursor-pointer border border-ui-border-base hover:border-ui-border-strong transition-colors"
            onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1) }}
          >
            <Text size="small" className="text-ui-fg-subtle">{STATUS_LABELS[s]}</Text>
            <Text size="xlarge" weight="plus" className="mt-1">{stats[s]}</Text>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="搜索标题或邮箱..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1) }}>
          <Select.Trigger>
            <Select.Value placeholder="全部状态" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">全部状态</Select.Item>
            <Select.Item value="open">待处理</Select.Item>
            <Select.Item value="pending">跟进中</Select.Item>
            <Select.Item value="resolved">已解决</Select.Item>
            <Select.Item value="closed">已关闭</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>工单 ID</Table.HeaderCell>
            <Table.HeaderCell>标题</Table.HeaderCell>
            <Table.HeaderCell>来源</Table.HeaderCell>
            <Table.HeaderCell>状态</Table.HeaderCell>
            <Table.HeaderCell>更新时间</Table.HeaderCell>
            <Table.HeaderCell>创建时间</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Row>
              <Table.Cell>
                <Text className="text-center text-ui-fg-subtle py-8">加载中...</Text>
              </Table.Cell>
            </Table.Row>
          ) : tickets.length === 0 ? (
            <Table.Row>
              <Table.Cell>
                <Text className="text-center text-ui-fg-subtle py-8">暂无工单</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            tickets.map((ticket) => (
              <Table.Row
                key={ticket.id}
                className="cursor-pointer hover:bg-ui-bg-subtle-hover"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <Table.Cell>
                  <Text size="small" className="font-mono text-ui-fg-subtle">{ticket.id.slice(0, 16)}...</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text weight="plus">{ticket.title}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">
                    {ticket.customer_email ?? (
                      <span className="text-ui-fg-subtle">游客</span>
                    )}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={STATUS_COLORS[ticket.status] ?? "grey"}>
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">{new Date(ticket.updated_at).toLocaleString("zh-CN")}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">{new Date(ticket.created_at).toLocaleString("zh-CN")}</Text>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Text size="small" className="text-ui-fg-subtle">
            共 {total} 条，第 {page}/{totalPages} 页
          </Text>
          <div className="flex gap-2">
            <Button variant="secondary" size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              上一页
            </Button>
            <Button variant="secondary" size="small" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              下一页
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
}
