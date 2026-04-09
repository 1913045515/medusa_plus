// ─── Course ───────────────────────────────────────────────────────────────────

export type CourseRecord = {
  id: string
  /** 一对一关联的 Medusa Product ID */
  product_id: string | null
  handle: string
  title: string
  description: string | null
  translations: LocalizedTextMap | null
  thumbnail_url: string | null
  thumbnail_asset: StoredS3MediaAsset | null
  level: string | null
  lessons_count: number
  status: string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// 允许创建时指定 id（例如 course_demo_1），否则由后端生成
export type CreateCourseInput = Omit<
  CourseRecord,
  "id" | "created_at" | "updated_at"
> & {
  id?: string
}
export type UpdateCourseInput = Partial<Omit<CourseRecord, "id" | "created_at" | "updated_at">>

export type ListCoursesFilters = {
  status?: string
  handle?: string
}

export type LocalizedText = {
  title?: string | null
  description?: string | null
}

export type LocalizedTextMap = Record<string, LocalizedText>

export type LocalizedCourseRecord = CourseRecord & {
  locale: string | null
}

export type StoreCourseRecord = Omit<LocalizedCourseRecord, "thumbnail_asset"> & {
  thumbnail_url_expires_at: string | null
}

export type CourseMediaField =
  | "course_thumbnail"
  | "lesson_thumbnail"
  | "lesson_video"

export type StoredS3MediaAsset = {
  provider: "s3"
  bucket: string
  key: string
  permanent_url: string
  original_name: string
  extension: string | null
  mime_type: string
  size_bytes: number
  uploaded_at: string
}

export type SignedMediaAsset = {
  url: string
  expires_at: string
  expires_in_seconds: number
}

export type CourseMediaUploadTarget = {
  entity_type: "course" | "lesson"
  entity_id: string
  field: CourseMediaField
}

// ─── Course Purchase ─────────────────────────────────────────────────────────

export type CoursePurchaseRecord = {
  id: string
  customer_id: string
  course_id: string
  order_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type CreateCoursePurchaseInput = Omit<
  CoursePurchaseRecord,
  "id" | "created_at" | "updated_at"
>

// ─── Homepage Content ────────────────────────────────────────────────────────

export type HomepageCta = {
  label: string
  href: string
}

export type HomepageHero = {
  eyebrow: string | null
  title: string
  subtitle: string | null
  description: string | null
  background_image_url: string | null
  primary_cta: HomepageCta
  secondary_cta: HomepageCta | null
}

export type HomepageHighlightItem = {
  id: string
  title: string
  description: string
  icon: string | null
}

export type HomepageFeaturedCourseItem = {
  id: string
  title: string
  description: string
  image_url: string | null
  href: string
  badge: string | null
}

export type HomepageRenderMode = "structured" | "static_html"

export type HomepageStructuredContentPayload = {
  render_mode: "structured"
  hero: HomepageHero
  highlights: HomepageHighlightItem[]
  featured_courses: HomepageFeaturedCourseItem[]
}

export type HomepageStaticTemplatePayload = {
  render_mode: "static_html"
  template: {
    html: string
    css: string
  }
}

export type HomepageContentPayload =
  | HomepageStructuredContentPayload
  | HomepageStaticTemplatePayload

export type HomepageContentRecord = {
  id: string
  title: string
  handle: string
  site_key: string
  status: string
  is_active: boolean
  published_at: string | null
  content: HomepageContentPayload
  translations: Record<string, HomepageContentPayload> | null
  metadata: Record<string, unknown> | null
  created_at: string | null
  updated_at: string | null
}

export type CreateHomepageContentInput = {
  title: string
  handle: string
  site_key?: string
  status?: "draft" | "published"
  is_active?: boolean
  content?: HomepageContentPayload
  translations?: Record<string, HomepageContentPayload> | null
  metadata?: Record<string, unknown> | null
}

export type UpsertHomepageContentInput = {
  id?: string
  title?: string
  handle?: string
  site_key?: string
  status?: string
  is_active?: boolean
  content: HomepageContentPayload
  translations?: Record<string, HomepageContentPayload> | null
  metadata?: Record<string, unknown> | null
}

// ─── Lesson ───────────────────────────────────────────────────────────────────

export type LessonRecord = {
  id: string
  course_id: string
  title: string
  description: string | null
  translations: LocalizedTextMap | null
  episode_number: number
  duration: number
  is_free: boolean
  thumbnail_url: string | null
  thumbnail_asset: StoredS3MediaAsset | null
  video_url: string | null
  video_asset: StoredS3MediaAsset | null
  status: string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type CreateLessonInput = Omit<LessonRecord, "id" | "created_at" | "updated_at">
export type UpdateLessonInput = Partial<CreateLessonInput>

export type ListLessonsFilters = {
  course_id?: string
  status?: string
  is_free?: boolean
}

// ─── Play ─────────────────────────────────────────────────────────────────────

export type PlayResponse =
  | {
      video_url: string
      video_url_expires_at?: string
      video_url_expires_in_seconds?: number
    }
  | { error: string; code: 401 | 403 }

export type LocalizedLessonRecord = LessonRecord & {
  locale: string | null
}

export type StoreLessonRecord = Omit<LocalizedLessonRecord, "thumbnail_asset" | "video_asset"> & {
  thumbnail_url_expires_at: string | null
  video_url: null
}
