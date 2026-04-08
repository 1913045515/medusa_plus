import type {
  LessonRecord,
  CreateLessonInput,
  UpdateLessonInput,
  ListLessonsFilters,
} from "../types"
import type { ILessonRepository } from "./lesson.repository"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export class LessonOrmRepository implements ILessonRepository {
  constructor(private readonly scope: any) {}

  private get knex() {
    // 在 Medusa v2 中，直接通过 pg_connection 解析共享的 Knex 实例
    // typeORM 的 manager 已经被移除
    const knex = this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
    if (!knex) {
      throw new Error("Could not resolve 'pg_connection' from request scope")
    }
    return knex
  }

  async findAll(filters?: ListLessonsFilters): Promise<LessonRecord[]> {
    let q = this.knex("lesson")
      .select(
        "id",
        "course_id",
        "title",
        "description",
        "translations",
        "episode_number",
        "duration",
        "is_free",
        "thumbnail_url",
        "thumbnail_asset",
        "video_url",
        "video_asset",
        "status",
        "metadata",
        "created_at",
        "updated_at"
      )
      .whereNull("deleted_at")

    if (filters?.course_id) q = q.andWhere("course_id", filters.course_id)
    if (filters?.status) q = q.andWhere("status", filters.status)
    if (filters?.is_free !== undefined) q = q.andWhere("is_free", filters.is_free)

    q = q.orderBy("episode_number", "asc")

    return (await q) as LessonRecord[]
  }

  async findById(id: string): Promise<LessonRecord | null> {
    const row = await this.knex("lesson")
      .select(
        "id",
        "course_id",
        "title",
        "description",
        "translations",
        "episode_number",
        "duration",
        "is_free",
        "thumbnail_url",
        "thumbnail_asset",
        "video_url",
        "video_asset",
        "status",
        "metadata",
        "created_at",
        "updated_at"
      )
      .where({ id })
      .whereNull("deleted_at")
      .first()

    return (row ?? null) as LessonRecord | null
  }

  async findByCourseId(courseId: string): Promise<LessonRecord[]> {
    const rows = await this.knex("lesson")
      .select(
        "id",
        "course_id",
        "title",
        "description",
        "translations",
        "episode_number",
        "duration",
        "is_free",
        "thumbnail_url",
        "thumbnail_asset",
        "video_url",
        "video_asset",
        "status",
        "metadata",
        "created_at",
        "updated_at"
      )
      .where({ course_id: courseId })
      .whereNull("deleted_at")
      .orderBy("episode_number", "asc")

    return (rows ?? []) as LessonRecord[]
  }

  async create(input: CreateLessonInput): Promise<LessonRecord> {
    const id = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date()

    await this.knex("lesson").insert({
      id,
      course_id: input.course_id,
      title: input.title,
      description: input.description ?? null,
      translations: input.translations ? JSON.stringify(input.translations) : null,
      episode_number: input.episode_number,
      duration: input.duration ?? 0,
      is_free: input.is_free ?? false,
      thumbnail_url: input.thumbnail_url ?? null,
      thumbnail_asset: input.thumbnail_asset ?? null,
      video_url: input.video_url ?? null,
      video_asset: input.video_asset ?? null,
      status: input.status ?? "published",
      metadata: input.metadata ?? null,
      created_at: now,
      updated_at: now,
    })

    const created = await this.findById(id)
    if (!created) throw new Error("Failed to create lesson")
    return created
  }

  async update(id: string, input: UpdateLessonInput): Promise<LessonRecord | null> {
    const now = new Date()

    const patch: Record<string, any> = {
      updated_at: now,
    }

    if ("course_id" in input) patch.course_id = input.course_id
    if ("title" in input) patch.title = input.title
    if ("description" in input) patch.description = input.description ?? null
    if ("translations" in input) patch.translations = input.translations ? JSON.stringify(input.translations) : null
    if ("episode_number" in input) patch.episode_number = input.episode_number
    if ("duration" in input) patch.duration = input.duration
    if ("is_free" in input) patch.is_free = input.is_free
    if ("thumbnail_url" in input) patch.thumbnail_url = input.thumbnail_url ?? null
    if ("thumbnail_asset" in input) patch.thumbnail_asset = input.thumbnail_asset ?? null
    if ("video_url" in input) patch.video_url = input.video_url ?? null
    if ("video_asset" in input) patch.video_asset = input.video_asset ?? null
    if ("status" in input) patch.status = input.status
    if ("metadata" in input) patch.metadata = input.metadata ?? null

    const updatedCount = await this.knex("lesson")
      .where({ id })
      .whereNull("deleted_at")
      .update(patch)

    if (!updatedCount) return null
    return await this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const deletedAt = new Date()

    const updatedCount = await this.knex("lesson")
      .where({ id })
      .whereNull("deleted_at")
      .update({ deleted_at: deletedAt, updated_at: deletedAt })

    return !!updatedCount
  }
}
