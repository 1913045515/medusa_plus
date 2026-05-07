"use server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY
  if (!key) throw new Error("Missing publishable key")
  return key
}

function getBaseHeaders(): Record<string, string> {
  return { "x-publishable-api-key": getPublishableKey() }
}

async function backendFetch<T>(path: string, options?: RequestInit, retries = 2): Promise<T> {
  if (!BACKEND_URL) throw new Error("Missing MEDUSA_BACKEND_URL")
  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BACKEND_URL}${path}`, {
        ...options,
        headers: { ...getBaseHeaders(), ...(options?.headers ?? {}) },
        // Use a reasonable signal timeout to avoid hanging SSR
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        throw new Error(`Blog API error ${res.status}: ${txt.slice(0, 200)}`)
      }
      return res.json()
    } catch (err: unknown) {
      lastErr = err
      // Don't retry on 4xx errors — they are definitive
      if (err instanceof Error && err.message.startsWith("Blog API error 4")) throw err
      if (attempt < retries) {
        // Brief back-off before retry
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
        continue
      }
    }
  }
  throw lastErr
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  cover_image_signed_url?: string | null
  category_id: string | null
  status: string
  is_pinned: boolean
  visibility: string
  allow_comments: boolean
  read_count: number
  word_count: number
  seo_title: string | null
  seo_description: string | null
  author_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  tags?: { id: string; name: string; slug: string }[]
  password_protected?: boolean
}

export type BlogCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  cover_image: string | null
  parent_id: string | null
  post_count: number
}

export type BlogTag = {
  id: string
  name: string
  slug: string
  post_count?: number
}

export type BlogListResult = {
  posts: BlogPost[]
  total: number
  page: number
  limit: number
}

export async function listBlogPosts(params: {
  page?: number
  limit?: number
  category_id?: string
  tag_id?: string
  q?: string
  customHeaders?: Record<string, string>
}): Promise<BlogListResult> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  if (params.category_id) query.set("category_id", params.category_id)
  if (params.tag_id) query.set("tag_id", params.tag_id)
  if (params.q) query.set("q", params.q)

  return backendFetch<BlogListResult>(`/store/blogs?${query}`, {
    headers: params.customHeaders,
    cache: "no-store",
  })
}

export async function getBlogPost(slug: string, options?: { password?: string; preview?: string; customHeaders?: Record<string, string> }): Promise<BlogPost> {
  const query = new URLSearchParams()
  if (options?.password) query.set("password", options.password)
  if (options?.preview) query.set("preview", options.preview)
  const qs = query.toString() ? `?${query}` : ""
  return backendFetch<{ post: BlogPost }>(`/store/blogs/${slug}${qs}`, {
    headers: options?.customHeaders,
    cache: "no-store",
  }).then((d) => d.post)
}

export async function listBlogCategories(customHeaders?: Record<string, string>): Promise<BlogCategory[]> {
  const data = await backendFetch<{ categories: BlogCategory[] }>("/store/blog-categories", {
    headers: customHeaders,
    cache: "no-store",
  })
  return data.categories
}

export async function listBlogTags(customHeaders?: Record<string, string>): Promise<BlogTag[]> {
  const data = await backendFetch<{ tags: BlogTag[] }>("/store/blog-tags", {
    headers: customHeaders,
    cache: "no-store",
  })
  return data.tags
}

export async function getRelatedPosts(id: string): Promise<BlogPost[]> {
  const data = await backendFetch<{ posts: BlogPost[] }>(`/store/blogs/${id}/related`, { cache: "no-store" })
  return data.posts
}

export async function getAdjacentPosts(id: string): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  return backendFetch(`/store/blogs/${id}/adjacent`, { cache: "no-store" })
}

export async function getBlogComments(id: string) {
  const data = await backendFetch<{ comments: any[] }>(`/store/blogs/${id}/comments`, { cache: "no-store" })
  return data.comments
}
