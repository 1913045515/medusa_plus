import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  CreateHomepageContentInput,
  HomepageContentPayload,
  HomepageContentRecord,
  UpsertHomepageContentInput,
} from "../types"
import type { IHomepageContentRepository } from "./homepage-content.repository"

type HomepageRow = {
  id: string
  title: string
  handle: string
  site_key: string
  status: string
  is_active: boolean
  published_at: Date | string | null
  content: HomepageContentPayload | string
  translations: Record<string, HomepageContentPayload> | string | null
  metadata: Record<string, unknown> | string | null
  created_at: Date | string | null
  updated_at: Date | string | null
}

export class HomepageContentOrmRepository implements IHomepageContentRepository {
  constructor(private readonly scope: any) {}

  private get knex() {
    const knex = this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
    if (!knex) {
      throw new Error("Could not resolve 'pg_connection' from request scope")
    }
    return knex
  }

  private mapRow(row: HomepageRow | undefined | null): HomepageContentRecord | null {
    if (!row) return null

    const content =
      typeof row.content === "string" ? JSON.parse(row.content) : row.content
    const translations =
      typeof row.translations === "string" ? JSON.parse(row.translations) : row.translations
    const metadata =
      typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata

    return {
      id: row.id,
      title: row.title,
      handle: row.handle,
      site_key: row.site_key,
      status: row.status,
      is_active: Boolean(row.is_active),
      published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
      content,
      translations,
      metadata,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    }
  }

  private baseSelect() {
    return this.knex("homepage_content").select(
      "id",
      "title",
      "handle",
      "site_key",
      "status",
      "is_active",
      "published_at",
      "content",
      "translations",
      "metadata",
      "created_at",
      "updated_at"
    )
  }

  async listAll(): Promise<HomepageContentRecord[]> {
    const rows = await this.baseSelect()
      .whereNull("deleted_at")
      .orderBy([{ column: "is_active", order: "desc" }, { column: "updated_at", order: "desc" }])

    return rows.map((row: HomepageRow) => this.mapRow(row)!).filter(Boolean)
  }

  async findById(id: string): Promise<HomepageContentRecord | null> {
    const row = await this.baseSelect()
      .where({ id })
      .whereNull("deleted_at")
      .first()

    return this.mapRow(row as HomepageRow | null)
  }

  async findByHandle(handle: string): Promise<HomepageContentRecord | null> {
    const row = await this.baseSelect()
      .where({ handle })
      .whereNull("deleted_at")
      .first()

    return this.mapRow(row as HomepageRow | null)
  }

  async findActivePublished(siteKey: string = "default"): Promise<HomepageContentRecord | null> {
    const row = await this.baseSelect()
      .where({ status: "published", is_active: true, site_key: siteKey })
      .whereNull("deleted_at")
      .orderBy("updated_at", "desc")
      .first()

    return this.mapRow(row as HomepageRow | null)
  }

  async create(input: CreateHomepageContentInput): Promise<HomepageContentRecord> {
    const now = new Date()
    const id = `homepage_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    await this.knex("homepage_content").insert({
      id,
      title: input.title,
      handle: input.handle,
      site_key: input.site_key ?? "default",
      status: input.status ?? "draft",
      is_active: Boolean(input.is_active),
      published_at: input.status === "published" ? now : null,
      content: JSON.stringify(input.content),
      translations: input.translations ? JSON.stringify(input.translations) : null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      created_at: now,
      updated_at: now,
    })

    const created = await this.findById(id)
    if (!created) throw new Error("Failed to create homepage content")
    return created
  }

  async update(id: string, input: UpsertHomepageContentInput): Promise<HomepageContentRecord | null> {
    const patch: Record<string, unknown> = {
      updated_at: new Date(),
    }

    if ("title" in input && input.title !== undefined) patch.title = input.title
    if ("handle" in input && input.handle !== undefined) patch.handle = input.handle
    if ("site_key" in input && input.site_key !== undefined) patch.site_key = input.site_key
    if ("status" in input && input.status !== undefined) patch.status = input.status
    if ("is_active" in input && input.is_active !== undefined) patch.is_active = input.is_active
    if ("content" in input && input.content !== undefined) patch.content = JSON.stringify(input.content)
    if ("translations" in input) patch.translations = input.translations ? JSON.stringify(input.translations) : null
    if ("metadata" in input) patch.metadata = input.metadata ? JSON.stringify(input.metadata) : null

    const updatedCount = await this.knex("homepage_content")
      .where({ id })
      .whereNull("deleted_at")
      .update(patch)

    if (!updatedCount) return null
    return this.findById(id)
  }

  async publish(id: string, siteKey?: string): Promise<HomepageContentRecord | null> {
    const now = new Date()
    const current = await this.findById(id)
    const targetSiteKey = siteKey ?? current?.site_key ?? "default"

    await this.knex.transaction(async (trx: any) => {
      await trx("homepage_content")
        .where({ site_key: targetSiteKey })
        .whereNull("deleted_at")
        .update({ is_active: false, updated_at: now })

      await trx("homepage_content")
        .where({ id })
        .whereNull("deleted_at")
        .update({
          status: "published",
          is_active: true,
          site_key: targetSiteKey,
          published_at: now,
          updated_at: now,
        })
    })

    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.knex("homepage_content")
      .where({ id })
      .whereNull("deleted_at")
      .update({ deleted_at: new Date(), updated_at: new Date(), is_active: false })

    return Boolean(deletedCount)
  }
}