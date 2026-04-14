"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { BlogPost } from "@lib/data/blog"
import type { BlogDictionary } from "@lib/i18n/dictionaries"
import DOMPurify from "isomorphic-dompurify"
import "@modules/products/components/product-richtext/richtext.css"

/** Replace {{n}} placeholder in a template string */
function fmt(template: string, n: number): string {
  return template.replace("{{n}}", String(n))
}

type TocItem = { id: string; text: string; level: number }

function extractToc(html: string): TocItem[] {
  if (typeof document === "undefined") return []
  const div = document.createElement("div")
  div.innerHTML = html
  const toc: TocItem[] = []
  div.querySelectorAll("h2, h3").forEach((el, index) => {
    const id = el.id || `heading-${index}`
    el.id = id
    toc.push({ id, text: el.textContent || "", level: el.tagName === "H2" ? 2 : 3 })
  })
  return toc
}

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "s", "u", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "blockquote", "code", "pre", "img",
      "table", "thead", "tbody", "tr", "th", "td", "hr", "span", "div",
      "figure", "figcaption", "sub", "sup",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "id", "class", "target", "rel", "width", "height", "colspan", "rowspan"],
  })
}

function readTimeMinutes(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / 300))
}

type Props = {
  post: BlogPost | null
  related?: BlogPost[]
  adjacent?: { prev: BlogPost | null; next: BlogPost | null }
  comments?: any[]
  passwordProtected?: boolean
  slug: string
  customer?: { id: string; email?: string | null; first_name?: string | null; last_name?: string | null } | null
  dict?: BlogDictionary
}

export default function BlogDetailTemplate({ post, related = [], adjacent, comments = [], passwordProtected, slug, customer, dict }: Props) {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeHeading, setActiveHeading] = useState<string>("")
  const [tocOpen, setTocOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (post?.content) {
      const items = extractToc(post.content)
      setToc(items)
      // Re-attach IDs in actual DOM
      if (contentRef.current) {
        contentRef.current.querySelectorAll("h2, h3").forEach((el, idx) => {
          if (!el.id) el.id = `heading-${idx}`
        })
      }
    }
  }, [post?.content])

  // Record view
  useEffect(() => {
    if (post?.id) {
      fetch(`/api/blog/view/${post.id}`, { method: "POST" }).catch(() => {})
    }
  }, [post?.id])

  // Active heading tracking
  useEffect(() => {
    if (toc.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveHeading(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )
    toc.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [toc])

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Password form
  if (passwordProtected && !post) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4 text-center">
        <h1 className="text-xl font-bold mb-4">{dict?.passwordRequired ?? "🔒 该文章需要密码访问"}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            window.location.href = `/blog/${slug}?password=${encodeURIComponent(password)}`
          }}
          className="space-y-3"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={dict?.passwordPlaceholder ?? "请输入密码"}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {dict?.passwordConfirm ?? "确认"}
          </button>
        </form>
      </div>
    )
  }

  if (!post) return null

  const safeContent = sanitizeHtml(post.content || "")
  const readTime = readTimeMinutes(post.word_count)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-neutral-700">{dict?.home ?? "Home"}</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-neutral-700">{dict?.blog ?? "Blog"}</Link>
        <span>/</span>
        <span className="text-neutral-900 font-medium truncate max-w-[200px]">{post.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* Article */}
        <article className="flex-1 min-w-0">
          {/* Cover */}
          {(post.cover_image_signed_url || post.cover_image) && (
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-6">
              <Image src={(post.cover_image_signed_url || post.cover_image)!} alt={post.title} fill className="object-cover" />
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-6 pb-6 border-b border-neutral-200">
            {post.published_at && (
              <span>{new Date(post.published_at).toLocaleDateString("zh-CN")}</span>
            )}
            <span>{dict ? fmt(dict.minuteRead, readTime) : `约 ${readTime} 分钟阅读`}</span>
            <span>{dict ? fmt(dict.reads, post.read_count) : `${post.read_count} 次阅读`}</span>
            <span>{dict ? fmt(dict.words, post.word_count) : `${post.word_count} 字`}</span>
            {post.tags && post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-full text-neutral-600 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>

          {/* Mobile TOC toggle */}
          {toc.length >= 2 && (
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg px-3 py-2"
              >
                📋 {dict?.tableOfContents ?? "目录"} {tocOpen ? "▲" : "▼"}
              </button>
              {tocOpen && (
                <ul className="mt-2 border border-neutral-200 rounded-lg p-3 space-y-1">
                  {toc.map((item) => (
                    <li key={item.id} style={{ paddingLeft: item.level === 3 ? "1rem" : 0 }}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-blue-600 hover:underline block"
                        onClick={() => setTocOpen(false)}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            className="product-richtext"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          {/* Social Share */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-sm font-medium text-neutral-700 mb-3">{dict?.shareArticle ?? "分享文章"}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                {copied ? (dict?.copied ?? "✓ 已复制") : (dict?.copyLink ?? "🔗 复制链接")}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                𝕏 Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Facebook
              </a>
              <a
                href={`https://service.weibo.com/share/share.php?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                微博
              </a>
            </div>
          </div>

          {/* Adjacent Navigation */}
          {adjacent && (adjacent.prev || adjacent.next) && (
            <div className="mt-8 grid grid-cols-2 gap-4">
              {adjacent.prev ? (
                <Link
                  href={`/blog/${adjacent.prev.slug}`}
                  className="group p-4 border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <p className="text-xs text-neutral-400 mb-1">{dict?.prevPost ?? "← 上一篇"}</p>
                  <p className="text-sm font-medium text-neutral-700 group-hover:text-blue-600 line-clamp-2">
                    {adjacent.prev.title}
                  </p>
                </Link>
              ) : <div />}
              {adjacent.next ? (
                <Link
                  href={`/blog/${adjacent.next.slug}`}
                  className="group p-4 border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors text-right"
                >
                  <p className="text-xs text-neutral-400 mb-1">{dict?.nextPost ?? "下一篇 →"}</p>
                  <p className="text-sm font-medium text-neutral-700 group-hover:text-blue-600 line-clamp-2">
                    {adjacent.next.title}
                  </p>
                </Link>
              ) : <div />}
            </div>
          )}

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">{dict?.relatedPosts ?? "相关文章"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="group block border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {p.cover_image && (
                      <div className="relative h-32 w-full">
                        <Image src={p.cover_image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium text-neutral-800 line-clamp-2 group-hover:text-blue-600">{p.title}</p>
                      {p.excerpt && <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{p.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {post.allow_comments && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">{dict ? fmt(dict.commentCount, comments.length) : `评论 (${comments.length})`}</h2>
              {comments.length === 0 && (
                <p className="text-sm text-neutral-400 mb-4">{dict?.noComments ?? "暂无评论，快来发表第一条评论吧！"}</p>
              )}
              <div className="space-y-4 mb-6">
                {comments.map((c) => (
                  <div key={c.id} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium">
                        {c.customer_id.slice(-2).toUpperCase()}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(c.created_at).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700">{c.content}</p>
                  </div>
                ))}
              </div>
              {/* Comment form — client component */}
              <CommentForm postId={post.id} customer={customer} dict={dict} />
            </div>
          )}
        </article>

        {/* Desktop TOC Sidebar */}
        {toc.length >= 2 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">{dict?.tableOfContents ?? "目录"}</h3>
              <ul className="space-y-1">
                {toc.map((item) => (
                  <li key={item.id} style={{ paddingLeft: item.level === 3 ? "0.75rem" : 0 }}>
                    <a
                      href={`#${item.id}`}
                      className={`block text-xs py-0.5 transition-colors hover:text-blue-600 ${
                        activeHeading === item.id ? "text-blue-600 font-medium" : "text-neutral-500"
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

function CommentForm({ postId, customer, dict }: { postId: string; customer?: { id: string } | null; dict?: BlogDictionary }) {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  if (!customer) {
    return (
      <p className="text-sm text-neutral-500">
        请先{" "}
        <Link href="/account/login" className="text-blue-600 hover:underline">
          {dict?.login ?? "登录"}
        </Link>{" "}
        {dict?.loginToComment ?? "后再评论"}
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/blog/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (res.status === 401) { setMessage(dict?.sessionExpired ?? "登录已过期，请重新登录"); return }
      if (!res.ok) throw new Error("提交失败")
      setContent("")
      setMessage(dict?.commentSubmitted ?? "评论已提交，待审核后显示")
    } catch {
      setMessage(dict?.commentFailed ?? "评论提交失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={dict?.commentPlaceholder ?? "写下你的评论..."}
        rows={4}
        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      {message && <p className="text-sm text-neutral-500">{message}</p>}
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {submitting ? (dict?.submittingComment ?? "提交中...") : (dict?.submitComment ?? "提交评论")}
      </button>
    </form>
  )
}
