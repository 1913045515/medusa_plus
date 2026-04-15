import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Container,
  Heading,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Switch,
  toast,
  Text,
  Badge,
} from "@medusajs/ui"
import { MagnifyingGlass, XMark } from "@medusajs/icons"
import ProductDetailEditor from "../../../components/product-detail-editor"

type Category = { id: string; name: string }
type Tag = { id: string; name: string; slug: string }
type UserGroup = { id: string; name: string }
type CustomerResult = { id: string; email: string | null; first_name: string | null; last_name: string | null }
type BlogVersion = { id: string; version_number: number; created_at: string; created_by?: string }
type BlogComment = { id: string; author_name: string | null; author_email: string | null; content: string; status: string; created_at: string }

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

type Tab = "content" | "versions" | "comments"

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [tab, setTab] = useState<Tab>("content")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [allGroups, setAllGroups] = useState<UserGroup[]>([])
  const [coverUploading, setCoverUploading] = useState(false)

  // Customer search for visibility=user
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [userSearchResults, setUserSearchResults] = useState<CustomerResult[]>([])
  const [userSearching, setUserSearching] = useState(false)
  const [visibilityUserMap, setVisibilityUserMap] = useState<Map<string, CustomerResult>>(new Map())
  const userSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Versions & Comments state
  const [versions, setVersions] = useState<BlogVersion[]>([])
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category_id: "",
    status: "draft" as string,
    is_pinned: false,
    password: "",
    visibility: "all" as string,
    visibility_user_ids: [] as string[],
    visibility_group_ids: [] as string[],
    allow_comments: true,
    seo_title: "",
    seo_description: "",
    scheduled_at: "",
    tag_ids: [] as string[],
    sort: 0,
  })

  // Load blog data + categories + tags + groups
  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      apiFetch<{ post: any }>(`/blogs/${id}`),
      apiFetch<{ categories: Category[] }>("/blog-categories"),
      apiFetch<{ tags: Tag[] }>("/blog-tags"),
      apiFetch<{ groups: UserGroup[] }>("/blog-user-groups"),
    ]).then(async ([postData, catData, tagData, groupData]) => {
      const post = postData.post
      setCategories(catData.categories)
      setTags(tagData.tags)
      setAllGroups(groupData.groups || [])

      const visUserIds: string[] = post.visibility_user_ids || []
      const visGroupIds: string[] = post.visibility_group_ids || []

      setForm({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        cover_image: post.cover_image || "",
        category_id: post.category_id || "",
        status: post.status || "draft",
        is_pinned: post.is_pinned || false,
        password: post.password || "",
        visibility: post.visibility || "all",
        visibility_user_ids: visUserIds,
        visibility_group_ids: visGroupIds,
        allow_comments: post.allow_comments !== false,
        seo_title: post.seo_title || "",
        seo_description: post.seo_description || "",
        scheduled_at: post.scheduled_at ? post.scheduled_at.replace("Z", "").slice(0, 16) : "",
        tag_ids: (post.tags || []).map((tg: Tag) => tg.id),
        sort: post.sort || 0,
      })

      // Batch load visibility user details if any
      if (visUserIds.length > 0) {
        try {
          const userData = await apiFetch<{ customers: CustomerResult[] }>(
            `/blog-customers/search?ids=${visUserIds.join(",")}`
          )
          const map = new Map<string, CustomerResult>()
          ;(userData.customers || []).forEach((c) => map.set(c.id, c))
          setVisibilityUserMap(map)
        } catch {}
      }
    }).catch((e) => {
      toast.error(t("blog.toast.loadFailed"), { description: e.message })
    }).finally(() => setLoading(false))
  }, [id])

  // Load versions when tab switches
  useEffect(() => {
    if (tab !== "versions" || !id) return
    setVersionsLoading(true)
    apiFetch<{ versions: BlogVersion[] }>(`/blogs/${id}/versions`)
      .then((d) => setVersions(d.versions || []))
      .catch(() => {})
      .finally(() => setVersionsLoading(false))
  }, [tab, id])

  // Load comments when tab switches
  useEffect(() => {
    if (tab !== "comments" || !id) return
    setCommentsLoading(true)
    apiFetch<{ comments: BlogComment[] }>(`/blogs/${id}/comments`)
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
  }, [tab, id])

  // Debounced customer search for visibility=user
  useEffect(() => {
    if (userSearchDebounceRef.current) clearTimeout(userSearchDebounceRef.current)
    if (!userSearchQuery.trim()) { setUserSearchResults([]); return }
    userSearchDebounceRef.current = setTimeout(async () => {
      setUserSearching(true)
      try {
        const data = await apiFetch<{ customers: CustomerResult[] }>(
          `/blog-customers/search?q=${encodeURIComponent(userSearchQuery)}&limit=10`
        )
        setUserSearchResults(data.customers.filter((c) => !form.visibility_user_ids.includes(c.id)))
      } catch { setUserSearchResults([]) }
      finally { setUserSearching(false) }
    }, 300)
  }, [userSearchQuery, form.visibility_user_ids])

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const addVisibilityUser = (cust: CustomerResult) => {
    setForm((prev) => ({ ...prev, visibility_user_ids: [...new Set([...prev.visibility_user_ids, cust.id])] }))
    setVisibilityUserMap((prev) => new Map(prev).set(cust.id, cust))
    setUserSearchQuery("")
    setUserSearchResults([])
  }

  const removeVisibilityUser = (userId: string) => {
    setForm((prev) => ({ ...prev, visibility_user_ids: prev.visibility_user_ids.filter((u) => u !== userId) }))
  }

  const toggleGroup = (groupId: string) => {
    setForm((prev) => ({
      ...prev,
      visibility_group_ids: prev.visibility_group_ids.includes(groupId)
        ? prev.visibility_group_ids.filter((g) => g !== groupId)
        : [...prev.visibility_group_ids, groupId],
    }))
  }

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((t) => t !== tagId)
        : [...prev.tag_ids, tagId],
    }))
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    e.target.value = ""
    setCoverUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch(`/admin/blogs/${id}/media/cover-image`, {
        method: "POST",
        credentials: "include",
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).message ?? `Upload failed: ${res.status}`)
      }
      const data = await res.json()
      set("cover_image", data.cover_image)
      toast.success(t("blog.cover.uploaded", "封面已上传"))
    } catch (e: any) {
      toast.error(t("blog.toast.saveFailed"), { description: e.message })
    } finally {
      setCoverUploading(false)
    }
  }

  const handleCoverDelete = async () => {
    if (!id) return
    try {
      const res = await fetch(`/admin/blogs/${id}/media/cover-image`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
      set("cover_image", "")
      toast.success(t("blog.cover.deleted", "封面已删除"))
    } catch (e: any) {
      toast.error(t("blog.toast.saveFailed"), { description: e.message })
    }
  }

  const uploadBlogContentImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/admin/blog-content-images", {
      method: "POST",
      credentials: "include",
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message ?? `Upload failed: ${res.status}`)
    }
    const data = await res.json()
    return data.url as string
  }

  const handleSave = async (status?: string) => {
    if (!form.title.trim()) { toast.error(t("blog.toast.titleRequired")); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        status: status ?? form.status,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at) : null,
        category_id: form.category_id || null,
        password: form.password || null,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        cover_image: form.cover_image || null,
        visibility_user_ids: form.visibility === "user" ? form.visibility_user_ids : null,
        visibility_group_ids: form.visibility === "group" ? form.visibility_group_ids : null,
      }
      await apiFetch(`/blogs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      toast.success(t("blog.toast.saved"))
      if (status) set("status", status)
    } catch (e: any) {
      toast.error(t("blog.toast.saveFailed"), { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handleRestoreVersion = async (versionId: string) => {
    try {
      await apiFetch(`/blogs/${id}/versions`, {
        method: "POST",
        body: JSON.stringify({ version_id: versionId }),
      })
      toast.success(t("blog.versions.restored"))
      // Reload blog data
      const data = await apiFetch<{ post: any }>(`/blogs/${id}`)
      const post = data.post
      setForm((prev) => ({ ...prev, content: post.content || "" }))
    } catch (e: any) {
      toast.error(t("blog.versions.restoreFailed"), { description: e.message })
    }
  }

  const handleUpdateCommentStatus = async (commentId: string, status: "approved" | "rejected") => {
    try {
      await apiFetch(`/blogs/${id}/comments`, {
        method: "PATCH",
        body: JSON.stringify({ comment_id: commentId, status }),
      })
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, status } : c))
      toast.success(t("blog.toast.saved"))
    } catch (e: any) {
      toast.error(t("blog.toast.saveFailed"), { description: e.message })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await apiFetch(`/blogs/${id}/comments`, {
        method: "DELETE",
        body: JSON.stringify({ comment_id: commentId }),
      })
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success(t("blog.comments.deleted"))
    } catch (e: any) {
      toast.error(t("blog.toast.saveFailed"), { description: e.message })
    }
  }

  if (loading) {
    return (
      <Container className="p-6 max-w-5xl">
        <Text className="text-ui-fg-muted">{t("blog.loading")}</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h1">{t("blog.editPost")}</Heading>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/blogs")}>{t("blog.back")}</Button>
          <Button variant="secondary" disabled={saving} onClick={() => handleSave("draft")}>
            {t("blog.saveDraft")}
          </Button>
          <Button disabled={saving} onClick={() => handleSave("published")}>
            {t("blog.publish")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-ui-border-base">
        {(["content", "versions", "comments"] as Tab[]).map((t_) => (
          <button
            key={t_}
            type="button"
            onClick={() => setTab(t_)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t_
                ? "border-ui-border-interactive text-ui-fg-base"
                : "border-transparent text-ui-fg-muted hover:text-ui-fg-base"
            }`}
          >
            {t(`blog.tab.${t_}`)}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {tab === "content" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-4">
            <div>
              <Label htmlFor="title">{t("blog.form.titleLabel")}</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="slug">{t("blog.form.slugLabel")}</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder={t("blog.form.slugPlaceholder")}
              />
            </div>
            <div>
              <Label>{t("blog.form.contentLabel")}</Label>
              <ProductDetailEditor
                value={form.content}
                onChange={(html) => set("content", html)}
                onImageUpload={uploadBlogContentImage}
              />
            </div>
            <div>
              <Label htmlFor="excerpt">{t("blog.form.excerptHint")}</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
                placeholder={t("blog.form.excerptPlaceholder")}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-ui-border-base rounded-md p-4 space-y-3">
              <Text className="font-semibold">{t("blog.form.publishSettings")}</Text>
              <div>
                <Label>{t("blog.form.status")}</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <Select.Trigger><Select.Value /></Select.Trigger>
                  <Select.Content>
                    <Select.Item value="draft">{t("blog.status.draft")}</Select.Item>
                    <Select.Item value="scheduled">{t("blog.status.scheduled")}</Select.Item>
                    <Select.Item value="published">{t("blog.status.published")}</Select.Item>
                    <Select.Item value="archived">{t("blog.status.archived")}</Select.Item>
                  </Select.Content>
                </Select>
              </div>
              {form.status === "scheduled" && (
                <div>
                  <Label htmlFor="scheduled_at">{t("blog.form.scheduledAt")}</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => set("scheduled_at", e.target.value)}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>{t("blog.form.isPinned")}</Label>
                <Switch checked={form.is_pinned} onCheckedChange={(v) => set("is_pinned", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t("blog.form.allowComments")}</Label>
                <Switch checked={form.allow_comments} onCheckedChange={(v) => set("allow_comments", v)} />
              </div>
              <div>
                <Label>{t("blog.form.sort")}</Label>
                <Input type="number" value={form.sort} onChange={(e) => set("sort", parseInt(e.target.value, 10) || 0)} min={0} />
              </div>
            </div>

            <div className="border border-ui-border-base rounded-md p-4 space-y-2">
              <Text className="font-semibold">{t("blog.form.categoryLabel")}</Text>
              <Select value={form.category_id} onValueChange={(v) => set("category_id", v)}>
                <Select.Trigger><Select.Value placeholder={t("blog.form.selectCategory")} /></Select.Trigger>
                <Select.Content>
                  {categories.map((c) => (
                    <Select.Item key={c.id} value={c.id}>{c.name}</Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="border border-ui-border-base rounded-md p-4 space-y-2">
              <Text className="font-semibold">{t("blog.form.tagsLabel")}</Text>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2 py-1 text-xs rounded-full border ${
                      form.tag_ids.includes(tag.id)
                        ? "bg-ui-bg-interactive text-ui-fg-on-color border-transparent"
                        : "border-ui-border-base hover:bg-ui-bg-base-hover"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && <Text className="text-ui-fg-muted text-xs">{t("blog.form.noTags")}</Text>}
              </div>
            </div>

            <div className="border border-ui-border-base rounded-md p-4 space-y-2">
              <Text className="font-semibold">{t("blog.cover.label")}</Text>
              {form.cover_image ? (
                <>
                  <img src={form.cover_image} alt="cover" className="w-full rounded object-cover max-h-40" />
                  <Button
                    variant="danger"
                    size="small"
                    onClick={handleCoverDelete}
                  >
                    {t("common.delete")}
                  </Button>
                </>
              ) : (
                <>
                  <Text className="text-xs text-ui-fg-muted block">{t("blog.form.coverUploadHint", "选择图片上传为封面")}</Text>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    disabled={coverUploading}
                    className="block w-full text-sm file:mr-2 file:rounded file:border file:border-ui-border-base file:px-2 file:py-1 file:text-xs"
                    onChange={handleCoverUpload}
                  />
                  {coverUploading && <Text className="text-xs text-ui-fg-muted">{t("common.loading")}</Text>}
                </>
              )}
            </div>

            <div className="border border-ui-border-base rounded-md p-4 space-y-2">
              <Text className="font-semibold">{t("blog.visibility.label")}</Text>
              <Select value={form.visibility} onValueChange={(v) => set("visibility", v)}>
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">{t("blog.visibility.all")}</Select.Item>
                  <Select.Item value="user">{t("blog.visibility.user")}</Select.Item>
                  <Select.Item value="group">{t("blog.visibility.group")}</Select.Item>
                </Select.Content>
              </Select>

              {form.visibility === "user" && (
                <div className="pt-2 space-y-2">
                  <Label>{t("blog.visibility.searchUser")}</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-fg-muted pointer-events-none"><MagnifyingGlass /></span>
                    <Input
                      className="pl-8"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder={t("blog.visibility.searchUserPlaceholder")}
                    />
                  </div>
                  {(userSearchResults.length > 0 || (userSearching && userSearchQuery.trim())) && (
                    <div className="border border-ui-border-base rounded-md bg-ui-bg-base shadow-md max-h-48 overflow-y-auto">
                      {userSearching && <div className="px-3 py-2 text-xs text-ui-fg-muted">{t("blog.comments.searching")}</div>}
                      {!userSearching && userSearchResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-ui-bg-base-hover text-xs border-b border-ui-border-base last:border-0"
                          onClick={() => addVisibilityUser(c)}
                        >
                          <span className="font-medium">{c.email}</span>
                          <span className="text-ui-fg-muted ml-2">{[c.first_name, c.last_name].filter(Boolean).join(" ")}</span>
                        </button>
                      ))}
                      {!userSearching && userSearchResults.length === 0 && (
                        <div className="px-3 py-2 text-xs text-ui-fg-muted">{t("blog.visibility.searchNoResult")}</div>
                      )}
                    </div>
                  )}
                  {form.visibility_user_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {form.visibility_user_ids.map((uid) => {
                        const info = visibilityUserMap.get(uid)
                        const label = info?.email || uid.slice(0, 12) + "…"
                        const name = info ? [info.first_name, info.last_name].filter(Boolean).join(" ") : ""
                        return (
                          <span key={uid} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-ui-bg-subtle border border-ui-border-base rounded-full">
                            <span className="font-medium">{label}</span>
                            {name && <span className="text-ui-fg-muted">· {name}</span>}
                            <button type="button" onClick={() => removeVisibilityUser(uid)} className="text-ui-fg-muted hover:text-ui-fg-base">
                              <XMark />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {form.visibility === "group" && (
                <div className="pt-2 space-y-2">
                  <Label>{t("blog.visibility.selectGroup")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {allGroups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGroup(g.id)}
                        className={`px-2 py-1 text-xs rounded-full border ${
                          form.visibility_group_ids.includes(g.id)
                            ? "bg-ui-bg-interactive text-ui-fg-on-color border-transparent"
                            : "border-ui-border-base hover:bg-ui-bg-base-hover"
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                    {allGroups.length === 0 && <Text className="text-xs text-ui-fg-muted">{t("blog.visibility.noGroups")}</Text>}
                  </div>
                </div>
              )}
            </div>

            <div className="border border-ui-border-base rounded-md p-4 space-y-2">
              <Text className="font-semibold">{t("blog.form.passwordLabel")}</Text>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={t("blog.form.passwordPlaceholder")}
              />
            </div>

            <div className="border border-ui-border-base rounded-md p-4 space-y-3">
              <Text className="font-semibold">{t("blog.form.seoSettings")}</Text>
              <div>
                <Label>{t("blog.form.seoTitle")}</Label>
                <Input
                  value={form.seo_title}
                  onChange={(e) => set("seo_title", e.target.value)}
                  placeholder={t("blog.form.seoTitlePlaceholder")}
                />
              </div>
              <div>
                <Label>{t("blog.form.seoDescription")}</Label>
                <Textarea
                  value={form.seo_description}
                  onChange={(e) => set("seo_description", e.target.value)}
                  rows={2}
                  placeholder={t("blog.form.seoDescriptionPlaceholder")}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Versions Tab */}
      {tab === "versions" && (
        <div className="space-y-3">
          {versionsLoading && <Text className="text-ui-fg-muted text-sm">{t("blog.loading")}</Text>}
          {!versionsLoading && versions.length === 0 && (
            <Text className="text-ui-fg-muted text-sm">{t("blog.versions.empty")}</Text>
          )}
          {!versionsLoading && versions.map((v) => (
            <div key={v.id} className="flex items-center justify-between border border-ui-border-base rounded-md px-4 py-3">
              <div>
                <Text className="font-medium text-sm">v{v.version_number}</Text>
                <Text className="text-xs text-ui-fg-muted">{new Date(v.created_at).toLocaleString()}</Text>
              </div>
              <Button size="small" variant="secondary" onClick={() => handleRestoreVersion(v.id)}>
                {t("blog.versions.restore")}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Comments Tab */}
      {tab === "comments" && (
        <div className="space-y-3">
          {commentsLoading && <Text className="text-ui-fg-muted text-sm">{t("blog.loading")}</Text>}
          {!commentsLoading && comments.length === 0 && (
            <Text className="text-ui-fg-muted text-sm">{t("blog.comments.empty")}</Text>
          )}
          {!commentsLoading && comments.map((c) => (
            <div key={c.id} className="border border-ui-border-base rounded-md px-4 py-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Text className="text-sm font-medium">{c.author_name || c.author_email || "—"}</Text>
                    <Badge size="xsmall" color={c.status === "approved" ? "green" : c.status === "rejected" ? "red" : "grey"}>
                      {t(`blog.comments.status.${c.status}`) || c.status}
                    </Badge>
                  </div>
                  <Text className="text-xs text-ui-fg-muted">{new Date(c.created_at).toLocaleString()}</Text>
                  <Text className="text-sm mt-1">{c.content}</Text>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {c.status !== "approved" && (
                    <Button size="small" variant="secondary" onClick={() => handleUpdateCommentStatus(c.id, "approved")}>
                      {t("blog.comments.approve")}
                    </Button>
                  )}
                  {c.status !== "rejected" && (
                    <Button size="small" variant="secondary" onClick={() => handleUpdateCommentStatus(c.id, "rejected")}>
                      {t("blog.comments.reject")}
                    </Button>
                  )}
                  <Button size="small" variant="danger" onClick={() => handleDeleteComment(c.id)}>
                    {t("blog.comments.delete")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
