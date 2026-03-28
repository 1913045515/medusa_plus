import type {
  CourseRecord,
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesFilters,
} from "../types"
import type { ICourseRepository } from "./course.repository"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export class CourseOrmRepository implements ICourseRepository {
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

  async findAll(filters?: ListCoursesFilters): Promise<CourseRecord[]> {
    let q = this.knex("course")
      .select(
        "id",
        "product_id",
        "handle",
        "title",
        "description",
        "translations",
        "thumbnail_url",
        "level",
        "lessons_count",
        "status",
        "metadata",
        "created_at",
        "updated_at"
      )
      .whereNull("deleted_at")

    if (filters?.status) q = q.andWhere("status", filters.status)
    if (filters?.handle) q = q.andWhere("handle", filters.handle)

    return (await q) as CourseRecord[]
  }

  async findById(id: string): Promise<CourseRecord | null> {
    const row = await this.knex("course")
      .select(
        "id",
        "product_id",
        "handle",
        "title",
        "description",
        "translations",
        "thumbnail_url",
        "level",
        "lessons_count",
        "status",
        "metadata",
        "created_at",
        "updated_at"
      )
      .where({ id })
      .whereNull("deleted_at")
      .first()

    return (row ?? null) as CourseRecord | null
  }

  async findByHandle(handle: string): Promise<CourseRecord | null> {
    const row = await this.knex("course")
      .select(
        "id",
        "product_id",
        "handle",
        "title",
        "description",
        "translations",
        "thumbnail_url",
        "level",
        "lessons_count",
        "status",
        "metadata",
        "created_at",
        "updated_at"
      )
      .where({ handle })
      .whereNull("deleted_at")
      .first()

    return (row ?? null) as CourseRecord | null
  }

  async create(input: CreateCourseInput): Promise<CourseRecord> {
    const id = input.id ?? `course_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date()

    await this.knex("course").insert({
      id,
      product_id: input.product_id ?? null,
      handle: input.handle,
      title: input.title,
      description: input.description ?? null,
      translations: input.translations ? JSON.stringify(input.translations) : null,
      thumbnail_url: input.thumbnail_url ?? null,
      level: input.level ?? null,
      lessons_count: input.lessons_count ?? 0,
      status: input.status ?? "published",
      metadata: input.metadata ?? null,
      created_at: now,
      updated_at: now,
    })

    const created = await this.findById(id)
    if (!created) throw new Error("Failed to create course")
    return created
  }

  async update(id: string, input: UpdateCourseInput): Promise<CourseRecord | null> {
    const now = new Date()

    const patch: Record<string, any> = {
      updated_at: now,
    }

    if ("product_id" in input) patch.product_id = input.product_id ?? null
    if ("handle" in input) patch.handle = input.handle
    if ("title" in input) patch.title = input.title
    if ("description" in input) patch.description = input.description ?? null
    if ("translations" in input) patch.translations = input.translations ? JSON.stringify(input.translations) : null
    if ("thumbnail_url" in input) patch.thumbnail_url = input.thumbnail_url ?? null
    if ("level" in input) patch.level = input.level ?? null
    if ("lessons_count" in input) patch.lessons_count = input.lessons_count
    if ("status" in input) patch.status = input.status
    if ("metadata" in input) patch.metadata = input.metadata ?? null

    const updatedCount = await this.knex("course")
      .where({ id })
      .whereNull("deleted_at")
      .update(patch)

    if (!updatedCount) return null
    return await this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const deletedAt = new Date()

    const updatedCount = await this.knex("course")
      .where({ id })
      .whereNull("deleted_at")
      .update({ deleted_at: deletedAt, updated_at: deletedAt })

    return !!updatedCount
  }
}
