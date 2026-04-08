import type { ILessonRepository } from "../repositories/lesson.repository"
import type {
  LessonRecord,
  CreateLessonInput,
  UpdateLessonInput,
  ListLessonsFilters,
  LocalizedLessonRecord,
  StoreLessonRecord,
  StoredS3MediaAsset,
  SignedMediaAsset,
} from "../types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { CourseMediaService } from "./media-asset.service"

// ─── LessonService ────────────────────────────────────────────────────────────
// 依赖 ILessonRepository 接口，不关心底层是静态 JSON 还是 ORM。
// 切换数据库时：构造函数注入不同的 Repository 实现即可。

export class LessonService {
  constructor(
    private readonly lessonRepo: ILessonRepository,
    private readonly mediaService?: Pick<CourseMediaService, "isConfigured" | "sign">
  ) {}

  private resolveLocaleText(record: LessonRecord, locale?: string | null): LocalizedLessonRecord {
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

  async listLessons(filters?: ListLessonsFilters, locale?: string | null): Promise<LocalizedLessonRecord[]> {
    const items = await this.lessonRepo.findAll(filters)
    return items.map((item) => this.resolveLocaleText(item, locale))
  }

  async getLessonsByCourse(courseId: string, locale?: string | null): Promise<LocalizedLessonRecord[]> {
    const items = await this.lessonRepo.findByCourseId(courseId)
    return items.map((item) => this.resolveLocaleText(item, locale))
  }

  async getLesson(id: string, locale?: string | null): Promise<LocalizedLessonRecord | null> {
    const item = await this.lessonRepo.findById(id)
    return item ? this.resolveLocaleText(item, locale) : null
  }

  private async signMediaAsset(asset: StoredS3MediaAsset | null): Promise<SignedMediaAsset | null> {
    if (!asset || !this.mediaService?.isConfigured()) {
      return null
    }

    return await this.mediaService.sign(asset)
  }

  async serializeStoreLesson(lesson: LocalizedLessonRecord): Promise<StoreLessonRecord> {
    const signedThumbnail = await this.signMediaAsset(lesson.thumbnail_asset)
    const { thumbnail_asset: _thumbnailAsset, video_asset: _videoAsset, ...rest } = lesson

    return {
      ...rest,
      thumbnail_url: lesson.thumbnail_asset
        ? signedThumbnail?.url ?? null
        : lesson.thumbnail_url,
      thumbnail_url_expires_at: signedThumbnail?.expires_at ?? null,
      video_url: null,
    }
  }

  async serializeStoreLessons(lessons: LocalizedLessonRecord[]): Promise<StoreLessonRecord[]> {
    return await Promise.all(lessons.map((lesson) => this.serializeStoreLesson(lesson)))
  }

  async createLesson(input: CreateLessonInput): Promise<LessonRecord> {
    const created = await this.lessonRepo.create(input)
    await this.recalcCourseLessonsCount(created.course_id)
    return created
  }

  async updateLesson(
    id: string,
    input: UpdateLessonInput
  ): Promise<LessonRecord> {
    const updated = await this.lessonRepo.update(id, input)
    if (!updated) throw new Error(`Lesson ${id} not found`)
    return updated
  }

  async deleteLesson(id: string): Promise<void> {
    const lesson = await this.lessonRepo.findById(id)
    const deleted = await this.lessonRepo.delete(id)
    if (!deleted) throw new Error(`Lesson ${id} not found`)

    if (lesson?.course_id) {
      await this.recalcCourseLessonsCount(lesson.course_id)
    }
  }

  // ─── 播放鉴权逻辑 ─────────────────────────────────────────────────────────
  // 切换数据库时此方法不需要变动，只需 orderRepo 实现正确的 hasPurchased 查询。

  async resolvePlayUrl(
    lessonId: string,
    customerId: string | null,
    hasPurchasedFn: (customerId: string, courseId: string) => Promise<boolean>
  ): Promise<
    | {
        ok: true
        video_url: string
        video_url_expires_at?: string
        video_url_expires_in_seconds?: number
      }
    | { ok: false; code: 401 | 403; message: string }
  > {
    const lesson = await this.lessonRepo.findById(lessonId)

    if (!lesson) {
      return { ok: false, code: 403, message: "Lesson not found" }
    }

    if (lesson.is_free) {
      const signedVideo = await this.signMediaAsset(lesson.video_asset)

      if (lesson.video_asset && !signedVideo) {
        return { ok: false, code: 403, message: "视频授权暂不可用，请稍后重试" }
      }

      return {
        ok: true,
        video_url: signedVideo?.url ?? lesson.video_url ?? "",
        video_url_expires_at: signedVideo?.expires_at,
        video_url_expires_in_seconds: signedVideo?.expires_in_seconds,
      }
    }

    if (!customerId) {
      return { ok: false, code: 401, message: "请先登录" }
    }

    const purchased = await hasPurchasedFn(customerId, lesson.course_id)

    if (!purchased) {
      return { ok: false, code: 403, message: "请先购买课程" }
    }

    const signedVideo = await this.signMediaAsset(lesson.video_asset)

    if (lesson.video_asset && !signedVideo) {
      return { ok: false, code: 403, message: "视频授权暂不可用，请稍后重试" }
    }

    return {
      ok: true,
      video_url: signedVideo?.url ?? lesson.video_url ?? "",
      video_url_expires_at: signedVideo?.expires_at,
      video_url_expires_in_seconds: signedVideo?.expires_in_seconds,
    }
  }

  private resolveKnex(): any | null {
    const anyRepo = this.lessonRepo as any
    const scope = anyRepo?.scope
    if (!scope?.resolve) return null

    try {
      return scope.resolve(
        (ContainerRegistrationKeys as any).PG_CONNECTION ?? "pg_connection"
      )
    } catch {
      return null
    }
  }

  private async recalcCourseLessonsCount(courseId: string) {
    const knex = this.resolveKnex()
    if (!knex) return

    // 只统计 published 状态的 lesson，与前台展示保持一致
    const rows = await knex("lesson")
      .where({ course_id: courseId, status: "published" })
      .whereNull("deleted_at")
      .count({ count: "id" })

    const rawCount = (rows?.[0] as any)?.count
    const parsed = typeof rawCount === "string" ? parseInt(rawCount, 10) : Number(rawCount)

    await knex("course")
      .where({ id: courseId })
      .whereNull("deleted_at")
      .update({
        lessons_count: Number.isFinite(parsed) ? parsed : 0,
        updated_at: new Date(),
      })
  }
}
