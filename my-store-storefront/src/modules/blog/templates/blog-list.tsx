"use client"
import { useState, useCallback, useRef } from "react"
import BlogPostCard from "../components/BlogPostCard"
import type { BlogPost, BlogCategory, BlogTag } from "@lib/data/blog"
import type { BlogDictionary } from "@lib/i18n/dictionaries"

type Props = {
  posts: BlogPost[]
  total: number
  page: number
  limit: number
  categories: BlogCategory[]
  tags: BlogTag[]
  searchParams: Record<string, string | undefined>
  pageTitle?: string
  dict?: BlogDictionary
}

export default function BlogListTemplate({
  posts: initialPosts,
  total,
  page: initialPage,
  limit,
  categories,
  tags,
  searchParams,
  pageTitle,
  dict,
}: Props) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length < total)
  const [searchQ, setSearchQ] = useState(searchParams.q || "")
  const observerRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams({ page: String(nextPage), limit: String(limit) })
      if (searchParams.category_id) params.set("category_id", searchParams.category_id)
      if (searchParams.tag_id) params.set("tag_id", searchParams.tag_id)
      if (searchParams.q) params.set("q", searchParams.q)
      const res = await fetch(`/api/blog/posts?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setPosts((prev) => [...prev, ...data.posts])
      setPage(nextPage)
      setHasMore(posts.length + data.posts.length < data.total)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, limit, searchParams, posts.length])

  // Intersection observer for infinite scroll
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      const observer = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) loadMore() },
        { threshold: 0.1 }
      )
      observer.observe(node)
    },
    [loadMore]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const url = new URL(window.location.href)
    if (searchQ) url.searchParams.set("q", searchQ)
    else url.searchParams.delete("q")
    url.searchParams.delete("page")
    window.location.href = url.toString()
  }

  const pinnedPosts = posts.filter((p) => p.is_pinned)
  const regularPosts = posts.filter((p) => !p.is_pinned)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">{pageTitle || (dict?.pageTitle ?? "博客")}</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder={dict?.searchPlaceholder ?? "搜索文章..."}
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            {dict?.searchButton ?? "搜索"}
          </button>
        </form>
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">{dict?.pinnedPosts ?? "置顶文章"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} pinned dict={dict} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} dict={dict} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-16 text-neutral-400">{dict?.noPosts ?? "暂无文章"}</div>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-6">
            {loading && <span className="text-sm text-neutral-400">{dict?.loadingMore ?? "加载中..."}</span>}
            {!hasMore && posts.length > 0 && (
              <span className="text-sm text-neutral-400">{dict?.showingAll ? dict.showingAll.replace("{{n}}", String(total)) : `已显示全部 ${total} 篇文章`}</span>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-neutral-800 mb-3">{dict?.categories ?? "分类"}</h3>
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`/blog/category/${cat.slug}`}
                      className={`flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-neutral-100 transition-colors ${
                        searchParams.category_id === cat.id ? "bg-blue-50 text-blue-700 font-medium" : "text-neutral-700"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-neutral-400">{cat.post_count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-neutral-800 mb-3">{dict?.tags ?? "标签"}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <a
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      searchParams.tag_id === tag.id
                        ? "bg-blue-600 text-white border-transparent"
                        : "border-neutral-200 text-neutral-600 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    #{tag.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
