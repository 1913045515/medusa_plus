import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
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
  Textarea,
  Drawer,
} from "@medusajs/ui"

export const config = defineRouteConfig({ label: "blogUserGroup.menuLabel", translationNs: "translation" })

type Group = { id: string; name: string; description: string | null; created_at: string; updated_at: string; created_by: string | null; updated_by: string | null }

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

export default function BlogUserGroupsPage() {
  const prompt = usePrompt()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", description: "" })
  const [saving, setSaving] = useState(false)
  const [sortKey, setSortKey] = useState<string>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const handleSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("desc") }
  }
  const sortIcon = (key: string) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"

  const sortedGroups = [...groups].sort((a, b) => {
    const va = (a as any)[sortKey]
    const vb = (b as any)[sortKey]
    if (va == null && vb == null) return 0
    if (va == null) return sortDir === "asc" ? -1 : 1
    if (vb == null) return sortDir === "asc" ? 1 : -1
    if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va
    const cmp = String(va).localeCompare(String(vb), "zh-CN")
    return sortDir === "asc" ? cmp : -cmp
  })
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ groups: Group[] }>("/blog-user-groups")
      setGroups(data.groups)
    } catch (e: any) {
      toast.error(t("blogUserGroup.loadFailed"), { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditId(null); setForm({ name: "", description: "" }); setDrawerOpen(true) }
  const openEdit = (g: Group) => {
    setEditId(g.id)
    setForm({ name: g.name, description: g.description || "" })
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t("blogUserGroup.nameRequired")); return }
    setSaving(true)
    try {
      const payload = { name: form.name, description: form.description || null }
      if (editId) {
        await apiFetch(`/blog-user-groups/${editId}`, { method: "PATCH", body: JSON.stringify(payload) })
      } else {
        await apiFetch(`/blog-user-groups`, { method: "POST", body: JSON.stringify(payload) })
      }
      toast.success(editId ? t("blogUserGroup.updated") : t("blogUserGroup.created"))
      setDrawerOpen(false)
      load()
    } catch (e: any) {
      toast.error(t("blogUserGroup.saveFailed"), { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await prompt({ title: t("blogUserGroup.confirmDeleteTitle"), description: t("blogUserGroup.confirmDeleteDesc"), confirmText: t("common.delete"), cancelText: t("common.cancel") })
    if (!confirmed) return
    try {
      await apiFetch(`/blog-user-groups/${id}`, { method: "DELETE" })
      toast.success(t("blogUserGroup.deleted"))
      load()
    } catch (e: any) {
      toast.error(t("blogUserGroup.deleteFailed"), { description: e.message })
    }
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{t("blogUserGroup.title")}</Heading>
        <Button onClick={openCreate}>{t("blogUserGroup.new")}</Button>
      </div>

      {loading ? (
        <Text className="text-ui-fg-muted">{t("common.loading")}</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("name")}>{t("blogUserGroup.col.name")}{sortIcon("name")}</Table.HeaderCell>
              <Table.HeaderCell>{t("blogUserGroup.col.description")}</Table.HeaderCell>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("updated_at")}>{t("blogUserGroup.col.updatedAt")}{sortIcon("updated_at")}</Table.HeaderCell>
              <Table.HeaderCell>{t("blogUserGroup.col.actions")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedGroups.map((g) => (
              <Table.Row key={g.id}>
                <Table.Cell>{g.name}</Table.Cell>
                <Table.Cell><Text className="text-ui-fg-muted text-sm">{g.description || "-"}</Text></Table.Cell>
                <Table.Cell><Text className="text-xs text-ui-fg-muted">{new Date(g.updated_at).toLocaleDateString()}</Text></Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Button variant="secondary" size="small" onClick={() => navigate(`/blog-user-groups/${g.id}`)}>{t("blogUserGroup.members")}</Button>
                    <Button variant="secondary" size="small" onClick={() => openEdit(g)}>{t("common.edit")}</Button>
                    <Button variant="danger" size="small" onClick={() => handleDelete(g.id)}>{t("common.delete")}</Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
            {groups.length === 0 && (
              <Table.Row>
                <td colSpan={4} className="p-6 text-center text-sm text-ui-fg-muted">{t("blogUserGroup.empty")}</td>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header><Drawer.Title>{editId ? t("blogUserGroup.edit") : t("blogUserGroup.new")}</Drawer.Title></Drawer.Header>
          <Drawer.Body className="space-y-4">
            <div>
              <Label>{t("blogUserGroup.form.name")}</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>{t("blogUserGroup.form.description")}</Label>
              <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>{t("common.cancel")}</Button>
            <Button disabled={saving} onClick={handleSave}>{t("common.save")}</Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}
