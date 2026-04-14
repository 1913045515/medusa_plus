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
  Textarea,
  Select,
  Drawer,
} from "@medusajs/ui"

export const config = defineRouteConfig({ label: "blogCategory.menuLabel", translationNs: "translation" })

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  cover_image: string | null
  parent_id: string | null
  post_count: number
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

const emptyForm = () => ({
  name: "",
  slug: "",
  description: "",
  cover_image: "",
  parent_id: "",
})

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

export default function BlogCategoriesPage() {
  const prompt = usePrompt()
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [sortKey, setSortKey] = useState<string>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const handleSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("desc") }
  }
  const sortIcon = (key: string) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"

  const sortedCategories = [...categories].sort((a, b) => {
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
      const data = await apiFetch<{ categories: Category[] }>("/blog-categories")
      setCategories(data.categories)
    } catch (e: any) {
      toast.error(t("blogCategory.toast.loadFailed"), { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditId(null); setForm(emptyForm()); setDrawerOpen(true) }
  const openEdit = (cat: Category) => {
    setEditId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", cover_image: cat.cover_image || "", parent_id: cat.parent_id || "" })
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t("blogCategory.toast.nameRequired")); return }
    setSaving(true)
    try {
      const payload = { ...form, parent_id: form.parent_id || null, description: form.description || null, cover_image: form.cover_image || null }
      if (editId) {
        await apiFetch(`/blog-categories/${editId}`, { method: "PATCH", body: JSON.stringify(payload) })
      } else {
        await apiFetch(`/blog-categories`, { method: "POST", body: JSON.stringify(payload) })
      }
      toast.success(t("blogCategory.toast.saved"))
      setDrawerOpen(false)
      load()
    } catch (e: any) {
      toast.error(t("blogCategory.toast.saveFailed"), { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = await prompt({ title: t("blogCategory.confirmDelete.title"), description: t("blogCategory.confirmDelete.desc"), confirmText: t("common.delete"), cancelText: t("common.cancel") })
    if (!confirmed) return
    try {
      await apiFetch(`/blog-categories/${id}`, { method: "DELETE" })
      toast.success(t("blogCategory.toast.deleted"))
      load()
    } catch (e: any) {
      toast.error(t("blogCategory.toast.deleteFailed"), { description: e.message })
    }
  }

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">{t("blogCategory.title")}</Heading>
        <Button onClick={openCreate}>{t("blogCategory.new")}</Button>
      </div>

      {loading ? (
        <Text className="text-ui-fg-muted">{t("common.loading")}</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("name")}>{t("blogCategory.col.name")}{sortIcon("name")}</Table.HeaderCell>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("slug")}>{t("blogCategory.col.slug")}{sortIcon("slug")}</Table.HeaderCell>
              <Table.HeaderCell>{t("blogCategory.col.parent")}</Table.HeaderCell>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("post_count")}>{t("blogCategory.col.postCount")}{sortIcon("post_count")}</Table.HeaderCell>
              <Table.HeaderCell className="cursor-pointer select-none" onClick={() => handleSort("updated_at")}>{t("blogCategory.col.updatedAt")}{sortIcon("updated_at")}</Table.HeaderCell>
              <Table.HeaderCell>{t("blogCategory.col.actions")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedCategories.map((cat) => (
              <Table.Row key={cat.id}>
                <Table.Cell>{cat.name}</Table.Cell>
                <Table.Cell><Text className="text-ui-fg-muted text-sm">{cat.slug}</Text></Table.Cell>
                <Table.Cell>
                  {cat.parent_id ? categories.find((c) => c.id === cat.parent_id)?.name ?? cat.parent_id : "-"}
                </Table.Cell>
                <Table.Cell>{cat.post_count}</Table.Cell>
                <Table.Cell><Text className="text-xs text-ui-fg-muted">{new Date(cat.updated_at).toLocaleDateString()}</Text></Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Button variant="secondary" size="small" onClick={() => openEdit(cat)}>{t("common.edit")}</Button>
                    <Button variant="danger" size="small" onClick={() => handleDelete(cat.id)}>{t("common.delete")}</Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
            {categories.length === 0 && (
              <Table.Row>
                <td colSpan={6} className="p-6 text-center text-sm text-ui-fg-muted">{t("blogCategory.empty")}</td>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{editId ? t("blogCategory.edit") : t("blogCategory.new")}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="space-y-4">
            <div>
              <Label>{t("blogCategory.form.name")}</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <Label>{t("blogCategory.form.slug")}</Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div>
              <Label>{t("blogCategory.form.description")}</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
            </div>
            <div>
              <Label>{t("blogCategory.form.coverImage")}</Label>
              {form.cover_image && (
                <div className="relative mt-1">
                  <img src={form.cover_image} alt={t("blogCategory.form.coverImage")} className="w-full h-32 object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full px-1 text-xs hover:bg-black/70"
                    onClick={() => set("cover_image", "")}
                  >✕</button>
                </div>
              )}
              {!form.cover_image && editId && (
                <div className="mt-1">
                  <Text className="text-xs text-ui-fg-muted mb-1 block">{t("blogCategory.form.coverUploadHint")}</Text>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    className="block w-full text-sm file:mr-2 file:rounded file:border file:border-ui-border-base file:px-2 file:py-1 file:text-xs"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file || !editId) return
                      const fd = new FormData(); fd.append("file", file)
                      try {
                        const res = await apiFetch<{ cover_image: string }>(`/blog-categories/${editId}/media/cover-image`, { method: "POST", body: fd })
                        set("cover_image", res.cover_image)
                      } catch (err: any) { toast.error(t("blogCategory.toast.saveFailed"), { description: err.message }) }
                      e.target.value = ""
                    }}
                  />
                </div>
              )}
              {!form.cover_image && !editId && (
                <Text className="text-xs text-ui-fg-muted mt-1">{t("blogCategory.form.coverNewHint")}</Text>
              )}
            </div>
            <div>
              <Label>{t("blogCategory.form.parent")}</Label>
              <Select value={form.parent_id} onValueChange={(v) => set("parent_id", v)}>
                <Select.Trigger><Select.Value placeholder={t("blogCategory.form.noParent")} /></Select.Trigger>
                <Select.Content>
                  {categories.filter((c) => c.id !== editId).map((c) => (
                    <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select>
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
