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
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"

type HomepageTemplateContent = {
  render_mode: "static_html"
  template: {
    html: string
    css: string
  }
}

type HomepageRecord = {
  id: string
  title: string
  handle: string
  site_key?: string
  status: "draft" | "published"
  is_active: boolean
  published_at: string | null
  content: {
    render_mode?: string
    template?: {
      html?: string | null
      css?: string | null
    }
  } | null
}

type HomepageListResponse = {
  homepages: HomepageRecord[]
  active_homepage_id: string | null
}

type HomepageSingleResponse = {
  homepage: HomepageRecord
}

const BASE = "/admin"
const DEFAULT_LOCALE = "default"
const DEFAULT_SITE_KEY = "default"
const CONTENT_LOCALES = [DEFAULT_LOCALE, "zh-CN", "en-US"]
const SITE_OPTIONS = [DEFAULT_SITE_KEY, "us", "de"]
const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis
const STYLE_TAG_REGEX = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gis
const EVENT_HANDLER_ATTR_REGEX = /\son[a-z-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_URL_ATTR_REGEX = /\s(href|src|xlink:href|formaction)\s*=\s*(["'])\s*javascript:[^"']*\2/gi

const emptyTemplate = (): HomepageTemplateContent => ({
  render_mode: "static_html",
  template: {
    html: "",
    css: "",
  },
})

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

function sanitizeTemplateHtml(html?: string | null): string {
  return (html ?? "")
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(STYLE_TAG_REGEX, "")
    .replace(EVENT_HANDLER_ATTR_REGEX, "")
    .replace(JS_URL_ATTR_REGEX, ' $1="#"')
    .trim()
}

function sanitizeTemplateCss(css?: string | null): string {
  return (css ?? "")
    .replace(/@import\s+[^;]+;?/gi, "")
    .replace(/expression\s*\(/gi, "(")
    .replace(/javascript\s*:/gi, "")
    .trim()
}

function normalizeTemplate(content?: HomepageRecord["content"]): HomepageTemplateContent {
  if (content?.render_mode === "static_html" || content?.template) {
    return {
      render_mode: "static_html",
      template: {
        html: content.template?.html ?? "",
        css: content.template?.css ?? "",
      },
    }
  }

  return emptyTemplate()
}

const HomepageEditorPage = () => {
  const { t } = useTranslation()
  const [records, setRecords] = useState<HomepageRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [handle, setHandle] = useState("")
  const [siteKey, setSiteKey] = useState(DEFAULT_SITE_KEY)
  const [selectedLocale, setSelectedLocale] = useState(DEFAULT_LOCALE)
  const [template, setTemplate] = useState<HomepageTemplateContent>(emptyTemplate())
  const [newTitle, setNewTitle] = useState("")
  const [newHandle, setNewHandle] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId]
  )
  const sanitizedHtml = useMemo(
    () => sanitizeTemplateHtml(template.template.html),
    [template.template.html]
  )
  const sanitizedCss = useMemo(
    () => sanitizeTemplateCss(template.template.css),
    [template.template.css]
  )
  const htmlAdjusted = sanitizedHtml !== template.template.html.trim()
  const cssAdjusted = sanitizedCss !== template.template.css.trim()
  const isLegacyRecord = Boolean(selectedRecord && selectedRecord.content?.render_mode !== "static_html")

  const syncEditor = useCallback((record: HomepageRecord | null) => {
    if (!record) {
      setTitle("")
      setHandle("")
      setSiteKey(DEFAULT_SITE_KEY)
      setTemplate(emptyTemplate())
      return
    }

    setTitle(record.title)
    setHandle(record.handle)
    setSiteKey(record.site_key ?? DEFAULT_SITE_KEY)
    setTemplate(normalizeTemplate(record.content))
  }, [])

  const loadHomepages = useCallback(async (preferredId?: string | null) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedLocale !== DEFAULT_LOCALE) {
        params.set("locale", selectedLocale)
      }
      const suffix = params.toString() ? `?${params.toString()}` : ""
      const data = await apiFetch<HomepageListResponse>(`/homepage-content${suffix}`)
      setRecords(data.homepages)

      const nextSelectedId =
        preferredId && data.homepages.some((item) => item.id === preferredId)
          ? preferredId
          : selectedId && data.homepages.some((item) => item.id === selectedId)
            ? selectedId
            : data.active_homepage_id ?? data.homepages[0]?.id ?? null

      setSelectedId(nextSelectedId)
      syncEditor(data.homepages.find((item) => item.id === nextSelectedId) ?? null)
    } catch (error: any) {
      toast.error(error?.message ?? t("homepageEditor.toast.loadFailed"))
    } finally {
      setLoading(false)
    }
  }, [selectedId, selectedLocale, syncEditor])

  useEffect(() => {
    loadHomepages()
  }, [loadHomepages])

  const selectRecord = (record: HomepageRecord) => {
    setSelectedId(record.id)
    syncEditor(record)
  }

  const validate = (requireHtml: boolean) => {
    if (!selectedRecord) {
      toast.error(t("homepageEditor.toast.selectFirst"))
      return false
    }
    if (!title.trim()) {
      toast.error(t("homepageEditor.toast.titleRequired"))
      return false
    }
    if (!handle.trim()) {
      toast.error(t("homepageEditor.toast.handleRequired"))
      return false
    }
    if (requireHtml && !sanitizedHtml) {
      toast.error(t("homepageEditor.toast.htmlRequired"))
      return false
    }
    return true
  }

  const saveRecord = async (status: "draft" | "published") => {
    if (!validate(status === "published") || !selectedRecord) return

    setSaving(true)
    try {
      await apiFetch<HomepageSingleResponse>("/homepage-content", {
        method: "PUT",
        body: JSON.stringify({
          id: selectedRecord.id,
          title,
          handle,
          site_key: siteKey,
          status,
          is_active: selectedRecord.is_active,
          content: {
            render_mode: "static_html",
            template: {
              html: template.template.html,
              css: template.template.css,
            },
          },
          translations:
            selectedLocale === DEFAULT_LOCALE
              ? undefined
              : {
                  [selectedLocale]: {
                    render_mode: "static_html",
                    template: {
                      html: template.template.html,
                      css: template.template.css,
                    },
                  },
                },
        }),
      })
      await loadHomepages(selectedRecord.id)
      toast.success(status === "draft" ? t("homepageEditor.toast.draftSaved") : t("homepageEditor.toast.templateSaved"))
    } catch (error: any) {
      toast.error(error?.message ?? t("homepageEditor.toast.saveFailed"))
    } finally {
      setSaving(false)
    }
  }

  const publishRecord = async () => {
    if (!validate(true) || !selectedRecord) return

    setPublishing(true)
    try {
      await apiFetch<HomepageSingleResponse>("/homepage-content", {
        method: "PUT",
        body: JSON.stringify({
          id: selectedRecord.id,
          title,
          handle,
          site_key: siteKey,
          status: "published",
          is_active: selectedRecord.is_active,
          content: {
            render_mode: "static_html",
            template: {
              html: template.template.html,
              css: template.template.css,
            },
          },
          translations:
            selectedLocale === DEFAULT_LOCALE
              ? undefined
              : {
                  [selectedLocale]: {
                    render_mode: "static_html",
                    template: {
                      html: template.template.html,
                      css: template.template.css,
                    },
                  },
                },
        }),
      })
      await apiFetch<HomepageSingleResponse>(`/homepage-content/${selectedRecord.id}/publish`, {
        method: "POST",
      })
      await loadHomepages(selectedRecord.id)
      toast.success(t("homepageEditor.toast.published"))
    } catch (error: any) {
      toast.error(error?.message ?? t("homepageEditor.toast.publishFailed"))
    } finally {
      setPublishing(false)
    }
  }

  const duplicateRecord = async () => {
    if (!selectedRecord) {
      toast.error(t("homepageEditor.toast.selectFirst"))
      return
    }

    setDuplicating(true)
    try {
      const data = await apiFetch<HomepageSingleResponse>(
        `/homepage-content/${selectedRecord.id}/copy`,
        {
          method: "POST",
        }
      )
      await loadHomepages(data.homepage.id)
      toast.success(t("homepageEditor.toast.duplicated", { title: data.homepage.title }))
    } catch (error: any) {
      toast.error(error?.message ?? t("homepageEditor.toast.duplicateFailed"))
    } finally {
      setDuplicating(false)
    }
  }

  const deleteRecord = async () => {
    if (!selectedRecord) {
      toast.error(t("homepageEditor.toast.selectFirst"))
      return
    }

    if (selectedRecord.is_active) {
      toast.error(t("homepageEditor.toast.cannotDeleteActive"))
      return
    }

    if (!window.confirm(t("homepageEditor.confirmDelete", { title: selectedRecord.title }))) {
      return
    }

    setDeleting(true)
    try {
      await apiFetch(`/homepage-content/${selectedRecord.id}`, {
        method: "DELETE",
      })

      const remainingIds = records.filter((record) => record.id !== selectedRecord.id)
      const fallbackId = remainingIds[0]?.id ?? null

      await loadHomepages(fallbackId)
      toast.success(t("homepageEditor.toast.deleted"))
    } catch (error: any) {
      toast.error(error?.message ?? t("homepageEditor.toast.deleteFailed"))
    } finally {
      setDeleting(false)
    }
  }

  const createRecord = async () => {
    if (!newTitle.trim()) {
      toast.error(t("homepageEditor.toast.newTitleRequired"))
      return
    }
    if (!newHandle.trim()) {
      toast.error(t("homepageEditor.toast.newHandleRequired"))
      return
    }

    setCreating(true)
    try {
      const data = await apiFetch<HomepageSingleResponse>("/homepage-content", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          handle: newHandle,
          site_key: siteKey,
          status: "draft",
          content: emptyTemplate(),
        }),
      })
      setNewTitle("")
      setNewHandle("")
      await loadHomepages(data.homepage.id)
      toast.success(t("homepageEditor.toast.created"))
    } catch (error: any) {
      toast.error(error?.message ?? t("homepageEditor.toast.createFailed"))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Container className="flex items-center justify-between p-6">
        <div>
          <Heading level="h1">{t("homepageEditor.title")}</Heading>
          <Text className="txt-small text-ui-fg-subtle mt-2">
            {t("homepageEditor.pageDescription")}
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-[140px]">
            <Select value={siteKey} onValueChange={setSiteKey}>
              <Select.Trigger>
                <Select.Value placeholder={t("siteKey.placeholder")} />
              </Select.Trigger>
              <Select.Content>
                {SITE_OPTIONS.map((option) => (
                  <Select.Item key={option} value={option}>{option}</Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="min-w-[160px]">
            <Select value={selectedLocale} onValueChange={setSelectedLocale}>
              <Select.Trigger>
                <Select.Value placeholder={t("contentLocale.placeholder")} />
              </Select.Trigger>
              <Select.Content>
                {CONTENT_LOCALES.map((option) => (
                  <Select.Item key={option} value={option}>{option}</Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => loadHomepages(selectedId)} isLoading={loading}>
            {t("homepageEditor.refresh")}
          </Button>
          <Button
            variant="secondary"
            onClick={duplicateRecord}
            isLoading={duplicating}
            disabled={!selectedRecord}
          >
            {t("homepageEditor.duplicate")}
          </Button>
          <Button
            variant="secondary"
            onClick={deleteRecord}
            isLoading={deleting}
            disabled={!selectedRecord || selectedRecord.is_active}
          >
            {t("homepageEditor.delete")}
          </Button>
          <Button variant="secondary" onClick={() => saveRecord("draft")} isLoading={saving}>
            {t("homepageEditor.saveDraft")}
          </Button>
          <Button onClick={publishRecord} isLoading={publishing}>
            {t("homepageEditor.publish")}
          </Button>
        </div>
      </Container>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_420px] gap-6">
        <div className="flex flex-col gap-6">
          <Container className="p-6">
            <Heading level="h2">{t("homepageEditor.createNew")}</Heading>
            <div className="grid gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-title">{t("homepageEditor.titleLabel")}</Label>
                <Input id="new-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="new-handle">{t("common.handle")}</Label>
                <Input id="new-handle" value={newHandle} onChange={(e) => setNewHandle(e.target.value)} />
              </div>
              <Button onClick={createRecord} isLoading={creating}>{t("homepageEditor.createDraft")}</Button>
            </div>
          </Container>

          <Container className="p-6">
            <Heading level="h2">{t("homepageEditor.templateList")}</Heading>
            <div className="mt-4 grid gap-3">
              {records.length ? (
                records.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => selectRecord(record)}
                    className={`rounded-xl border p-4 text-left transition-colors ${selectedId === record.id ? "border-ui-border-interactive bg-ui-bg-subtle" : "border-ui-border-base bg-ui-bg-base"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Text className="txt-small-plus">{record.title}</Text>
                      <div className="flex gap-2">
                        <Badge color={record.status === "published" ? "green" : "orange"}>{record.status === "published" ? t("common.published") : t("common.draft")}</Badge>
                        {record.is_active ? <Badge color="blue">{t("common.active")}</Badge> : null}
                      </div>
                    </div>
                    <Text className="txt-small text-ui-fg-subtle mt-2">/{record.handle}</Text>
                    <Text className="txt-small text-ui-fg-subtle mt-2">
                      {record.content?.render_mode === "static_html" ? t("homepageEditor.staticHtml") : t("homepageEditor.legacyStructured")}
                    </Text>
                    <Text className="txt-small text-ui-fg-subtle mt-2">
                      {record.published_at ? t("homepageEditor.publishedAt", { time: record.published_at }) : t("homepageEditor.notPublished")}
                    </Text>
                  </button>
                ))
              ) : (
                <Text className="txt-small text-ui-fg-subtle">{t("homepageEditor.empty")}</Text>
              )}
            </div>
          </Container>
        </div>

        <div className="flex flex-col gap-6">
          <Container className="p-6">
            <div className="flex items-center justify-between gap-3">
              <Heading level="h2">{t("homepageEditor.basicInfo")}</Heading>
              {isLegacyRecord ? <Badge color="orange">{t("homepageEditor.legacyStructured")}</Badge> : null}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="homepage-title">{t("homepageEditor.templateTitle")}</Label>
                <Input id="homepage-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!selectedRecord} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="homepage-handle">{t("common.handle")}</Label>
                <Input id="homepage-handle" value={handle} onChange={(e) => setHandle(e.target.value)} disabled={!selectedRecord} />
              </div>
            </div>
            {isLegacyRecord ? (
              <Text className="txt-small text-ui-fg-subtle mt-4">
                {t("homepageEditor.legacyNotice")}
              </Text>
            ) : null}
            {selectedRecord ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={duplicateRecord} isLoading={duplicating}>
                  {t("homepageEditor.duplicateCurrent")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={deleteRecord}
                  isLoading={deleting}
                  disabled={selectedRecord.is_active}
                >
                  {t("homepageEditor.deleteCurrent")}
                </Button>
              </div>
            ) : null}
            {selectedRecord?.is_active ? (
              <Text className="txt-small text-ui-fg-subtle mt-3">
                {t("homepageEditor.activeNotice")}
              </Text>
            ) : null}
          </Container>

          <Container className="p-6">
            <Heading level="h2">{t("homepageEditor.htmlTemplate")}</Heading>
            <Text className="txt-small text-ui-fg-subtle mt-2">
              {t("homepageEditor.htmlDescription")}
            </Text>
            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor="template-html">HTML</Label>
              <Textarea
                id="template-html"
                rows={18}
                value={template.template.html}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    template: { ...prev.template, html: e.target.value },
                  }))
                }
                disabled={!selectedRecord}
              />
            </div>
          </Container>

          <Container className="p-6">
            <Heading level="h2">{t("homepageEditor.templateStyles")}</Heading>
            <Text className="txt-small text-ui-fg-subtle mt-2">
              {t("homepageEditor.cssDescription")}
            </Text>
            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor="template-css">CSS</Label>
              <Textarea
                id="template-css"
                rows={12}
                value={template.template.css}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    template: { ...prev.template, css: e.target.value },
                  }))
                }
                disabled={!selectedRecord}
              />
            </div>
          </Container>
        </div>

        <Container className="p-6 h-fit sticky top-6">
          <div className="flex items-center justify-between gap-3">
            <Heading level="h2">{t("homepageEditor.preview")}</Heading>
            {selectedRecord ? (
              <div className="flex gap-2">
                <Badge color={selectedRecord.status === "published" ? "green" : "orange"}>{selectedRecord.status}</Badge>
                {selectedRecord.is_active ? <Badge color="blue">active</Badge> : null}
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            {htmlAdjusted ? <Badge color="orange">{t("homepageEditor.htmlSanitized")}</Badge> : null}
            {cssAdjusted ? <Badge color="orange">{t("homepageEditor.cssSanitized")}</Badge> : null}
            {!sanitizedHtml ? <Badge color="red">{t("homepageEditor.noHtml")}</Badge> : null}
          </div>

          <div className="mt-4 rounded-2xl overflow-hidden border border-ui-border-base bg-ui-bg-base">
            {sanitizedCss ? <style dangerouslySetInnerHTML={{ __html: sanitizedCss }} /> : null}
            <div className="min-h-[480px] bg-ui-bg-subtle p-4">
              {sanitizedHtml ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
              ) : (
                <div className="flex min-h-[448px] items-center justify-center rounded-xl border border-dashed border-ui-border-base bg-ui-bg-base p-6 text-center">
                  <Text className="txt-small text-ui-fg-subtle">
                    {t("homepageEditor.previewEmpty")}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "homepageEditor.menuLabel",
  translationNs: "translation",
  icon: PencilSquare,
})

export default HomepageEditorPage