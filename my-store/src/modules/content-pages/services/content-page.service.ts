import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis
const STYLE_TAG_REGEX = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gis
const EVENT_HANDLER_ATTR_REGEX = /\son[a-z-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_URL_ATTR_REGEX = /\s(href|src|xlink:href|formaction)\s*=\s*(["'])\s*javascript:[^"']*\2/gi

function sanitizeHtml(html?: string | null): string {
  if (!html) return ""
  return html
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(STYLE_TAG_REGEX, "")
    .replace(EVENT_HANDLER_ATTR_REGEX, "")
    .replace(JS_URL_ATTR_REGEX, "")
}

function generateId(): string {
  return `cp_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`
}

export interface ListContentPagesInput {
  status?: string
  show_in_footer?: boolean
  q?: string
  page?: number
  limit?: number
}

export interface CreateContentPageInput {
  title: string
  slug: string
  body?: string | null
  status?: string
  show_in_footer?: boolean
  footer_label?: string | null
  sort_order?: number
  seo_title?: string | null
  seo_description?: string | null
}

export interface UpdateContentPageInput {
  title?: string
  slug?: string
  body?: string | null
  status?: string
  show_in_footer?: boolean
  footer_label?: string | null
  sort_order?: number
  seo_title?: string | null
  seo_description?: string | null
}

export class ContentPageService {
  constructor(private readonly scope: any) {}

  private get knex() {
    const knex = this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
    if (!knex) throw new Error("Could not resolve 'pg_connection' from request scope")
    return knex
  }

  async list(input: ListContentPagesInput = {}) {
    const { status, show_in_footer, q, page = 1, limit = 50 } = input
    let query = this.knex("content_page").select("*")

    if (status) query = query.where("status", status)
    if (show_in_footer !== undefined) query = query.where("show_in_footer", show_in_footer)
    if (q) query = query.whereILike("title", `%${q}%`)

    const offset = (page - 1) * limit
    const [rows, countResult] = await Promise.all([
      query.clone().orderBy("sort_order", "asc").orderBy("created_at", "desc").limit(limit).offset(offset),
      query.clone().count("* as count").first(),
    ])

    return {
      content_pages: rows,
      count: Number(countResult?.count ?? 0),
      page,
      limit,
    }
  }

  async getBySlug(slug: string) {
    const row = await this.knex("content_page").where("slug", slug).first()
    return row ?? null
  }

  async getById(id: string) {
    const row = await this.knex("content_page").where("id", id).first()
    return row ?? null
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    let query = this.knex("content_page").where("slug", slug)
    if (excludeId) query = query.andWhereNot("id", excludeId)
    const row = await query.first()
    return !!row
  }

  async create(input: CreateContentPageInput) {
    const id = generateId()
    const now = new Date()
    const sanitizedBody = sanitizeHtml(input.body)
    const status = input.status ?? "draft"
    const published_at = status === "published" ? now : null

    const row = {
      id,
      title: input.title,
      slug: input.slug,
      body: sanitizedBody || null,
      status,
      show_in_footer: input.show_in_footer ?? false,
      footer_label: input.footer_label ?? null,
      sort_order: input.sort_order ?? 0,
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
      published_at,
      created_at: now,
      updated_at: now,
    }

    await this.knex("content_page").insert(row)
    return row
  }

  async update(id: string, input: UpdateContentPageInput) {
    const now = new Date()
    const updates: Record<string, any> = { updated_at: now }

    if (input.title !== undefined) updates.title = input.title
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.body !== undefined) updates.body = sanitizeHtml(input.body) || null
    if (input.show_in_footer !== undefined) updates.show_in_footer = input.show_in_footer
    if (input.footer_label !== undefined) updates.footer_label = input.footer_label
    if (input.sort_order !== undefined) updates.sort_order = input.sort_order
    if (input.seo_title !== undefined) updates.seo_title = input.seo_title
    if (input.seo_description !== undefined) updates.seo_description = input.seo_description

    if (input.status !== undefined) {
      updates.status = input.status
      if (input.status === "published") {
        const existing = await this.getById(id)
        if (!existing?.published_at) updates.published_at = now
      } else if (input.status === "draft") {
        updates.published_at = null
      }
    }

    await this.knex("content_page").where("id", id).update(updates)
    return this.getById(id)
  }

  async delete(id: string) {
    await this.knex("content_page").where("id", id).delete()
  }
}
