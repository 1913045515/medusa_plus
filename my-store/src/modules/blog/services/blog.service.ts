import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  ListBlogPostsInput,
  CreateBlogCategoryInput,
  CreateBlogTagInput,
  CreateBlogUserGroupInput,
  CreateBlogCommentInput,
} from "../types"

function generateId(): string {
  return `blog_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

function countWords(html: string): number {
  const text = stripHtml(html || "")
  if (!text) return 0
  // Count both CJK characters and space-separated words
  const cjk = (text.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g) || []).length
  const latin = (text.match(/[a-zA-Z0-9]+/g) || []).length
  return cjk + latin
}

export class BlogService {
  constructor(private readonly scope: any) {}

  private get knex() {
    const knex = this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
    if (!knex) throw new Error("Could not resolve 'pg_connection' from request scope")
    return knex
  }

  // ─── POSTS ─────────────────────────────────────────────────────────────────

  async listPosts(input: ListBlogPostsInput = {}) {
    const {
      status,
      category_id,
      tag_id,
      q,
      visibility_customer_id,
      visibility_group_ids,
      page = 1,
      limit = 20,
      include_deleted = false,
      skip_visibility_filter = false,
    } = input

    let query = this.knex("blog_post as p").select(
      "p.id", "p.title", "p.slug", "p.excerpt", "p.cover_image",
      "p.category_id", "p.status", "p.is_pinned", "p.visibility",
      "p.visibility_user_ids", "p.visibility_group_ids",
      "p.allow_comments", "p.read_count", "p.word_count",
      "p.seo_title", "p.seo_description", "p.author_id", "p.updated_by",
      "p.published_at", "p.scheduled_at", "p.created_at", "p.updated_at"
    )

    if (!include_deleted) query = query.whereNull("p.deleted_at")

    if (status) {
      if (Array.isArray(status)) query = query.whereIn("p.status", status)
      else query = query.where("p.status", status)
    }
    if (category_id) query = query.where("p.category_id", category_id)
    if (tag_id) {
      query = query.join("blog_post_tag as pt", "pt.post_id", "p.id").where("pt.tag_id", tag_id)
    }
    if (q) {
      // Full-text search with ILIKE fallback for CJK
      query = query.where(function () {
        this.whereRaw(
          `to_tsvector('simple', coalesce(p.title,'') || ' ' || coalesce(p.excerpt,'') || ' ' || coalesce(p.content,'')) @@ plainto_tsquery('simple', ?)`,
          [q]
        ).orWhereRaw(`p.title ILIKE ?`, [`%${q}%`])
          .orWhereRaw(`p.excerpt ILIKE ?`, [`%${q}%`])
      })
    }
    // Visibility filter for store (customer context)
    if (!skip_visibility_filter) {
      if (visibility_customer_id) {
        const groupIds = visibility_group_ids || []
        query = query.where(function () {
          this.where("p.visibility", "all")
            .orWhere(function () {
              this.where("p.visibility", "user").whereRaw(
                `p.visibility_user_ids @> ?::jsonb`,
                [JSON.stringify([visibility_customer_id])]
              )
            })
          if (groupIds.length > 0) {
            this.orWhere(function () {
              this.where("p.visibility", "group").whereRaw(
                `p.visibility_group_ids && ?::jsonb`,
                [JSON.stringify(groupIds)]
              )
            })
          }
        })
      } else {
        // Anonymous users can only see public posts
        query = query.where("p.visibility", "all")
      }
    }

    // Pinned first, then by sort desc, then published_at desc
    query = query.orderByRaw("p.is_pinned DESC, p.sort DESC, p.published_at DESC NULLS LAST")

    const offset = (page - 1) * limit
    const [countResult, rows] = await Promise.all([
      query.clone().clearSelect().clearOrder().count("p.id as total").first(),
      query.limit(limit).offset(offset),
    ])

    return {
      posts: rows,
      total: parseInt(String(countResult?.total || 0), 10),
      page,
      limit,
    }
  }

  async getPostById(id: string, include_deleted = false) {
    let q = this.knex("blog_post").where({ id })
    if (!include_deleted) q = q.whereNull("deleted_at")
    return (await q.first()) ?? null
  }

  async getPostBySlug(slug: string, include_deleted = false) {
    let q = this.knex("blog_post").where({ slug })
    if (!include_deleted) q = q.whereNull("deleted_at")
    return (await q.first()) ?? null
  }

  async createPost(input: CreateBlogPostInput, author_id?: string) {
    const id = generateId()
    const now = new Date()

    // Slug generation
    let slug = input.slug ? slugify(input.slug) : slugify(input.title)
    slug = await this._ensureUniqueSlug(slug)

    const word_count = countWords(input.content || "")
    const excerpt = input.excerpt || stripHtml(input.content || "").slice(0, 200) || null
    const status = input.status || "draft"
    const published_at = status === "published" ? now : null

    const { tag_ids, ...rest } = input

    const row = {
      id,
      ...rest,
      slug,
      excerpt,
      word_count,
      status,
      published_at,
      author_id: author_id || input.author_id || null,
      visibility: input.visibility || "all",
      visibility_user_ids: input.visibility_user_ids ? JSON.stringify(input.visibility_user_ids) : null,
      visibility_group_ids: input.visibility_group_ids ? JSON.stringify(input.visibility_group_ids) : null,
      is_pinned: input.is_pinned ?? false,
      allow_comments: input.allow_comments ?? true,
      read_count: 0,
      sort: input.sort ?? 0,
      created_at: now,
      updated_at: now,
    }

    await this.knex("blog_post").insert(row)

    // Tags
    if (tag_ids?.length) {
      await this._syncPostTags(id, tag_ids)
    }

    // Version snapshot
    await this._snapshotVersion(id, input.title, input.content || "", author_id)

    return this.getPostById(id)
  }

  async updatePost(id: string, input: UpdateBlogPostInput, updated_by?: string) {
    const existing = await this.getPostById(id)
    if (!existing) throw new Error(`Blog post ${id} not found`)

    const now = new Date()
    const { tag_ids, ...rest } = input

    const updates: Record<string, any> = {
      ...rest,
      updated_at: now,
      updated_by: updated_by || input.updated_by || null,
    }

    if (input.content !== undefined) {
      updates.word_count = countWords(input.content || "")
      if (!input.excerpt) {
        updates.excerpt = stripHtml(input.content || "").slice(0, 200) || null
      }
    }

    if (input.slug) updates.slug = await this._ensureUniqueSlug(slugify(input.slug), id)
    if (input.visibility_user_ids) updates.visibility_user_ids = JSON.stringify(input.visibility_user_ids)
    if (input.visibility_group_ids) updates.visibility_group_ids = JSON.stringify(input.visibility_group_ids)

    // Handle publish side-effect
    if (input.status === "published" && existing.status !== "published") {
      updates.published_at = updates.published_at || now
    }

    await this.knex("blog_post").where({ id }).update(updates)

    if (tag_ids !== undefined) {
      await this._syncPostTags(id, tag_ids)
    }

    // Snapshot version
    const title = input.title || existing.title
    const content = input.content !== undefined ? input.content : existing.content
    await this._snapshotVersion(id, title, content, updated_by)

    return this.getPostById(id)
  }

  async publishPost(id: string, updated_by?: string) {
    return this.updatePost(id, { status: "published" }, updated_by)
  }

  async archivePost(id: string, updated_by?: string) {
    return this.updatePost(id, { status: "archived" }, updated_by)
  }

  async softDeletePost(id: string) {
    await this.knex("blog_post").where({ id }).update({ deleted_at: new Date() })
  }

  async duplicatePost(id: string, author_id?: string) {
    const existing = await this.getPostById(id)
    if (!existing) throw new Error(`Blog post ${id} not found`)

    const tags = await this.getPostTags(id)
    const tag_ids = tags.map((t: any) => t.id)

    const { id: _id, slug: _slug, read_count: _rc, created_at: _ca, updated_at: _ua,
      deleted_at: _da, published_at: _pa, ...rest } = existing

    return this.createPost(
      {
        ...rest,
        title: `${existing.title} (Copy)`,
        slug: `${existing.slug}-copy`,
        status: "draft",
        tag_ids,
      },
      author_id
    )
  }

  // ─── VERSIONS ──────────────────────────────────────────────────────────────

  private async _snapshotVersion(post_id: string, title: string, content: string, created_by?: string) {
    const id = generateId()
    await this.knex("blog_post_version").insert({
      id,
      post_id,
      title,
      content,
      created_by: created_by || null,
      created_at: new Date(),
    })
    // Keep max 50 versions
    const versions = await this.knex("blog_post_version")
      .where({ post_id })
      .orderBy("created_at", "asc")
      .select("id")
    if (versions.length > 50) {
      const toDelete = versions.slice(0, versions.length - 50).map((v: any) => v.id)
      await this.knex("blog_post_version").whereIn("id", toDelete).delete()
    }
  }

  async listVersions(post_id: string) {
    return this.knex("blog_post_version")
      .where({ post_id })
      .orderBy("created_at", "desc")
      .select("id", "post_id", "title", "created_by", "created_at")
  }

  async deleteVersions(post_id: string, version_ids: string[]) {
    // Never delete the latest version
    const latest = await this.knex("blog_post_version")
      .where({ post_id })
      .orderBy("created_at", "desc")
      .select("id")
      .first()
    const safeIds = version_ids.filter((id) => id !== latest?.id)
    if (safeIds.length === 0) return
    await this.knex("blog_post_version").where({ post_id }).whereIn("id", safeIds).delete()
  }

  async restoreVersion(post_id: string, version_id: string, restored_by?: string) {
    const version = await this.knex("blog_post_version")
      .where({ id: version_id, post_id })
      .first()
    if (!version) throw new Error(`Version ${version_id} not found`)
    return this.updatePost(post_id, { title: version.title, content: version.content }, restored_by)
  }

  // ─── TAGS ──────────────────────────────────────────────────────────────────

  private async _syncPostTags(post_id: string, tag_ids: string[]) {
    await this.knex("blog_post_tag").where({ post_id }).delete()
    if (tag_ids.length === 0) return
    const rows = tag_ids.map((tag_id) => ({
      id: generateId(),
      post_id,
      tag_id,
      created_at: new Date(),
    }))
    await this.knex("blog_post_tag").insert(rows)
  }

  async getPostTags(post_id: string) {
    return this.knex("blog_tag as t")
      .join("blog_post_tag as pt", "pt.tag_id", "t.id")
      .where("pt.post_id", post_id)
      .select("t.*")
  }

  // ─── READ TRACKING ─────────────────────────────────────────────────────────

  async recordView(post_id: string, ip: string, customer_id?: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existing = await this.knex("blog_post_read")
      .where({ post_id, ip })
      .where("created_at", ">=", since)
      .first()

    if (existing) return // dedup

    const id = generateId()
    await this.knex("blog_post_read").insert({
      id,
      post_id,
      ip,
      customer_id: customer_id || null,
      created_at: new Date(),
    })
    await this.knex("blog_post").where({ id: post_id }).increment("read_count", 1)
  }

  // ─── RELATED / ADJACENT ────────────────────────────────────────────────────

  async getRelated(post_id: string, limit = 3) {
    const post = await this.getPostById(post_id)
    if (!post) return []
    const tags = await this.getPostTags(post_id)
    const tag_ids = tags.map((t: any) => t.id)

    let q = this.knex("blog_post as p")
      .where("p.status", "published")
      .where("p.visibility", "all")
      .whereNull("p.deleted_at")
      .whereNot("p.id", post_id)
      .select("p.id", "p.title", "p.slug", "p.excerpt", "p.cover_image", "p.published_at")
      .orderBy("p.published_at", "desc")
      .limit(limit)

    if (post.category_id) q = q.where("p.category_id", post.category_id)

    if (tag_ids.length > 0) {
      q = q.join("blog_post_tag as pt", "pt.post_id", "p.id").whereIn("pt.tag_id", tag_ids).distinct("p.id")
    }

    return q
  }

  async getAdjacentPosts(post_id: string) {
    const post = await this.getPostById(post_id)
    if (!post) return { prev: null, next: null }

    const base = this.knex("blog_post")
      .where("status", "published")
      .whereNull("deleted_at")
      .where("visibility", "all")
      .select("id", "title", "slug", "published_at")

    const [prev, next] = await Promise.all([
      base.clone().where("published_at", "<", post.published_at).orderBy("published_at", "desc").first(),
      base.clone().where("published_at", ">", post.published_at).orderBy("published_at", "asc").first(),
    ])

    return { prev: prev || null, next: next || null }
  }

  // ─── CATEGORIES ────────────────────────────────────────────────────────────

  async listCategories() {
    const categories = await this.knex("blog_category").orderBy("name", "asc")
    const counts = await this.knex("blog_post")
      .where("status", "published")
      .whereNull("deleted_at")
      .groupBy("category_id")
      .select("category_id")
      .count("id as count")
    const countMap: Record<string, number> = {}
    for (const c of counts) {
      if (c.category_id) countMap[c.category_id] = parseInt(String(c.count), 10)
    }
    return categories.map((cat: any) => ({ ...cat, post_count: countMap[cat.id] || 0 }))
  }

  async getCategoryBySlug(slug: string) {
    return (await this.knex("blog_category").where({ slug }).first()) ?? null
  }

  async getCategoryById(id: string) {
    return (await this.knex("blog_category").where({ id }).first()) ?? null
  }

  async createCategory(input: CreateBlogCategoryInput, created_by?: string) {
    const id = generateId()
    const slug = input.slug ? slugify(input.slug) : slugify(input.name)
    const now = new Date()
    const row = { id, ...input, slug, created_by: created_by || null, created_at: now, updated_at: now }
    await this.knex("blog_category").insert(row)
    return this.knex("blog_category").where({ id }).first()
  }

  async updateCategory(id: string, input: Partial<CreateBlogCategoryInput>, updated_by?: string) {
    const updates: any = { ...input, updated_at: new Date(), updated_by: updated_by || null }
    if (input.slug) updates.slug = slugify(input.slug)
    await this.knex("blog_category").where({ id }).update(updates)
    return this.knex("blog_category").where({ id }).first()
  }

  async deleteCategory(id: string) {
    const postCount = await this.knex("blog_post")
      .where({ category_id: id })
      .whereNull("deleted_at")
      .count("id as c")
      .first()
    if (parseInt(String(postCount?.c || 0), 10) > 0) {
      throw new Error(`Category has ${postCount?.c} posts. Remove them first.`)
    }
    await this.knex("blog_category").where({ id }).delete()
  }

  // ─── TAGS ──────────────────────────────────────────────────────────────────

  async listTags() {
    return this.knex("blog_tag").orderBy("name", "asc")
  }

  async getTagBySlug(slug: string) {
    return (await this.knex("blog_tag").where({ slug }).first()) ?? null
  }

  async getTagById(id: string) {
    return (await this.knex("blog_tag").where({ id }).first()) ?? null
  }

  async createTag(input: CreateBlogTagInput, created_by?: string) {
    const id = generateId()
    const slug = input.slug ? slugify(input.slug) : slugify(input.name)
    const now = new Date()
    await this.knex("blog_tag").insert({ id, ...input, slug, created_by: created_by || null, created_at: now, updated_at: now })
    return this.knex("blog_tag").where({ id }).first()
  }

  async updateTag(id: string, input: Partial<CreateBlogTagInput>, updated_by?: string) {
    const updates: any = { ...input, updated_at: new Date(), updated_by: updated_by || null }
    if (input.slug) updates.slug = slugify(input.slug)
    await this.knex("blog_tag").where({ id }).update(updates)
    return this.knex("blog_tag").where({ id }).first()
  }

  async deleteTag(id: string) {
    await this.knex("blog_post_tag").where({ tag_id: id }).delete()
    await this.knex("blog_tag").where({ id }).delete()
  }

  // ─── USER GROUPS ───────────────────────────────────────────────────────────

  async listUserGroups() {
    return this.knex("blog_user_group").orderBy("name", "asc")
  }

  async getUserGroup(id: string) {
    return (await this.knex("blog_user_group").where({ id }).first()) ?? null
  }

  async createUserGroup(input: CreateBlogUserGroupInput, created_by?: string) {
    const id = generateId()
    const now = new Date()
    await this.knex("blog_user_group").insert({ id, ...input, created_by: created_by || null, created_at: now, updated_at: now })
    return this.knex("blog_user_group").where({ id }).first()
  }

  async updateUserGroup(id: string, input: Partial<CreateBlogUserGroupInput>, updated_by?: string) {
    await this.knex("blog_user_group").where({ id }).update({ ...input, updated_at: new Date(), updated_by: updated_by || null })
    return this.knex("blog_user_group").where({ id }).first()
  }

  async deleteUserGroup(id: string) {
    // Remove group from visibility_group_ids of all posts
    const posts = await this.knex("blog_post")
      .whereRaw(`visibility_group_ids @> ?::jsonb`, [JSON.stringify([id])])
      .select("id", "visibility_group_ids")
    for (const post of posts) {
      const ids: string[] = post.visibility_group_ids || []
      const updated = ids.filter((gid: string) => gid !== id)
      await this.knex("blog_post").where({ id: post.id }).update({
        visibility_group_ids: updated.length ? JSON.stringify(updated) : null,
        updated_at: new Date(),
      })
    }
    await this.knex("blog_user_group_member").where({ group_id: id }).delete()
    await this.knex("blog_user_group").where({ id }).delete()
  }

  async listGroupMembers(group_id: string) {
    return this.knex("blog_user_group_member").where({ group_id }).orderBy("created_at", "asc")
  }

  async addGroupMember(group_id: string, customer_id: string) {
    const existing = await this.knex("blog_user_group_member").where({ group_id, customer_id }).first()
    if (existing) return existing
    const id = generateId()
    await this.knex("blog_user_group_member").insert({ id, group_id, customer_id, created_at: new Date() })
    return this.knex("blog_user_group_member").where({ id }).first()
  }

  async removeGroupMember(group_id: string, customer_id: string) {
    await this.knex("blog_user_group_member").where({ group_id, customer_id }).delete()
  }

  async getCustomerGroupIds(customer_id: string): Promise<string[]> {
    const rows = await this.knex("blog_user_group_member")
      .where({ customer_id })
      .select("group_id")
    return rows.map((r: any) => r.group_id)
  }

  // ─── COMMENTS ──────────────────────────────────────────────────────────────

  async listComments(post_id: string, status?: string) {
    let q = this.knex("blog_comment").where({ post_id }).orderBy("created_at", "asc")
    if (status) q = q.where({ status })
    return q
  }

  async createComment(input: CreateBlogCommentInput) {
    const id = generateId()
    const now = new Date()
    await this.knex("blog_comment").insert({
      id,
      post_id: input.post_id,
      customer_id: input.customer_id,
      content: input.content,
      status: "pending",
      created_at: now,
      updated_at: now,
    })
    return this.knex("blog_comment").where({ id }).first()
  }

  async updateCommentStatus(id: string, status: "approved" | "rejected") {
    await this.knex("blog_comment").where({ id }).update({ status, updated_at: new Date() })
    return this.knex("blog_comment").where({ id }).first()
  }

  async deleteComment(id: string) {
    await this.knex("blog_comment").where({ id }).delete()
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  private async _ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let candidate = slug
    let index = 1
    while (true) {
      let q = this.knex("blog_post").where({ slug: candidate }).whereNull("deleted_at")
      if (excludeId) q = q.whereNot({ id: excludeId })
      const existing = await q.first()
      if (!existing) return candidate
      candidate = `${slug}-${index++}`
    }
  }

  // ─── RSS FEED ──────────────────────────────────────────────────────────────

  async getLatestPublicPosts(limit = 20) {
    return this.knex("blog_post")
      .where({ status: "published", visibility: "all" })
      .whereNull("deleted_at")
      .orderBy("published_at", "desc")
      .limit(limit)
      .select("id", "title", "slug", "excerpt", "cover_image", "author_id", "category_id", "published_at", "updated_at")
  }
}
