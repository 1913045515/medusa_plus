import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
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
  Drawer,
  Input,
  Label,
  Select,
  Textarea,
  Switch,
} from "@medusajs/ui"
import { ArrowLeft, PencilSquare } from "@medusajs/icons"

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

type Lesson = {
  id: string
  course_id: string
  title: string
  description: string | null
  episode_number: number
  duration: number
  is_free: boolean
  thumbnail_url: string | null
  video_url: string | null
  status: string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

type Product = {
  id: string
  title: string
  handle: string
}

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

type LessonFormData = {
  title: string
  description: string
  episode_number: string
  duration: string
  is_free: boolean
  thumbnail_url: string
  video_url: string
  status: string
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

// ─── LessonForm ──────────────────────────────────────────────────────────────

const emptyLessonForm = (): LessonFormData => ({
  title: "",
  description: "",
  episode_number: "1",
  duration: "0",
  is_free: false,
  thumbnail_url: "",
  video_url: "",
  status: "published",
})

type LessonFormProps = {
  initial?: LessonFormData
  isEdit: boolean
  onSubmit: (data: LessonFormData) => Promise<void>
  onClose: () => void
}

const LessonForm = ({ initial, isEdit, onSubmit, onClose }: LessonFormProps) => {
  const { t } = useTranslation()
  const [form, setForm] = useState<LessonFormData>(initial ?? emptyLessonForm())
  const [saving, setSaving] = useState(false)

  const set = (k: keyof LessonFormData, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) {
      toast.error(t("lessonEditor.titleRequired"))
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
      <div className="flex flex-col gap-1">
        <Label htmlFor="lesson-title">
          {t("common.title")} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="lesson-title"
          placeholder={t("lessonEditor.title")}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="lesson-desc">{t("common.description")}</Label>
        <Textarea
          id="lesson-desc"
          placeholder={t("lessonEditor.descPlaceholder")}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <Label htmlFor="lesson-episode">{t("lessonEditor.episode")}</Label>
          <Input
            id="lesson-episode"
            type="number"
            min={1}
            value={form.episode_number}
            onChange={(e) => set("episode_number", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <Label htmlFor="lesson-duration">{t("lessonEditor.duration")}</Label>
          <Input
            id="lesson-duration"
            type="number"
            min={0}
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="lesson-video">{t("lessonEditor.videoUrl")}</Label>
        <Input
          id="lesson-video"
          placeholder="https://..."
          value={form.video_url}
          onChange={(e) => set("video_url", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="lesson-thumbnail">{t("lessonEditor.thumbnailUrl")}</Label>
        <Input
          id="lesson-thumbnail"
          placeholder="https://..."
          value={form.thumbnail_url}
          onChange={(e) => set("thumbnail_url", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="lesson-status">{t("common.status")}</Label>
        <Select value={form.status} onValueChange={(v) => set("status", v)}>
          <Select.Trigger id="lesson-status">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="published">{t("common.published")}</Select.Item>
            <Select.Item value="draft">{t("common.draft")}</Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-ui-border-base px-4 py-3">
        <div>
          <Text weight="plus">{t("lessonEditor.freePreview")}</Text>
          <Text size="small" className="text-ui-fg-muted">
            {t("lessonEditor.freePreviewHint")}
          </Text>
        </div>
        <Switch
          id="lesson-free"
          checked={form.is_free}
          onCheckedChange={(v) => set("is_free", v)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" isLoading={saving}>
          {isEdit ? t("lessonEditor.saveChanges") : t("lessonEditor.create")}
        </Button>
      </div>
    </form>
  )
}

// ─── CourseDetailPage ─────────────────────────────────────────────────────────

const CourseDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedLocale, setSelectedLocale] = useState(DEFAULT_LOCALE)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [loadingCourse, setLoadingCourse] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(true)

  // Lesson Drawer state
  const [lessonDrawerOpen, setLessonDrawerOpen] = useState(false)
  const [editLesson, setEditLesson] = useState<Lesson | null>(null)

  // Course edit Drawer state
  const [courseDrawerOpen, setCourseDrawerOpen] = useState(false)

  const prompt = usePrompt()

  // ── Data loading ──────────────────────────────────────────────────────────────

  const fetchCourse = useCallback(async () => {
    if (!id) return
    setLoadingCourse(true)
    try {
      const suffix = selectedLocale === DEFAULT_LOCALE ? "" : `?locale=${encodeURIComponent(selectedLocale)}`
      const data = await apiFetch<{ course: Course }>(`/courses/${id}${suffix}`)
      setCourse(data.course)
    } catch (e: any) {
      toast.error(e.message ?? t("courseEditor.toast.loadFailed"))
    } finally {
      setLoadingCourse(false)
    }
  }, [id, selectedLocale])

  const fetchLessons = useCallback(async () => {
    if (!id) return
    setLoadingLessons(true)
    try {
      const suffix = selectedLocale === DEFAULT_LOCALE ? "" : `?locale=${encodeURIComponent(selectedLocale)}`
      const data = await apiFetch<{ lessons: Lesson[] }>(`/courses/${id}/lessons${suffix}`)
      const sorted = [...(data.lessons ?? [])].sort(
        (a, b) => a.episode_number - b.episode_number
      )
      setLessons(sorted)
    } catch (e: any) {
      toast.error(e.message ?? t("lessonEditor.toast.loadFailed"))
    } finally {
      setLoadingLessons(false)
    }
  }, [id, selectedLocale])

  // Lazy-load products: only when edit course Drawer opens
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
    fetchCourse()
    fetchLessons()
  }, [fetchCourse, fetchLessons])

  // Load products only when edit course Drawer opens
  const openCourseEditDrawer = useCallback(() => {
    setCourseDrawerOpen(true)
    ensureProducts()
  }, [ensureProducts])

  // ── Course editing ──────────────────────────────────────────────────────────────

  const handleUpdateCourse = async (form: CourseFormData) => {
    if (!course) return
    await apiFetch(`/courses/${course.id}`, {
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
    setCourseDrawerOpen(false)
    fetchCourse()
  }

  // ── Lesson operations ───────────────────────────────────────────────────────────

  const handleCreateLesson = async (form: LessonFormData) => {
    if (!id) return
    await apiFetch(`/courses/${id}/lessons`, {
      method: "POST",
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        episode_number: parseInt(form.episode_number, 10) || 1,
        duration: parseInt(form.duration, 10) || 0,
        is_free: form.is_free,
        thumbnail_url: form.thumbnail_url || null,
        video_url: form.video_url || null,
        status: form.status,
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
    toast.success(t("lessonEditor.toast.created"))
    setLessonDrawerOpen(false)
    fetchLessons()
    fetchCourse() // 刷新 lessons_count
  }

  const handleUpdateLesson = async (form: LessonFormData) => {
    if (!editLesson) return
    await apiFetch(`/lessons/${editLesson.id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        episode_number: parseInt(form.episode_number, 10) || 1,
        duration: parseInt(form.duration, 10) || 0,
        is_free: form.is_free,
        thumbnail_url: form.thumbnail_url || null,
        video_url: form.video_url || null,
        status: form.status,
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
    toast.success(t("lessonEditor.toast.updated"))
    setEditLesson(null)
    fetchLessons()
  }

  const handleDeleteLesson = async (lesson: Lesson) => {
    const confirmed = await prompt({
      title: t("lessonEditor.toast.confirmDeleteTitle"),
      description: t("lessonEditor.toast.confirmDeleteDesc", { title: lesson.title }),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    })
    if (!confirmed) return
    try {
      await apiFetch(`/lessons/${lesson.id}`, { method: "DELETE" })
      toast.success(t("lessonEditor.toast.deleted"))
      fetchLessons()
      fetchCourse() // 刷新 lessons_count
    } catch (e: any) {
      toast.error(e.message ?? t("lessonEditor.toast.deleteFailed"))
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  const formatDuration = (seconds: number) => {
    if (!seconds) return "—"
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
  }

  const levelLabel: Record<string, string> = {
    beginner: t("courseEditor.level.beginner"),
    intermediate: t("courseEditor.level.intermediate"),
    advanced: t("courseEditor.level.advanced"),
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loadingCourse) {
    return (
      <Container>
        <Text className="text-ui-fg-muted">{t("common.loading")}</Text>
      </Container>
    )
  }

  if (!course) {
    return (
      <Container>
        <Text className="text-ui-fg-muted">{t("courseDetail.notFound")}</Text>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 返回 + 课程基本信息 */}
      <Container className="p-0">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-ui-border-base">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-1 text-ui-fg-muted hover:text-ui-fg-base transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <Text size="small">{t("courseDetail.backToList")}</Text>
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4 items-start">
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-20 h-20 rounded-lg object-cover border border-ui-border-base flex-shrink-0"
                />
              )}
              <div className="flex flex-col gap-1">
                <Heading level="h1">{course.title}</Heading>
                <Text size="small" className="font-mono text-ui-fg-muted">
                  {course.handle}
                </Text>
                {course.description && (
                  <Text size="small" className="text-ui-fg-subtle mt-1 max-w-xl">
                    {course.description}
                  </Text>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    size="2xsmall"
                    color={course.status === "published" ? "green" : "grey"}
                  >
                    {course.status === "published" ? t("common.published") : t("common.draft")}
                  </Badge>
                  {course.level && (
                    <Badge size="2xsmall" color="blue">
                      {levelLabel[course.level] ?? course.level}
                    </Badge>
                  )}
                  <Badge size="2xsmall" color="purple">
                    {t("courseDetail.lessonsUnit", { count: course.lessons_count })}
                  </Badge>
                  {course.product_id && (
                    <Badge size="2xsmall" color="orange">
                      {t("courseDetail.productLabel", { id: course.product_id })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
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
                variant="secondary"
                onClick={openCourseEditDrawer}
              >
                <PencilSquare className="w-4 h-4 mr-1" />
                {t("courseEditor.edit")}
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Lesson 列表 */}
      <Container className="p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
          <Heading level="h2">{t("lessonEditor.list")}</Heading>
          <Button
            size="small"
            onClick={() => {
              setEditLesson(null)
              setLessonDrawerOpen(true)
            }}
          >
            {t("lessonEditor.createBtn")}
          </Button>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t("lessonEditor.episode")}</Table.HeaderCell>
              <Table.HeaderCell>{t("common.title")}</Table.HeaderCell>
              <Table.HeaderCell>{t("lessonEditor.duration")}</Table.HeaderCell>
              <Table.HeaderCell>{t("lessonEditor.freePreview")}</Table.HeaderCell>
              <Table.HeaderCell>{t("common.status")}</Table.HeaderCell>
              <Table.HeaderCell>{t("lessonEditor.videoUrl")}</Table.HeaderCell>
              <Table.HeaderCell>{t("common.actions")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loadingLessons ? (
              <Table.Row>
                <td colSpan={7} className="px-4 py-6 text-center text-ui-fg-muted text-sm">
                  加载中…
                </td>
              </Table.Row>
            ) : lessons.length === 0 ? (
              <Table.Row>
                <td colSpan={7} className="px-4 py-6 text-center text-ui-fg-muted text-sm">
                  {t("lessonEditor.empty")}
                </td>
              </Table.Row>
            ) : (
              lessons.map((lesson) => (
                <Table.Row key={lesson.id}>
                  <Table.Cell>
                    <Text size="small" className="font-mono">
                      E{lesson.episode_number}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" weight="plus">
                      {lesson.title}
                    </Text>
                    {lesson.description && (
                      <Text
                        size="xsmall"
                        className="text-ui-fg-muted truncate max-w-xs"
                      >
                        {lesson.description}
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{formatDuration(lesson.duration)}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="2xsmall"
                      color={lesson.is_free ? "green" : "grey"}
                    >
                      {lesson.is_free ? t("lessonEditor.free") : t("lessonEditor.paid")}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="2xsmall"
                      color={lesson.status === "published" ? "green" : "grey"}
                    >
                      {lesson.status === "published" ? t("common.published") : t("common.draft")}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {lesson.video_url ? (
                      <a
                        href={lesson.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ui-fg-interactive text-xs hover:underline truncate max-w-[120px] block"
                      >
                        {t("lessonEditor.viewVideo")}
                      </a>
                    ) : (
                      <Text size="small" className="text-ui-fg-muted">—</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          setEditLesson(lesson)
                          setLessonDrawerOpen(false)
                        }}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => handleDeleteLesson(lesson)}
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
      </Container>

      {/* 新建 Lesson Drawer */}
      <Drawer open={lessonDrawerOpen} onOpenChange={setLessonDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t("lessonEditor.create")}</Drawer.Title>
            <Drawer.Description>
              {t("lessonEditor.addForCourse", { title: course.title })}
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <LessonForm
              isEdit={false}
              onSubmit={handleCreateLesson}
              onClose={() => setLessonDrawerOpen(false)}
            />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>

      {/* 编辑 Lesson Drawer */}
      <Drawer
        open={!!editLesson}
        onOpenChange={(open) => { if (!open) setEditLesson(null) }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t("lessonEditor.edit")}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            {editLesson && (
              <LessonForm
                initial={{
                  title: editLesson.title,
                  description: editLesson.description ?? "",
                  episode_number: String(editLesson.episode_number),
                  duration: String(editLesson.duration),
                  is_free: editLesson.is_free,
                  thumbnail_url: editLesson.thumbnail_url ?? "",
                  video_url: editLesson.video_url ?? "",
                  status: editLesson.status,
                }}
                isEdit={true}
                onSubmit={handleUpdateLesson}
                onClose={() => setEditLesson(null)}
              />
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>

      {/* 编辑课程 Drawer */}
      <Drawer open={courseDrawerOpen} onOpenChange={setCourseDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{t("courseEditor.edit")}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <CourseEditForm
              course={course}
              products={products}
              onSubmit={handleUpdateCourse}
              onClose={() => setCourseDrawerOpen(false)}
            />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

// ─── CourseEditForm (inline, reuse logic) ──────────────────────────────────

type CourseEditFormProps = {
  course: Course
  products: Product[]
  onSubmit: (data: CourseFormData) => Promise<void>
  onClose: () => void
}

const CourseEditForm = ({ course, products, onSubmit, onClose }: CourseEditFormProps) => {
  const { t } = useTranslation()
  const [form, setForm] = useState<CourseFormData>({
    id: course.id,
    handle: course.handle,
    title: course.title,
    description: course.description ?? "",
    thumbnail_url: course.thumbnail_url ?? "",
    level: course.level ?? "beginner",
    status: course.status,
    product_id: course.product_id ?? "",
  })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof CourseFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <Label htmlFor="ce-title">{t("common.title")} <span className="text-red-500">*</span></Label>
        <Input id="ce-title" value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ce-handle">{t("common.handle")} <span className="text-red-500">*</span></Label>
        <Input id="ce-handle" value={form.handle} onChange={(e) => set("handle", e.target.value)} required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ce-desc">{t("common.description")}</Label>
        <Textarea id="ce-desc" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ce-thumb">{t("courseEditor.form.thumbnailLabel")}</Label>
        <Input id="ce-thumb" value={form.thumbnail_url} onChange={(e) => set("thumbnail_url", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ce-level">{t("courseEditor.form.levelLabel")}</Label>
        <Select value={form.level} onValueChange={(v) => set("level", v)}>
          <Select.Trigger id="ce-level"><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="beginner">{t("courseEditor.level.beginner")}</Select.Item>
            <Select.Item value="intermediate">{t("courseEditor.level.intermediate")}</Select.Item>
            <Select.Item value="advanced">{t("courseEditor.level.advanced")}</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ce-status">{t("courseEditor.form.statusLabel")}</Label>
        <Select value={form.status} onValueChange={(v) => set("status", v)}>
          <Select.Trigger id="ce-status"><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="published">{t("common.published")}</Select.Item>
            <Select.Item value="draft">{t("common.draft")}</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ce-product">{t("courseEditor.form.productLabel")}</Label>
        <Select
          value={form.product_id || "__none__"}
          onValueChange={(v) => set("product_id", v === "__none__" ? "" : v)}
        >
          <Select.Trigger id="ce-product"><Select.Value placeholder={t("courseEditor.form.productPlaceholder")} /></Select.Trigger>
          <Select.Content>
            <Select.Item value="__none__">{t("courseEditor.form.noProduct")}</Select.Item>
            {products.map((p) => (
              <Select.Item key={p.id} value={p.id}>{p.title} ({p.handle})</Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Text size="small" className="text-ui-fg-muted">
          {t("courseEditor.form.productHint")}
        </Text>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>{t("common.cancel")}</Button>
        <Button type="submit" isLoading={saving}>{t("courseEditor.saveChanges")}</Button>
      </div>
    </form>
  )
}

export default CourseDetailPage
