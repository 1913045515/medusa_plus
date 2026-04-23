"use client"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import { useCallback, useEffect, useState } from "react"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"
import ProductDetailEditor from "../../components/product-detail-editor"

export const config = defineRouteConfig({
  label: "contentPages.menuLabel", translationNs: "translation",
  icon: DocumentText,
})

type ContentPage = {
  id: string
  title: string
  slug: string
  body: string | null
  status: "draft" | "published"
  show_in_footer: boolean
  footer_label: string | null
  sort_order: number
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

const BASE = "/admin"

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
  return res.json()
}

function emptyForm() {
  return {
    title: "",
    slug: "",
    body: "",
    status: "draft" as "draft" | "published",
    show_in_footer: false,
    footer_label: "",
    sort_order: 0,
    seo_title: "",
    seo_description: "",
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

export default function ContentPagesPage() {
  const prompt = usePrompt()
  const [pages, setPages] = useState<ContentPage[]>([])

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/admin/blog-content-images", {
      method: "POST",
      credentials: "include",
      body: formData,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json?.message ?? "图片上传失败")
    return json.url as string
  }, [])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const loadPages = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ content_pages: ContentPage[] }>("/content-pages")
      setPages(data.content_pages)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPages() }, [loadPages])

  function selectPage(page: ContentPage) {
    setSelectedId(page.id)
    setIsNew(false)
    setSlugManuallyEdited(true)
    setForm({
      title: page.title,
      slug: page.slug,
      body: page.body ?? "",
      status: page.status,
      show_in_footer: page.show_in_footer,
      footer_label: page.footer_label ?? "",
      sort_order: page.sort_order,
      seo_title: page.seo_title ?? "",
      seo_description: page.seo_description ?? "",
    })
  }

  function startNew() {
    setSelectedId(null)
    setIsNew(true)
    setSlugManuallyEdited(false)
    setForm(emptyForm())
  }

  function cancelEdit() {
    setSelectedId(null)
    setIsNew(false)
    setForm(emptyForm())
  }

  function updateField(field: string, value: any) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "title" && !slugManuallyEdited) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  async function handleSave(publishStatus?: "draft" | "published") {
    setSaving(true)
    try {
      const payload = {
        ...form,
        status: publishStatus ?? form.status,
        footer_label: form.footer_label || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
      }

      if (isNew) {
        const data = await apiFetch<{ content_page: ContentPage }>("/content-pages", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast.success("内容页面已创建")
        setIsNew(false)
        setSelectedId(data.content_page.id)
        await loadPages()
      } else if (selectedId) {
        await apiFetch(`/content-pages/${selectedId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
        toast.success("内容页面已更新")
        await loadPages()
      }

      if (publishStatus) {
        setForm((prev) => ({ ...prev, status: publishStatus }))
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(page: ContentPage) {
    const confirmed = await prompt({
      title: "删除内容页面",
      description: `确认删除「${page.title}」？此操作不可撤销。`,
      confirmText: "删除",
      cancelText: "取消",
    })
    if (!confirmed) return
    try {
      await apiFetch(`/content-pages/${page.id}`, { method: "DELETE" })
      toast.success("已删除")
      if (selectedId === page.id) cancelEdit()
      await loadPages()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const selectedPage = pages.find((p) => p.id === selectedId)
  const showEditor = isNew || !!selectedId

  return (
    <div className="flex gap-4 p-4 h-full">
      {/* Left: List */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <Container className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Heading level="h2">内容页面</Heading>
            <Button size="small" onClick={startNew} disabled={isNew}>
              + 新建
            </Button>
          </div>
          {loading ? (
            <Text className="txt-small text-ui-fg-subtle">加载中…</Text>
          ) : pages.length === 0 ? (
            <Text className="txt-small text-ui-fg-subtle">暂无内容页面</Text>
          ) : (
            <div className="flex flex-col gap-2">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => selectPage(page)}
                  className={`text-left p-3 rounded-md border transition-colors ${
                    selectedId === page.id
                      ? "border-ui-border-interactive bg-ui-bg-base"
                      : "border-ui-border-base hover:bg-ui-bg-base-hover"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Text className="txt-small font-medium">{page.title}</Text>
                    <Badge color={page.status === "published" ? "green" : "grey"} size="xsmall">
                      {page.status === "published" ? "已发布" : "草稿"}
                    </Badge>
                    {page.show_in_footer && (
                      <Badge color="blue" size="xsmall">页脚</Badge>
                    )}
                  </div>
                  <Text className="txt-small text-ui-fg-subtle mt-1">/{page.slug}</Text>
                </button>
              ))}
            </div>
          )}
        </Container>
      </div>

      {/* Right: Editor */}
      {showEditor && (
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Meta fields */}
          <Container className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heading level="h2">{isNew ? "新建内容页面" : `编辑：${selectedPage?.title ?? ""}`}</Heading>
              <div className="flex gap-2">
                <Button size="small" variant="secondary" onClick={cancelEdit}>
                  取消
                </Button>
                <Button size="small" variant="secondary" onClick={() => handleSave("draft")} isLoading={saving}>
                  保存草稿
                </Button>
                <Button size="small" onClick={() => handleSave("published")} isLoading={saving}>
                  发布
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label>标题 *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="页面标题"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>URL Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true)
                    updateField("slug", e.target.value)
                  }}
                  placeholder="privacy-policy"
                />
                <Text className="txt-small text-ui-fg-subtle">
                  访问路径：/content/{form.slug || "..."}
                </Text>
              </div>

              <div className="flex flex-col gap-1">
                <Label>SEO 标题</Label>
                <Input
                  value={form.seo_title}
                  onChange={(e) => updateField("seo_title", e.target.value)}
                  placeholder="（留空则使用标题）"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>SEO 描述</Label>
                <Input
                  value={form.seo_description}
                  onChange={(e) => updateField("seo_description", e.target.value)}
                  placeholder="SEO meta description"
                />
              </div>

              <div className="col-span-2 flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.show_in_footer}
                    onCheckedChange={(v) => updateField("show_in_footer", v)}
                  />
                  <Label>显示在页脚</Label>
                </div>
                {form.show_in_footer && (
                  <>
                    <div className="flex flex-col gap-1 flex-1">
                      <Label>页脚显示名称</Label>
                      <Input
                        value={form.footer_label}
                        onChange={(e) => updateField("footer_label", e.target.value)}
                        placeholder="（留空则使用标题）"
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-28">
                      <Label>页脚排序</Label>
                      <Input
                        type="number"
                        value={String(form.sort_order)}
                        onChange={(e) => updateField("sort_order", parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </Container>

          {/* Body editor */}
          <Container className="p-6 flex-1">
            <Label className="mb-2 block">页面内容</Label>
            <ProductDetailEditor
              value={form.body}
              onChange={(html) => updateField("body", html)}
              onImageUpload={handleImageUpload}
            />
          </Container>

          {/* Delete button for existing pages */}
          {!isNew && selectedPage && (
            <div className="flex justify-end">
              <Button
                size="small"
                variant="danger"
                onClick={() => handleDelete(selectedPage)}
              >
                删除此页面
              </Button>
            </div>
          )}
        </div>
      )}

      {!showEditor && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Text className="text-ui-fg-subtle">从左侧选择页面进行编辑，或点击"新建"创建新页面</Text>
          </div>
        </div>
      )}
    </div>
  )
}
