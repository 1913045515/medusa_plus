import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Container,
  Heading,
  Button,
  Table,
  Text,
  toast,
  usePrompt,
  Input,
  Label,
  Badge,
} from "@medusajs/ui"
import { MagnifyingGlass } from "@medusajs/icons"

type EnrichedMember = {
  id: string
  customer_id: string
  group_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  customer_created_at: string | null
  customer_updated_at: string | null
  joined_at: string
}

type Group = { id: string; name: string; description: string | null; members: EnrichedMember[] }

type CustomerSearchResult = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  created_at: string
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData
  const res = await fetch(`/admin${path}`, {
    ...options,
    credentials: "include",
    headers: { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

function displayName(first: string | null, last: string | null) {
  const full = [first, last].filter(Boolean).join(" ")
  return full || "—"
}

export default function BlogUserGroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { t } = useTranslation()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)

  // Customer search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null)
  const [adding, setAdding] = useState(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await apiFetch<{ group: Group }>(`/blog-user-groups/${id}`)
      setGroup(data.group)
    } catch (e: any) {
      toast.error(t("blogUserGroup.loadFailed"), { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [id, t])

  useEffect(() => { load() }, [load])

  // Debounced customer search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!searchQuery.trim() || selectedCustomer) {
      if (!selectedCustomer) setSearchResults([])
      return
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await apiFetch<{ customers: CustomerSearchResult[] }>(
          `/blog-customers/search?q=${encodeURIComponent(searchQuery)}&limit=10`
        )
        // Exclude already-added members
        const memberIds = new Set(group?.members.map((m) => m.customer_id) || [])
        setSearchResults(data.customers.filter((c) => !memberIds.has(c.id)))
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [searchQuery, selectedCustomer, group])

  const handleSelectCustomer = (cust: CustomerSearchResult) => {
    setSelectedCustomer(cust)
    setSearchQuery(cust.email || displayName(cust.first_name, cust.last_name))
    setSearchResults([])
  }

  const handleAdd = async () => {
    if (!selectedCustomer) {
      toast.error(t("blogUserGroup.selectCustomerFirst"))
      return
    }
    setAdding(true)
    try {
      await apiFetch(`/blog-user-groups/${id}/members`, {
        method: "POST",
        body: JSON.stringify({ customer_id: selectedCustomer.id }),
      })
      toast.success(t("blogUserGroup.memberAdded"))
      setSelectedCustomer(null)
      setSearchQuery("")
      setSearchResults([])
      load()
    } catch (e: any) {
      toast.error(t("blogUserGroup.addFailed"), { description: e.message })
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (customer_id: string) => {
    const confirmed = await prompt({
      title: t("blogUserGroup.confirmRemove"),
      description: t("blogUserGroup.confirmRemoveDesc"),
      confirmText: t("blogUserGroup.remove"),
      cancelText: t("common.cancel"),
    })
    if (!confirmed) return
    try {
      await apiFetch(`/blog-user-groups/${id}/members`, {
        method: "DELETE",
        body: JSON.stringify({ customer_id }),
      })
      toast.success(t("blogUserGroup.memberRemoved"))
      load()
    } catch (e: any) {
      toast.error(t("blogUserGroup.removeFailed"), { description: e.message })
    }
  }

  if (loading) return <Container className="p-6"><Text>{t("common.loading")}</Text></Container>
  if (!group) return <Container className="p-6"><Text>{t("blogUserGroup.notFound")}</Text></Container>

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{group.name} — {t("blogUserGroup.memberManagement")}</Heading>
        <Button variant="secondary" onClick={() => navigate("/blog-user-groups")}>{t("blogUserGroup.back")}</Button>
      </div>

      {/* Add Member Search */}
      <div className="border border-ui-border-base rounded-md p-4 mb-6">
        <Text className="font-semibold mb-3 block">{t("blogUserGroup.addMember")}</Text>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Label htmlFor="customer_search">{t("blogUserGroup.searchByEmailOrName")}</Label>
            <div className="relative mt-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-fg-muted pointer-events-none">
                <MagnifyingGlass />
              </span>
              <Input
                id="customer_search"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedCustomer(null)
                }}
                placeholder={t("blogUserGroup.searchPlaceholder")}
              />
            </div>
            {/* Dropdown results */}
            {(searchResults.length > 0 || (searching && searchQuery.trim())) && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-ui-bg-base border border-ui-border-base rounded-md shadow-lg max-h-64 overflow-y-auto">
                {searching && (
                  <div className="px-3 py-2 text-sm text-ui-fg-muted">{t("common.loading")}</div>
                )}
                {!searching && searchResults.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-ui-bg-base-hover text-sm border-b border-ui-border-base last:border-0"
                    onClick={() => handleSelectCustomer(cust)}
                  >
                    <div className="font-medium">{cust.email}</div>
                    <div className="text-ui-fg-muted text-xs">
                      {displayName(cust.first_name, cust.last_name)} · {t("blogUserGroup.registeredAt")}: {new Date(cust.created_at).toLocaleString("zh-CN")}
                    </div>
                  </button>
                ))}
                {!searching && searchResults.length === 0 && (
                  <div className="px-3 py-2 text-sm text-ui-fg-muted">{t("blogUserGroup.noResults")}</div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-end">
            <Button disabled={adding || !selectedCustomer} onClick={handleAdd}>
              {adding ? t("common.loading") : t("blogUserGroup.confirm")}
            </Button>
          </div>
        </div>
        {selectedCustomer && (
          <div className="mt-2 flex items-center gap-2">
            <Badge color="blue" size="xsmall">{t("blogUserGroup.selected")}</Badge>
            <Text className="text-sm">
              {selectedCustomer.email} · {displayName(selectedCustomer.first_name, selectedCustomer.last_name)}
            </Text>
          </div>
        )}
      </div>

      {/* Members Table */}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t("blogUserGroup.col.id")}</Table.HeaderCell>
            <Table.HeaderCell>{t("blogUserGroup.col.name")}</Table.HeaderCell>
            <Table.HeaderCell>{t("blogUserGroup.col.email")}</Table.HeaderCell>
            <Table.HeaderCell>{t("blogUserGroup.col.customerCreatedAt")}</Table.HeaderCell>
            <Table.HeaderCell>{t("blogUserGroup.col.customerUpdatedAt")}</Table.HeaderCell>
            <Table.HeaderCell>{t("blogUserGroup.col.joinedAt")}</Table.HeaderCell>
            <Table.HeaderCell>{t("common.actions")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {group.members.map((m) => (
            <Table.Row key={m.id}>
              <Table.Cell>
                <Text className="font-mono text-xs text-ui-fg-muted" title={m.customer_id}>{m.customer_id.slice(0, 16)}…</Text>
              </Table.Cell>
              <Table.Cell>
                <Text className="text-sm">{displayName(m.first_name, m.last_name)}</Text>
              </Table.Cell>
              <Table.Cell>
                <Text className="text-sm">{m.email || "—"}</Text>
              </Table.Cell>
              <Table.Cell>
                <Text className="text-xs text-ui-fg-muted">
                  {m.customer_created_at ? new Date(m.customer_created_at).toLocaleString("zh-CN") : "—"}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text className="text-xs text-ui-fg-muted">
                  {m.customer_updated_at ? new Date(m.customer_updated_at).toLocaleString("zh-CN") : "—"}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text className="text-xs text-ui-fg-muted">
                  {new Date(m.joined_at).toLocaleString("zh-CN")}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Button variant="danger" size="small" onClick={() => handleRemove(m.customer_id)}>
                  {t("blogUserGroup.remove")}
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
          {group.members.length === 0 && (
            <Table.Row>
              <Table.Cell>
                <Text className="text-center text-ui-fg-muted py-6 block">{t("blogUserGroup.noMembers")}</Text>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Container>
  )
}
