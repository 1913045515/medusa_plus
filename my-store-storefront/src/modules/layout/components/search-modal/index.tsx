"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MagnifyingGlass, XMark, Spinner } from "@medusajs/icons"

type BlogResult = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
}

type ProductResult = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  description: string | null
}

type CourseResult = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail_url: string | null
}

type SearchResults = {
  blogs: BlogResult[]
  products: ProductResult[]
  courses: CourseResult[]
  total: number
}

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export default function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Open with keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults(null)
    }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `${BACKEND_URL}/store/search?q=${encodeURIComponent(q)}&limit=5`,
        { headers: { "Content-Type": "application/json" } }
      )
      if (res.ok) {
        const data: SearchResults = await res.json()
        setResults(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const navigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const hasResults = results && results.total > 0
  const isEmpty = results && results.total === 0

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="搜索"
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-ui-bg-subtle transition-colors"
        data-testid="search-icon-button"
      >
        <MagnifyingGlass className="w-4 h-4 text-ui-fg-subtle" />
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        data-testid="search-backdrop"
      />

      {/* Modal */}
      <div
        className="fixed inset-x-4 top-[10vh] z-[61] mx-auto max-w-2xl"
        data-testid="search-modal"
      >
        <div className="rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
          {/* Search input bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-ui-border-base">
            <MagnifyingGlass className="w-5 h-5 text-ui-fg-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="搜索商品、博客、课程..."
              className="flex-1 bg-transparent outline-none text-sm text-ui-fg-base placeholder:text-ui-fg-muted"
              data-testid="search-input"
            />
            {loading && <Spinner className="w-4 h-4 animate-spin text-ui-fg-muted shrink-0" />}
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-ui-bg-subtle transition-colors"
            >
              <XMark className="w-4 h-4 text-ui-fg-muted" />
            </button>
          </div>

          {/* Results */}
          {(hasResults || isEmpty) && (
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {isEmpty && (
                <div className="px-4 py-8 text-center text-sm text-ui-fg-muted">
                  未找到相关内容
                </div>
              )}

              {/* Blogs */}
              {results && results.blogs.length > 0 && (
                <section className="mb-2">
                  <div className="px-4 py-1.5 text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
                    博客
                  </div>
                  {results.blogs.map((blog) => (
                    <button
                      key={blog.id}
                      className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-ui-bg-subtle transition-colors"
                      onClick={() => navigate(`/blog/${blog.slug}`)}
                    >
                      {blog.cover_image && (
                        <img
                          src={blog.cover_image}
                          alt=""
                          className="w-10 h-10 rounded object-cover shrink-0 mt-0.5"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ui-fg-base truncate">{blog.title}</p>
                        {blog.excerpt && (
                          <p className="text-xs text-ui-fg-muted truncate mt-0.5">{blog.excerpt}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </section>
              )}

              {/* Products */}
              {results && results.products.length > 0 && (
                <section className="mb-2">
                  <div className="px-4 py-1.5 text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
                    商品
                  </div>
                  {results.products.map((product) => (
                    <button
                      key={product.id}
                      className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-ui-bg-subtle transition-colors"
                      onClick={() => navigate(`/products/${product.handle}`)}
                    >
                      {product.thumbnail && (
                        <img
                          src={product.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded object-cover shrink-0 mt-0.5"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ui-fg-base truncate">{product.title}</p>
                        {product.description && (
                          <p className="text-xs text-ui-fg-muted truncate mt-0.5">{product.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </section>
              )}

              {/* Courses */}
              {results && results.courses.length > 0 && (
                <section className="mb-2">
                  <div className="px-4 py-1.5 text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
                    课程
                  </div>
                  {results.courses.map((course) => (
                    <button
                      key={course.id}
                      className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-ui-bg-subtle transition-colors"
                      onClick={() => navigate(`/courses/${course.handle}`)}
                    >
                      {course.thumbnail_url && (
                        <img
                          src={course.thumbnail_url}
                          alt=""
                          className="w-10 h-10 rounded object-cover shrink-0 mt-0.5"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ui-fg-base truncate">{course.title}</p>
                        {course.description && (
                          <p className="text-xs text-ui-fg-muted truncate mt-0.5">{course.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </section>
              )}
            </div>
          )}

          {/* Empty initial state hint */}
          {!results && !loading && query.length < 2 && query.length > 0 && (
            <div className="px-4 py-4 text-sm text-ui-fg-muted text-center">
              请输入至少 2 个字符开始搜索
            </div>
          )}

          {/* Keyboard hint */}
          {!results && !loading && query.length === 0 && (
            <div className="px-4 py-4 text-xs text-ui-fg-muted text-center">
              搜索商品、博客文章、课程 · 按 <kbd className="px-1.5 py-0.5 rounded bg-ui-bg-subtle font-mono">Esc</kbd> 关闭
            </div>
          )}
        </div>
      </div>
    </>
  )
}
