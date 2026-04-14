import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Container,
  Heading,
  Button,
  Table,
  Badge,
  Text,
  toast,
  usePrompt,
  Input,
  Select,
} from "@medusajs/ui"

export const config = defineRouteConfig({
  label: "blog.menuLabel",
  translationNs: "translation",
  icon: ChatBubbleLeftRight,
})

type BlogPost = {
  id: string
  title: string
  slug: string
  status: string
  is_pinned: boolean
  visibility: string
  read_count: number
  word_count: number
  author_id: string | null
  updated_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

const STATUS_COLORS: Record<string, "grey" | "green" | "blue" | "orange"> = {
  draft: "grey",
  scheduled: "orange",
  published: "green",
  archived: "grey",
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

export default function BlogsPage() {
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { t } = useTranslation()

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<string>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const limit = 20

  const handleSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("desc") }
  }

  const sortIcon = (key: string) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"

  const sortedPosts = [...posts].sort((a, b) => {
    const va = (a as any)[sortKey]
    const vb = (b as any)[sortKey]
    if (va == null && vb == null) return 0
    if (va == null) return sortDir === "asc" ? -1 : 1
    if (vb == null) return sortDir === "asc" ? 1 : -1
    if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va
    const cmp = String(va).localeCompare(String(vb), "zh-CN")
    return sortDir === "asc" ? cmp : -cmp
  })

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (q) params.set("q", q)
      if (statusFilter) params.set("status", statusFilter)
      const data = await apiFetch<{ posts: BlogPost[]; total: number }>(`/blogs?${params}`)
      setPosts(data.posts)
      setTotal(data.total)
    } catch (e: any) {
      toast.error(t("blog.toast.loadFailed"), { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [page, q, statusFilter, t])

  useEffect(() => { loadPosts() }, [loadPosts])

  const handleDelete = async (id: string) => {
    const confirmed = await prompt({
      title: t("blog.confirmDelete.title"),
      description: t("blog.confirmDelete.desc"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    })
    if (!confirmed) return
    try {
      await apiFetch(`/blogs/${id}`, { method: "DELETE" })
      toast.success(t("blog.toast.deleted"))
      loadPosts()
    } catch (e: any) {
      toast.error(t("blog.toast.deleteFailed"), { description: e.message })
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await apiFetch(`/blogs/${id}/duplicate`, { method: "POST" })
      toast.success(t("blog.toast.duplicated"))
      loadPosts()
    } catch (e: any) {
      toast.error(t("blog.toast.duplicateFailed"), { description: e.message })
    }
  }

  const handleBatchDelete = async () => {
    if (selected.size === 0) return
    const confirmed = await prompt({
      title: t("blog.confirmDelete.batchTitle", { count: selected.size }),
      description: t("blog.confirmDelete.batchDesc"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    })
    if (!confirmed) return
    try {
      await Promise.all([...selected].map((id) => apiFetch(`/blogs/${id}`, { method: "DELETE" })))
      toast.success(t("blog.toast.batchDeleted", { count: selected.size }))
      setSelected(new Set())
      loadPosts()
    } catch (e: any) {
      toast.error(t("blog.toast.batchDeleteFailed"), { description: e.message })
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{t("blog.title")}</Heading>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="danger" size="small" onClick={handleBatchDelete}>
              {t("blog.batchDelete", { count: selected.size })}
            </Button>
          )}
          <Button variant="secondary" size="small" onClick={() => navigate("/blog-categories")}>
            {t("blog.categoriesNav")}
          </Button>
          <Button variant="secondary" size="small" onClick={() => navigate("/blog-tags")}>
            {t("blog.tagsNav")}
          </Button>
          <Button variant="secondary" size="small" onClick={() => navigate("/blog-user-groups")}>
            {t("blog.groupsNav")}
          </Button>
          <Button onClick={() => navigate("/blogs/new")}>{t("blog.newPost")}</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder={t("blog.filter.searchPlaceholder")}
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1) }}>
          <Select.Trigger className="w-36">
            <Select.Value placeholder={t("blog.filter.allStatuses")} />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">{t("blog.filter.allStatuses")}</Select.Item>
            <Select.Item value="draft">{t("blog.status.draft")}</Select.Item>
            <Select.Item value="scheduled">{t("blog.status.scheduled")}</Select.Item>
            <Select.Item value="published">{t("blog.status.published")}</Select.Item>
            <Select.Item value="archived">{t("blog.status.archived")}</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {loading ? (
        <Text className="text-ui-fg-muted">{t("blog.loading")}</Text>
      ) : (
        <>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === posts.length && posts.length > 0}
                    onChange={(e) => setSelected(e.target.checked ? new Set(posts.map((p) => p.id)) : new Set())}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("title")}>{t("blog.col.title")}{sortIcon("title")}</Table.HeaderCell>
                <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("status")}>{t("blog.col.status")}{sortIcon("status")}</Table.HeaderCell>
                <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("visibility")}>{t("blog.col.visibility")}{sortIcon("visibility")}</Table.HeaderCell>
                <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("read_count")}>{t("blog.col.readCount")}{sortIcon("read_count")}</Table.HeaderCell>
                <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("word_count")}>{t("blog.col.wordCount")}{sortIcon("word_count")}</Table.HeaderCell>
                <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("updated_at")}>{t("blog.col.updatedAt")}{sortIcon("updated_at")}</Table.HeaderCell>
                <Table.HeaderCell>{t("blog.col.actions")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedPosts.map((post) => (
                <Table.Row key={post.id}>
                  <Table.Cell>
                    <input
                      type="checkbox"
                      checked={selected.has(post.id)}
                      onChange={() => toggleSelect(post.id)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      {post.is_pinned && <Badge color="blue" size="xsmall">{t("blog.pinned")}</Badge>}
                      <Text className="font-medium">{post.title}</Text>
                    </div>
                    <Text className="text-ui-fg-muted text-xs">/blog/{post.slug}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={STATUS_COLORS[post.status] ?? "grey"}>
                      {t(`blog.status.${post.status}`, post.status)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text className="text-sm">{t(`blog.visibility.${post.visibility}`, post.visibility)}</Text>
                  </Table.Cell>
                  <Table.Cell>{post.read_count}</Table.Cell>
                  <Table.Cell>{post.word_count}</Table.Cell>
                  <Table.Cell>
                    <Text className="text-sm text-ui-fg-muted">
                      {new Date(post.updated_at).toLocaleDateString()}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate(`/blogs/${post.id}`)}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDuplicate(post.id)}
                      >
                        {t("blog.duplicate")}
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDelete(post.id)}
                      >
                        {t("common.delete")}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
              {posts.length === 0 && (
                <Table.Row>
                  <td colSpan={8} className="p-8 text-center text-sm text-ui-fg-muted">{t("blog.empty")}</td>
                </Table.Row>
              )}
            </Table.Body>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="secondary"
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("blog.pagination.prev")}
              </Button>
              <Text className="flex items-center text-sm">
                {t("blog.pagination.info", { page, total: totalPages })}
              </Text>
              <Button
                variant="secondary"
                size="small"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("blog.pagination.next")}
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  )
}
