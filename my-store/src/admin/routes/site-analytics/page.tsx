import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PencilSquare } from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"

type SiteAnalyticsEvent = {
  id: string
  event_type: "page_view" | "page_leave"
  visitor_id: string
  session_id: string | null
  path: string
  full_path: string | null
  country_code: string | null
  duration_seconds: number | null
  referrer: string | null
  occurred_at: string
  created_at: string
}

type SiteAnalyticsDailyMetric = {
  date: string
  page_views: number
  unique_visitors: number
}

type SiteAnalyticsCountryDailyMetric = SiteAnalyticsDailyMetric & {
  country_code: string
}

type SiteAnalyticsPageMetric = {
  path: string
  page_views: number
  average_dwell_seconds: number | null
}

type SiteAnalyticsSummary = {
  total_page_views: number
  total_unique_visitors: number
  total_dwell_events: number
  average_dwell_seconds: number | null
  daily_metrics: SiteAnalyticsDailyMetric[]
  country_daily_metrics: SiteAnalyticsCountryDailyMetric[]
  page_metrics: SiteAnalyticsPageMetric[]
}

type SiteAnalyticsResponse = {
  logs: SiteAnalyticsEvent[]
  count: number
  limit: number
  offset: number
  summary: SiteAnalyticsSummary
}

type SortField =
  | "occurred_at"
  | "created_at"
  | "event_type"
  | "country_code"
  | "path"
  | "duration_seconds"

type SortDirection = "asc" | "desc"

const BASE = "/admin"
const PAGE_SIZE = 20
const SORT_FIELDS: SortField[] = [
  "occurred_at",
  "created_at",
  "event_type",
  "country_code",
  "path",
  "duration_seconds",
]

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? `Request failed: ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value))
}

function formatDuration(value: number | null) {
  if (value === null || value === undefined) {
    return "-"
  }

  return `${value}s`
}

function toDatetimeLocalInput(value: Date) {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, "0")
  const day = `${value.getDate()}`.padStart(2, "0")
  const hours = `${value.getHours()}`.padStart(2, "0")
  const minutes = `${value.getMinutes()}`.padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const defaultStart = () => {
  const now = new Date()
  now.setDate(now.getDate() - 7)
  return toDatetimeLocalInput(now)
}

const defaultEnd = () => toDatetimeLocalInput(new Date())

const SiteAnalyticsPage = () => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const [logs, setLogs] = useState<SiteAnalyticsEvent[]>([])
  const [summary, setSummary] = useState<SiteAnalyticsSummary | null>(null)
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [startAt, setStartAt] = useState(defaultStart)
  const [endAt, setEndAt] = useState(defaultEnd)
  const [countryCode, setCountryCode] = useState("")
  const [sortBy, setSortBy] = useState<SortField>("occurred_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  const countryOptions = useMemo(() => {
    const values = new Set<string>()
    summary?.country_daily_metrics.forEach((item) => {
      if (item.country_code) {
        values.add(item.country_code)
      }
    })
    logs.forEach((item) => {
      if (item.country_code) {
        values.add(item.country_code)
      }
    })
    return Array.from(values).sort()
  }, [logs, summary])

  const pageMetrics = useMemo(() => summary?.page_metrics.slice(0, 5) ?? [], [summary])
  const latestDailyMetrics = useMemo(() => summary?.daily_metrics.slice(0, 7) ?? [], [summary])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: `${PAGE_SIZE}`,
        offset: `${offset}`,
        sort_by: sortBy,
        sort_direction: sortDirection,
      })

      if (startAt) {
        params.set("start_at", new Date(startAt).toISOString())
      }

      if (endAt) {
        params.set("end_at", new Date(endAt).toISOString())
      }

      if (countryCode) {
        params.set("country_code", countryCode)
      }

      const data = await apiFetch<SiteAnalyticsResponse>(`/site-analytics/logs?${params.toString()}`)
      setLogs(data.logs)
      setSummary(data.summary)
      setCount(data.count)
      setSelectedIds([])
    } catch (error: any) {
      toast.error(error?.message ?? t("siteAnalytics.toast.loadFailed"))
    } finally {
      setLoading(false)
    }
  }, [countryCode, endAt, offset, sortBy, sortDirection, startAt, t])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const toggleSort = (field: SortField) => {
    if (!SORT_FIELDS.includes(field)) {
      return
    }

    setOffset(0)
    if (field === sortBy) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
      return
    }

    setSortBy(field)
    setSortDirection("desc")
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const toggleSelectAll = () => {
    if (logs.length > 0 && selectedIds.length === logs.length) {
      setSelectedIds([])
      return
    }

    setSelectedIds(logs.map((item) => item.id))
  }

  const handleSearch = () => {
    if (offset === 0) {
      loadLogs()
      return
    }

    setOffset(0)
  }

  const handleReset = () => {
    setStartAt(defaultStart())
    setEndAt(defaultEnd())
    setCountryCode("")
    setSortBy("occurred_at")
    setSortDirection("desc")
    setOffset(0)
  }

  const confirmDelete = useCallback(
    async (countToDelete: number) => {
      return await prompt({
        title: t("siteAnalytics.confirmDeleteTitle"),
        description: t("siteAnalytics.confirmDeleteDesc", { count: countToDelete }),
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
      })
    },
    [prompt, t]
  )

  const handleDeleteOne = async (id: string) => {
    const confirmed = await confirmDelete(1)
    if (!confirmed) {
      return
    }

    setDeletingIds((current) => [...current, id])
    try {
      await apiFetch(`/site-analytics/logs/${id}`, { method: "DELETE" })
      toast.success(t("siteAnalytics.toast.deleted"))
      await loadLogs()
    } catch (error: any) {
      toast.error(error?.message ?? t("siteAnalytics.toast.deleteFailed"))
    } finally {
      setDeletingIds((current) => current.filter((item) => item !== id))
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      toast.error(t("siteAnalytics.toast.selectRowsFirst"))
      return
    }

    const confirmed = await confirmDelete(selectedIds.length)
    if (!confirmed) {
      return
    }

    setBulkDeleting(true)
    try {
      await apiFetch<{ deleted_count: number }>("/site-analytics/logs/bulk-delete", {
        method: "POST",
        body: JSON.stringify({ ids: selectedIds }),
      })
      toast.success(t("siteAnalytics.toast.bulkDeleted", { count: selectedIds.length }))
      await loadLogs()
    } catch (error: any) {
      toast.error(error?.message ?? t("siteAnalytics.toast.bulkDeleteFailed"))
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
        <div>
          <Heading level="h1">{t("siteAnalytics.title")}</Heading>
          <Text size="small" className="text-ui-fg-muted mt-1">
            {t("siteAnalytics.pageDescription")}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadLogs} isLoading={loading}>
            {t("siteAnalytics.refresh")}
          </Button>
          <Button variant="danger" onClick={handleBulkDelete} isLoading={bulkDeleting}>
            {t("siteAnalytics.bulkDelete")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 border-b border-ui-border-base px-6 py-4 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="site-analytics-start">{t("siteAnalytics.filters.startAt")}</Label>
          <Input
            id="site-analytics-start"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="site-analytics-end">{t("siteAnalytics.filters.endAt")}</Label>
          <Input
            id="site-analytics-end"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="site-analytics-country">{t("siteAnalytics.filters.country")}</Label>
          <Select value={countryCode || "__all__"} onValueChange={(value) => setCountryCode(value === "__all__" ? "" : value)}>
            <Select.Trigger id="site-analytics-country">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="__all__">{t("siteAnalytics.filters.allCountries")}</Select.Item>
              {countryOptions.map((option) => (
                <Select.Item key={option} value={option}>
                  {option.toUpperCase()}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleSearch}>{t("siteAnalytics.search")}</Button>
          <Button variant="secondary" onClick={handleReset}>
            {t("siteAnalytics.reset")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 border-b border-ui-border-base px-6 py-4 md:grid-cols-4">
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text size="small" className="text-ui-fg-muted">{t("siteAnalytics.summary.totalPageViews")}</Text>
          <Heading level="h2">{summary?.total_page_views ?? 0}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text size="small" className="text-ui-fg-muted">{t("siteAnalytics.summary.totalUniqueVisitors")}</Text>
          <Heading level="h2">{summary?.total_unique_visitors ?? 0}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text size="small" className="text-ui-fg-muted">{t("siteAnalytics.summary.totalDwellEvents")}</Text>
          <Heading level="h2">{summary?.total_dwell_events ?? 0}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text size="small" className="text-ui-fg-muted">{t("siteAnalytics.summary.averageDwell")}</Text>
          <Heading level="h2">{summary?.average_dwell_seconds ? `${summary.average_dwell_seconds.toFixed(1)}s` : "-"}</Heading>
        </div>
      </div>

      <div className="grid gap-4 border-b border-ui-border-base px-6 py-4 lg:grid-cols-2">
        <div className="rounded-lg border border-ui-border-base p-4">
          <Heading level="h3">{t("siteAnalytics.summary.pageMetrics")}</Heading>
          <div className="mt-3 flex flex-col gap-3">
            {pageMetrics.length ? pageMetrics.map((item) => (
              <div key={item.path} className="flex items-center justify-between gap-4">
                <Text size="small" className="truncate">{item.path}</Text>
                <Text size="small" className="text-ui-fg-muted">
                  {item.page_views} PV / {item.average_dwell_seconds?.toFixed(1) ?? "-"}s
                </Text>
              </div>
            )) : (
              <Text size="small" className="text-ui-fg-muted">{t("siteAnalytics.emptyMetrics")}</Text>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Heading level="h3">{t("siteAnalytics.summary.dailyMetrics")}</Heading>
          <div className="mt-3 flex flex-col gap-3">
            {latestDailyMetrics.length ? latestDailyMetrics.map((item) => (
              <div key={item.date} className="flex items-center justify-between gap-4">
                <Text size="small">{item.date}</Text>
                <Text size="small" className="text-ui-fg-muted">
                  {item.page_views} PV / {item.unique_visitors} UV
                </Text>
              </div>
            )) : (
              <Text size="small" className="text-ui-fg-muted">{t("siteAnalytics.emptyMetrics")}</Text>
            )}
          </div>
        </div>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              <input
                type="checkbox"
                checked={logs.length > 0 && selectedIds.length === logs.length}
                onChange={toggleSelectAll}
                aria-label={t("siteAnalytics.selectAll")}
              />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <button type="button" onClick={() => toggleSort("event_type")} className="text-left">
                {t("siteAnalytics.columns.eventType")}
              </button>
            </Table.HeaderCell>
            <Table.HeaderCell>
              <button type="button" onClick={() => toggleSort("path")} className="text-left">
                {t("siteAnalytics.columns.path")}
              </button>
            </Table.HeaderCell>
            <Table.HeaderCell>{t("siteAnalytics.columns.visitorId")}</Table.HeaderCell>
            <Table.HeaderCell>
              <button type="button" onClick={() => toggleSort("country_code")} className="text-left">
                {t("siteAnalytics.columns.country")}
              </button>
            </Table.HeaderCell>
            <Table.HeaderCell>
              <button type="button" onClick={() => toggleSort("duration_seconds")} className="text-left">
                {t("siteAnalytics.columns.duration")}
              </button>
            </Table.HeaderCell>
            <Table.HeaderCell>
              <button type="button" onClick={() => toggleSort("occurred_at")} className="text-left">
                {t("siteAnalytics.columns.occurredAt")}
              </button>
            </Table.HeaderCell>
            <Table.HeaderCell>{t("common.actions")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Row>
              <td colSpan={8} className="px-4 py-6 text-center text-sm text-ui-fg-muted">
                {t("common.loading")}
              </td>
            </Table.Row>
          ) : !logs.length ? (
            <Table.Row>
              <td colSpan={8} className="px-4 py-6 text-center text-sm text-ui-fg-muted">
                {t("siteAnalytics.empty")}
              </td>
            </Table.Row>
          ) : (
            logs.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    aria-label={t("siteAnalytics.selectRow", { id: item.id })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={item.event_type === "page_view" ? "blue" : "orange"}>
                    {item.event_type}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="max-w-[240px]">
                    <Text size="small" className="truncate">{item.path}</Text>
                    {item.full_path && item.full_path !== item.path ? (
                      <Text size="small" className="truncate text-ui-fg-muted">{item.full_path}</Text>
                    ) : null}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small" className="font-mono text-ui-fg-muted">{item.visitor_id}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">{item.country_code?.toUpperCase() ?? "-"}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">{formatDuration(item.duration_seconds)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">{formatDateTime(item.occurred_at)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => handleDeleteOne(item.id)}
                    isLoading={deletingIds.includes(item.id)}
                  >
                    {t("common.delete")}
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>

      <div className="flex items-center justify-between px-6 py-4">
        <Text size="small" className="text-ui-fg-muted">
          {t("siteAnalytics.pagination", { currentPage, totalPages, count })}
        </Text>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            disabled={currentPage <= 1}
            onClick={() => setOffset((current) => Math.max(current - PAGE_SIZE, 0))}
          >
            {t("siteAnalytics.previousPage")}
          </Button>
          <Button
            size="small"
            variant="secondary"
            disabled={currentPage >= totalPages}
            onClick={() => setOffset((current) => current + PAGE_SIZE)}
          >
            {t("siteAnalytics.nextPage")}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "siteAnalytics.menuLabel",
  translationNs: "translation",
  icon: PencilSquare,
})

export default SiteAnalyticsPage