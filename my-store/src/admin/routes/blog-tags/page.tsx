import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect, useCallback } from "react"
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
  Drawer,
} from "@medusajs/ui"

export const config = defineRouteConfig({ label: "blogTag.menuLabel", translationNs: "translation" })

type Tag = { id: string; name: string; slug: string; cover_image: string | null; created_at: string; updated_at: string; created_by: string | null; updated_by: string | null }

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

export default function BlogTagsPage() {
  const prompt = usePrompt()
  const { t } = useTranslation()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", slug: "" })
  const [saving, setSaving] = useState(false)
  const [sortKey, setSortKey] = useState<string>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const handleSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("desc") }
  }
  const sortIcon = (key: string) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"

  const sortedTags = [...tags].sort((a, b) => {
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
      const data = await apiFetch<{ tags: Tag[] }>("/blog-tags")
      setTags(data.tags)
    } catch (e: any) {
      toast.error(t("blogTag.toast.loadFailed"), { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditId(null); setForm({ name: "", slug: "" }); setDrawerOpen(true) }
  const openEdit = (tag: Tag) => { setEditId(tag.id); setForm({ name: tag.name, slug: tag.slug }); setDrawerOpen(true) }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t("blogTag.toast.nameRequired")); return }
    setSaving(true)
    try {
      if (editId) {
        await apiFetch(`/blog-tags/${editId}`, { method: "PATCH", body: JSON.stringify(form) })
      } else {
        await apiFetch(`/blog-tags`, { method: "POST", body: JSON.stringify(form) })
      }
      toast.success(t("blogTag.toast.saved"))
      setDrawerOpen(false)
      load()
    } catch (e: any) {
      toast.error(t("blogTag.toast.saveFailed"), { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await prompt({ title: t("blogTag.confirmDelete.title"), description: t("blogTag.confirmDelete.desc"), confirmText: t("common.delete"), cancelText: t("common.cancel") })
    if (!confirmed) return
    try {
      await apiFetch(`/blog-tags/${id}`, { method: "DELETE" })
      toast.success(t("blogTag.toast.deleted"))
      load()
    } catch (e: any) {
      toast.error(t("blogTag.toast.deleteFailed"), { description: e.message })
    }
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{t("blogTag.title")}</Heading>
        <Button onClick={openCreate}>{t("blogTag.new")}</Button>
      </div>

      {loading ? (
        <Text className="text-ui-fg-muted">{t("common.loading")}</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("name")}>{t("blogTag.col.name")}{sortIcon("name")}</Table.HeaderCell>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("slug")}>{t("blogTag.col.slug")}{sortIcon("slug")}</Table.HeaderCell>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("updated_at")}>{t("blogTag.col.updatedAt")}{sortIcon("updated_at")}</Table.HeaderCell>
              <Table.HeaderCell>{t("blogTag.col.actions")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedTags.map((tag) => (
              <Table.Row key={tag.id}>
                <Table.Cell>{tag.name}</Table.Cell>
                <Table.Cell><Text className="text-ui-fg-muted text-sm">{tag.slug}</Text></Table.Cell>
                <Table.Cell><Text className="text-xs text-ui-fg-muted">{new Date(tag.updated_at).toLocaleDateString()}</Text></Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Button variant="secondary" size="small" onClick={() => openEdit(tag)}>{t("common.edit")}</Button>
                    <Button variant="danger" size="small" onClick={() => handleDelete(tag.id)}>{t("common.delete")}</Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
            {tags.length === 0 && (
              <Table.Row>
                <td colSpan={4} className="p-6 text-center text-sm text-ui-fg-muted">{t("blogTag.empty")}</td>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header><Drawer.Title>{editId ? t("blogTag.edit") : t("blogTag.new")}</Drawer.Title></Drawer.Header>
          <Drawer.Body className="space-y-4">
            <div>
              <Label>{t("blogTag.form.name")}</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>{t("blogTag.form.slug")}</Label>
              <Input value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} />
            </div>
            {editId && (
              <div>
                <Label>{t("blogTag.form.coverImage")}</Label>
                {tags.find((tag) => tag.id === editId)?.cover_image ? (
                  <div className="mt-1">
                    <img src={tags.find((tag) => tag.id === editId)!.cover_image!} alt={t("blogTag.form.coverImage")} className="w-full h-24 object-cover rounded" />
                    <Button
                      size="small" variant="danger" className="mt-1"
                      onClick={async () => {
                        try {
                          await apiFetch(`/blog-tags/${editId}/media/cover-image`, { method: "DELETE" })
                          toast.success(t("blogTag.cover.deleted"))
                          load()
                        } catch (e: any) { toast.error(t("blogTag.cover.deleteFailed"), { description: e.message }) }
                      }}
                    >{t("common.delete")}</Button>
                  </div>
                ) : (
                  <div className="mt-1">
                    <Text className="text-xs text-ui-fg-muted mb-1 block">{t("blogTag.form.coverUploadHint")}</Text>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="block w-full text-sm file:mr-2 file:rounded file:border file:border-ui-border-base file:px-2 file:py-1 file:text-xs"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file || !editId) return
                        const fd = new FormData(); fd.append("file", file)
                        try {
                          await apiFetch(`/blog-tags/${editId}/media/cover-image`, { method: "POST", body: fd })
                          toast.success(t("blogTag.cover.uploaded"))
                          load()
                        } catch (err: any) { toast.error(t("blogTag.cover.uploadFailed"), { description: err.message }) }
                        e.target.value = ""
                      }}
                    />
                  </div>
                )}
              </div>
            )}
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
