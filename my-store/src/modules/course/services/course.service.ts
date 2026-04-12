import type { ICourseRepository } from "../repositories/course.repository"
import type {
  CourseRecord,
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesFilters,
  LocalizedCourseRecord,
  StoreCourseRecord,
  StoredS3MediaAsset,
  SignedMediaAsset,
} from "../types"
import type { CourseMediaService } from "./media-asset.service"

// ─── CourseService ────────────────────────────────────────────────────────────
// SSOT: product.metadata.virtual_course_id 是产品与课程关联的唯一数据源。
// course 表不再存储 product_id，不再做任何双向同步。

export class CourseService {
  constructor(
    private readonly courseRepo: ICourseRepository,
    private readonly mediaService?: Pick<CourseMediaService, "isConfigured" | "sign">
  ) {}

  private resolveLocaleText(record: CourseRecord, locale?: string | null): LocalizedCourseRecord {
    const normalizedLocale = locale?.trim() || null
    const localized = normalizedLocale ? record.translations?.[normalizedLocale] : null

    return {
      ...record,
      title: localized?.title?.trim() || record.title,
      description:
        localized?.description !== undefined && localized?.description !== null
          ? localized.description
          : record.description,
      locale: normalizedLocale,
    }
  }

  async listCourses(filters?: ListCoursesFilters, locale?: string | null): Promise<LocalizedCourseRecord[]> {
    const items = await this.courseRepo.findAll(filters)
    return items.map((item) => this.resolveLocaleText(item, locale))
  }

  async getCourse(id: string, locale?: string | null): Promise<LocalizedCourseRecord | null> {
    const item = await this.courseRepo.findById(id)
    return item ? this.resolveLocaleText(item, locale) : null
  }

  async getCourseByHandle(handle: string, locale?: string | null): Promise<LocalizedCourseRecord | null> {
    const item = await this.courseRepo.findByHandle(handle)
    return item ? this.resolveLocaleText(item, locale) : null
  }

  private async signMediaAsset(asset: StoredS3MediaAsset | null): Promise<SignedMediaAsset | null> {
    if (!asset || !this.mediaService?.isConfigured()) {
      return null
    }

    return await this.mediaService.sign(asset)
  }

  async serializeStoreCourse(course: LocalizedCourseRecord): Promise<StoreCourseRecord> {
    const signedThumbnail = await this.signMediaAsset(course.thumbnail_asset)
    const { thumbnail_asset: _thumbnailAsset, ...rest } = course

    return {
      ...rest,
      thumbnail_url: course.thumbnail_asset
        ? signedThumbnail?.url ?? null
        : course.thumbnail_url,
      thumbnail_url_expires_at: signedThumbnail?.expires_at ?? null,
    }
  }

  async serializeStoreCourses(courses: LocalizedCourseRecord[]): Promise<StoreCourseRecord[]> {
    return await Promise.all(courses.map((course) => this.serializeStoreCourse(course)))
  }

  async createCourse(input: CreateCourseInput): Promise<CourseRecord> {
    return this.courseRepo.create(input)
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<CourseRecord> {
    const existing = await this.courseRepo.findById(id)
    if (!existing) throw new Error(`Course ${id} not found`)

    const updated = await this.courseRepo.update(id, input)
    if (!updated) throw new Error(`Course ${id} not found`)

    return updated
  }

  async deleteCourse(id: string): Promise<void> {
    const deleted = await this.courseRepo.delete(id)
    if (!deleted) throw new Error(`Course ${id} not found`)
  }
}
