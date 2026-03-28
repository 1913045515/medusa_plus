import type { ILessonRepository } from "../repositories/lesson.repository"
import type {
  LessonRecord,
  CreateLessonInput,
  UpdateLessonInput,
  ListLessonsFilters,
  LocalizedLessonRecord,
} from "../types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// ─── LessonService ────────────────────────────────────────────────────────────
// 依赖 ILessonRepository 接口，不关心底层是静态 JSON 还是 ORM。
// 切换数据库时：构造函数注入不同的 Repository 实现即可。

export class LessonService {
  constructor(private readonly lessonRepo: ILessonRepository) {}

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
    | { ok: true; video_url: string }
    | { ok: false; code: 401 | 403; message: string }
  > {
    const lesson = await this.lessonRepo.findById(lessonId)
    console.log("[resolvePlayUrl] lessonId=", lessonId, "lesson=", lesson ? { id: lesson.id, is_free: lesson.is_free, course_id: lesson.course_id } : null)

    if (!lesson) {
      return { ok: false, code: 403, message: "Lesson not found" }
    }

    // 免费集：直接返回
    if (lesson.is_free) {
      console.log("[resolvePlayUrl] is_free=true, bypassing purchase check")
      return { ok: true, video_url: lesson.video_url ?? "" }
    }

    // 付费集：未登录
    if (!customerId) {
      console.log("[resolvePlayUrl] is_free=false, customerId=null → 401")
      return { ok: false, code: 401, message: "请先登录" }
    }

    // 付费集：已登录，检查是否购买
    console.log("[resolvePlayUrl] is_free=false, customerId=", customerId, "course_id=", lesson.course_id, "→ checking purchase...")
    const purchased = await hasPurchasedFn(customerId, lesson.course_id)
    console.log("[resolvePlayUrl] purchased=", purchased)

    if (!purchased) {
      return { ok: false, code: 403, message: "请先购买课程" }
    }

    return { ok: true, video_url: lesson.video_url ?? "" }
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
