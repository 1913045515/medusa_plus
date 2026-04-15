"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { BlogPost } from "@lib/data/blog"
import type { BlogDictionary } from "@lib/i18n/dictionaries"
import DOMPurify from "isomorphic-dompurify"
import "@modules/products/components/product-richtext/richtext.css"

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

  useEffect(() => { setCurrentUrl(window.location.href) }, [])

  useEffect(() => {
    if (post?.content) {
      const items = extractToc(post.content)
      setToc(items)
      if (contentRef.current) {
        contentRef.current.querySelectorAll("h2, h3").forEach((el, idx) => {
          if (!el.id) el.id = `heading-${idx}`
        })
      }
    }
  }, [post?.content])

  useEffect(() => {
    if (post?.id) {
      fetch(`/api/blog/view/${post.id}`, { method: "POST" }).catch(() => {})
    }
  }, [post?.id])

  useEffect(() => {
    if (toc.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveHeading(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -60% 0px" }
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

  // ── Password gate ──────────────────────────────────────────────
  if (passwordProtected && !post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-4xl">🔒</span>
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">
              {dict?.passwordRequired ?? "This article is password protected"}
            </h1>
          </div>
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
              placeholder={dict?.passwordPlaceholder ?? "Enter password"}
              className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors"
            >
              {dict?.passwordConfirm ?? "Continue"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!post) return null

  const safeContent = sanitizeHtml(post.content || "")
  const readTime = readTimeMinutes(post.word_count)
  const coverSrc = (post as any).cover_image_signed_url || post.cover_image

  return (
    <div className="bg-white">
      {/* ── Page wrapper ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-10">
          <Link href="/" className="hover:text-neutral-700 transition-colors">{dict?.home ?? "Home"}</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-neutral-700 transition-colors">{dict?.blog ?? "Blog"}</Link>
          <span>/</span>
          <span className="text-neutral-600 truncate max-w-[240px]">{post.title}</span>
        </nav>

        {/* ── Two-column layout ─────────────────────────────── */}
        <div className="flex gap-16 items-start">

          {/* ── Main article column ───────────────────────── */}
          <article className="flex-1 min-w-0">

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 leading-[1.15] tracking-tight mb-6">
              {post.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-neutral-400 mb-8">
              {post.published_at && (
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </time>
              )}
              <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
              <span>{dict ? fmt(dict.minuteRead, readTime) : `${readTime} min read`}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
              <span>{dict ? fmt(dict.reads, post.read_count) : `${post.read_count} views`}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:block" />
              <span>{dict ? fmt(dict.words, post.word_count) : `${post.word_count} words`}</span>
            </div>

            {/* Cover image — after meta */}
            {coverSrc && (
              <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-10 shadow-md">
                <Image
                  src={coverSrc}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Tags row */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="text-xs border border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 px-3 py-1 rounded-full transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile TOC */}
            {toc.length >= 2 && (
              <div className="lg:hidden mb-8 border border-neutral-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-neutral-700 bg-neutral-50"
                >
                  <span>{dict?.tableOfContents ?? "Table of Contents"}</span>
                  <span className="text-neutral-400">{tocOpen ? "▲" : "▼"}</span>
                </button>
                {tocOpen && (
                  <ul className="px-4 py-3 space-y-2 bg-white">
                    {toc.map((item) => (
                      <li key={item.id} style={{ paddingLeft: item.level === 3 ? "1rem" : 0 }}>
                        <a
                          href={`#${item.id}`}
                          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors block py-0.5"
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

            {/* ── Article body ────────────────────────────── */}
            <div
              ref={contentRef}
              className="product-richtext prose-neutral max-w-none"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            {/* ── Post navigation ─────────────────────────── */}
            {adjacent && (adjacent.prev || adjacent.next) && (
              <div className="mt-16 pt-10 border-t border-neutral-100 grid grid-cols-2 gap-6">
                {adjacent.prev ? (
                  <Link
                    href={`/blog/${adjacent.prev.slug}`}
                    className="group"
                  >
                    <p className="text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      ← {dict?.prevPost ?? "Previous"}
                    </p>
                    <p className="text-sm font-medium text-neutral-700 group-hover:text-neutral-950 line-clamp-2 transition-colors">
                      {adjacent.prev.title}
                    </p>
                  </Link>
                ) : <div />}
                {adjacent.next ? (
                  <Link
                    href={`/blog/${adjacent.next.slug}`}
                    className="group text-right"
                  >
                    <p className="text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      {dict?.nextPost ?? "Next"} →
                    </p>
                    <p className="text-sm font-medium text-neutral-700 group-hover:text-neutral-950 line-clamp-2 transition-colors">
                      {adjacent.next.title}
                    </p>
                  </Link>
                ) : <div />}
              </div>
            )}

            {/* ── Related posts ───────────────────────────── */}
            {related.length > 0 && (
              <div className="mt-16">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-6">
                  {dict?.relatedPosts ?? "Related Articles"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {related.map((p) => (
                    <Link
                      key={p.id}
                      href={`/blog/${p.slug}`}
                      className="group block"
                    >
                      {p.cover_image && (
                        <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3">
                          <Image
                            src={p.cover_image}
                            alt={p.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-neutral-800 line-clamp-2 group-hover:text-neutral-500 transition-colors">
                        {p.title}
                      </p>
                      {p.excerpt && (
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{p.excerpt}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Comments ────────────────────────────────── */}
            {post.allow_comments && (
              <div className="mt-16">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-6">
                  {dict ? fmt(dict.commentCount, comments.length) : `${comments.length} Comment${comments.length !== 1 ? "s" : ""}`}
                </h2>
                {comments.length === 0 && (
                  <p className="text-sm text-neutral-400 mb-8">
                    {dict?.noComments ?? "No comments yet. Be the first to share your thoughts."}
                  </p>
                )}
                {comments.length > 0 && (
                  <div className="space-y-5 mb-8">
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-500 shrink-0">
                          {c.customer_id.slice(-2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-neutral-400 mb-1.5">
                            {new Date(c.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                          <p className="text-sm text-neutral-700 leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <CommentForm postId={post.id} customer={customer} dict={dict} />
              </div>
            )}

            {/* ── Share — after comments, before footer ──── */}
            <div className="mt-14 pt-10 border-t border-neutral-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-5">
                {dict?.shareArticle ?? "Share"}
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-full text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                >
                  🔗 {copied ? (dict?.copied ?? "Copied!") : (dict?.copyLink ?? "Copy link")}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-full text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                >
                  𝕏 Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-full text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={`https://service.weibo.com/share/share.php?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-full text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                >
                  微博
                </a>
              </div>
            </div>

          </article>

          {/* ── Desktop TOC Sidebar ───────────────────────── */}
          {toc.length >= 2 && (
            <aside className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-28">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                  {dict?.tableOfContents ?? "On this page"}
                </p>
                <ul className="space-y-1 border-l border-neutral-100">
                  {toc.map((item) => (
                    <li
                      key={item.id}
                      style={{ paddingLeft: item.level === 3 ? "1.25rem" : "0.75rem" }}
                    >
                      <a
                        href={`#${item.id}`}
                        className={`block text-xs py-1 transition-colors leading-snug ${
                          activeHeading === item.id
                            ? "text-neutral-950 font-semibold border-l-2 border-neutral-950 -ml-[3px] pl-[calc(0.75rem+1px)]"
                            : "text-neutral-400 hover:text-neutral-700"
                        }`}
                        style={
                          item.level === 3
                            ? activeHeading === item.id
                              ? { paddingLeft: "calc(1.25rem + 1px)", marginLeft: "-3px" }
                              : {}
                            : undefined
                        }
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
    </div>
  )
}

// ── Comment form ────────────────────────────────────────────────
function CommentForm({ postId, customer, dict }: { postId: string; customer?: { id: string } | null; dict?: BlogDictionary }) {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  if (!customer) {
    return (
      <p className="text-sm text-neutral-400">
        <Link href="/account/login" className="underline underline-offset-2 hover:text-neutral-900 transition-colors">
          {dict?.login ?? "Sign in"}
        </Link>{" "}
        {dict?.loginToComment ?? "to leave a comment."}
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
      if (res.status === 401) { setMessage(dict?.sessionExpired ?? "Session expired, please sign in again."); return }
      if (!res.ok) throw new Error("Failed")
      setContent("")
      setMessage(dict?.commentSubmitted ?? "Your comment has been submitted for review.")
    } catch {
      setMessage(dict?.commentFailed ?? "Failed to submit. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={dict?.commentPlaceholder ?? "Share your thoughts…"}
        rows={4}
        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-700 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none transition-shadow"
      />
      {message && <p className="text-sm text-neutral-400">{message}</p>}
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="bg-neutral-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40"
      >
        {submitting ? (dict?.submittingComment ?? "Posting…") : (dict?.submitComment ?? "Post comment")}
      </button>
    </form>
  )
}
