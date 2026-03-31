import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BookOpen } from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Heading,
  Button,
  Table,
  Badge,
  Text,
  toast,
  usePrompt,
  Drawer,
  Input,
  Label,
  Select,
  Textarea,
} from "@medusajs/ui"

// ─── Types ───────────────────────────────────────────────────────────────────

type Course = {
  id: string
  handle: string
  title: string
  description: string | null
  thumbnail_url: string | null
  level: string | null
  lessons_count: number
  status: string
  product_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

type Product = {
  id: string
  title: string
  handle: string
}

// ─── API helpers ─────────────────────────────────────────────────────────────

const BASE = "/admin"
const DEFAULT_LOCALE = "default"
const CONTENT_LOCALES = [DEFAULT_LOCALE, "zh-CN", "en-US"]

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

// ─── CourseForm ───────────────────────────────────────────────────────────────

type CourseFormData = {
  id: string
  handle: string
  title: string
  description: string
  thumbnail_url: string
  level: string
  status: string
  product_id: string
}

const emptyForm = (): CourseFormData => ({
  id: "",
  handle: "",
  title: "",
  description: "",
  thumbnail_url: "",
  level: "beginner",
  status: "published",
  product_id: "",
})

type CourseFormProps = {
  initial?: CourseFormData
  products: Product[]
  loading: boolean
  isEdit: boolean
  onSubmit: (data: CourseFormData) => Promise<void>
  onClose: () => void
}

const CourseForm = ({ initial, products, loading, isEdit, onSubmit, onClose }: CourseFormProps) => {
  const { t } = useTranslation()
  const [form, setForm] = useState<CourseFormData>(initial ?? emptyForm())
  const [saving, setSaving] = useState(false)

  const set = (k: keyof CourseFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.handle) {
      toast.error(t("courseEditor.form.titleHandleRequired"))
      return
    }
    setSaving(true)
    try {
      await onSubmit(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
      {!isEdit && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="course-id">{t("courseEditor.form.idLabel")}</Label>
          <Input
            id="course-id"
            placeholder={t("courseEditor.form.idPlaceholder")}
            value={form.id}
            onChange={(e) => set("id", e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <Label htmlFor="course-title">
          {t("common.title")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="course-title"
          placeholder={t("courseEditor.form.titlePlaceholder")}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="course-handle">
          {t("common.handle")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="course-handle"
          placeholder={t("courseEditor.form.handlePlaceholder")}
          value={form.handle}
          onChange={(e) => set("handle", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="course-desc">{t("common.description")}</Label>
        <Textarea
          id="course-desc"
          placeholder={t("courseEditor.form.descPlaceholder")}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="course-thumbnail">{t("courseEditor.form.thumbnailLabel")}</Label>
        <Input
          id="course-thumbnail"
          placeholder={t("courseEditor.form.thumbnailPlaceholder")}
          value={form.thumbnail_url}
          onChange={(e) => set("thumbnail_url", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="course-level">{t("courseEditor.form.levelLabel")}</Label>
        <Select value={form.level} onValueChange={(v) => set("level", v)}>
          <Select.Trigger id="course-level">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="beginner">{t("courseEditor.level.beginner")}</Select.Item>
            <Select.Item value="intermediate">{t("courseEditor.level.intermediate")}</Select.Item>
            <Select.Item value="advanced">{t("courseEditor.level.advanced")}</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="course-status">{t("courseEditor.form.statusLabel")}</Label>
        <Select value={form.status} onValueChange={(v) => set("status", v)}>
          <Select.Trigger id="course-status">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="published">{t("common.published")}</Select.Item>
            <Select.Item value="draft">{t("common.draft")}</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="course-product">{t("courseEditor.form.productLabel")}</Label>
        <Select
          value={form.product_id || "__none__"}
          onValueChange={(v) => set("product_id", v === "__none__" ? "" : v)}
        >
          <Select.Trigger id="course-product">
            <Select.Value placeholder={t("courseEditor.form.productPlaceholder")} />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="__none__">{t("courseEditor.form.noProduct")}</Select.Item>
            {products.map((p) => (
              <Select.Item key={p.id} value={p.id}>
                {p.title} ({p.handle})
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Text size="small" className="text-ui-fg-muted">
          {t("courseEditor.form.productHint")}
        </Text>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={saving || loading}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" isLoading={saving || loading}>
          {isEdit ? t("courseEditor.saveChanges") : t("courseEditor.createCourse")}
        </Button>
      </div>
    </form>
  )
}

// ─── CoursesPage ─────────────────────────────────────────────────────────────

const CoursesPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedLocale, setSelectedLocale] = useState(DEFAULT_LOCALE)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Course | null>(null)
  const prompt = usePrompt()

  // Only load courses, not products on init
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const suffix = selectedLocale === DEFAULT_LOCALE ? "" : `?locale=${encodeURIComponent(selectedLocale)}`
      const data = await apiFetch<{ courses: Course[] }>(`/courses${suffix}`)
      setCourses(data.courses)
    } catch (e: any) {
      toast.error(e.message ?? t("courseEditor.toast.loadFailed"))
    } finally {
      setLoading(false)
    }
  }, [selectedLocale])

  // Lazy-load products: only called once when Drawer opens
  const ensureProducts = useCallback(async () => {
    if (productsLoaded) return
    try {
      const data = await apiFetch<{ products: Product[] }>("/products?limit=200")
      setProducts(data.products ?? [])
      setProductsLoaded(true)
    } catch {
      // Product list load failure doesn't block main flow
    }
  }, [productsLoaded])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Load products only when create Drawer opens
  const openCreateDrawer = useCallback(() => {
    setEditTarget(null)
    setDrawerOpen(true)
    ensureProducts()
  }, [ensureProducts])

  // Load products only when edit Drawer opens
  const openEditDrawer = useCallback((course: Course) => {
    setEditTarget(course)
    setDrawerOpen(false)
    ensureProducts()
  }, [ensureProducts])

  const handleCreate = async (form: CourseFormData) => {
    const body: Record<string, unknown> = {
      handle: form.handle,
      title: form.title,
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      level: form.level || null,
      status: form.status,
      product_id: form.product_id || null,
      translations:
        selectedLocale === DEFAULT_LOCALE
          ? undefined
          : {
              [selectedLocale]: {
                title: form.title,
                description: form.description || null,
              },
            },
    }
    if (form.id) body.id = form.id

    await apiFetch("/courses", {
      method: "POST",
      body: JSON.stringify(body),
    })
    toast.success(t("courseEditor.toast.created"))
    setDrawerOpen(false)
    fetchCourses()
  }

  const handleEdit = async (form: CourseFormData) => {
    if (!editTarget) return
    await apiFetch(`/courses/${editTarget.id}`, {
      method: "PUT",
      body: JSON.stringify({
        handle: form.handle,
        title: form.title,
        description: form.description || null,
        thumbnail_url: form.thumbnail_url || null,
        level: form.level || null,
        status: form.status,
        product_id: form.product_id || null,
        translations:
          selectedLocale === DEFAULT_LOCALE
            ? undefined
            : {
                [selectedLocale]: {
                  title: form.title,
                  description: form.description || null,
                },
              },
      }),
    })
    toast.success(t("courseEditor.toast.updated"))
    setEditTarget(null)
    fetchCourses()
  }

  const handleDelete = async (course: Course) => {
    const confirmed = await prompt({
      title: t("courseEditor.toast.confirmDeleteTitle"),
      description: t("courseEditor.toast.confirmDeleteDesc", { title: course.title }),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    })
    if (!confirmed) return
    try {
      await apiFetch(`/courses/${course.id}`, { method: "DELETE" })
      toast.success(t("courseEditor.toast.deleted"))
      fetchCourses()
    } catch (e: any) {
      toast.error(e.message ?? t("courseEditor.toast.deleteFailed"))
    }
  }

  const levelLabel: Record<string, string> = {
    beginner: t("courseEditor.level.beginner"),
    intermediate: t("courseEditor.level.intermediate"),
    advanced: t("courseEditor.level.advanced"),
  }

  return (
    <Container className="p-0">
      {/* 页面头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <Heading level="h1">{t("courseEditor.title")}</Heading>
        <div className="flex items-center gap-3">
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
          <Button
            size="small"
            onClick={openCreateDrawer}
          >
            {t("courseEditor.create")}
          </Button>
        </div>
      </div>

      {/* 课程列表 */}
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t("common.title")}</Table.HeaderCell>
            <Table.HeaderCell>{t("common.handle")}</Table.HeaderCell>
            <Table.HeaderCell>{t("courseEditor.form.levelLabel")}</Table.HeaderCell>
            <Table.HeaderCell>{t("courseEditor.lessonsCount")}</Table.HeaderCell>
            <Table.HeaderCell>{t("common.status")}</Table.HeaderCell>
            <Table.HeaderCell>{t("courseEditor.linkedProduct")}</Table.HeaderCell>
            <Table.HeaderCell>{t("common.actions")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Row>
              <td colSpan={7} className="px-4 py-6 text-center text-ui-fg-muted text-sm">
                加载中…
              </td>
            </Table.Row>
          ) : courses.length === 0 ? (
            <Table.Row>
              <td colSpan={7} className="px-4 py-6 text-center text-ui-fg-muted text-sm">
                {t("courseEditor.empty")}
              </td>
            </Table.Row>
          ) : (
            courses.map((course) => (
              <Table.Row
                key={course.id}
                className="cursor-pointer"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <Table.Cell>
                  <Text size="small" weight="plus" className="text-ui-fg-interactive">
                    {course.title}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small" className="font-mono text-ui-fg-muted">
                    {course.handle}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {course.level ? (
                    <Badge size="2xsmall" color="blue">
                      {levelLabel[course.level] ?? course.level}
                    </Badge>
                  ) : (
                    <Text size="small" className="text-ui-fg-muted">—</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">{course.lessons_count}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    size="2xsmall"
                    color={course.status === "published" ? "green" : "grey"}
                  >
                    {course.status === "published" ? t("common.published") : t("common.draft")}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text size="small" className="font-mono text-ui-fg-muted">
                    {course.product_id ?? "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => openEditDrawer(course)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => handleDelete(course)}
                    >
                      {t("common.delete")}
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>

      {/* 新建课程 Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t("courseEditor.createCourse")}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <CourseForm
              products={products}
              loading={loading}
              isEdit={false}
              onSubmit={handleCreate}
              onClose={() => setDrawerOpen(false)}
            />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>

      {/* 编辑课程 Drawer */}
      <Drawer
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t("courseEditor.edit")}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            {editTarget && (
              <CourseForm
                initial={{
                  id: editTarget.id,
                  handle: editTarget.handle,
                  title: editTarget.title,
                  description: editTarget.description ?? "",
                  thumbnail_url: editTarget.thumbnail_url ?? "",
                  level: editTarget.level ?? "beginner",
                  status: editTarget.status,
                  product_id: editTarget.product_id ?? "",
                }}
                products={products}
                loading={loading}
                isEdit={true}
                onSubmit={handleEdit}
                onClose={() => setEditTarget(null)}
              />
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "课程管理",
  icon: BookOpen,
})

export default CoursesPage
