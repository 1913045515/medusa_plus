import { NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

const SITE_URL = process.env.NEXT_PUBLIC_STORE_URL || "https://localhost:8000"

export const revalidate = 600 // 10 minutes

export async function GET() {
  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    ""

  const res = await fetch(`${BACKEND_URL}/store/blogs?limit=20`, {
    headers: { "x-publishable-api-key": key },
    next: { revalidate: 600 },
  })

  if (!res.ok) {
    return new NextResponse("Failed to fetch blog posts", { status: 500 })
  }

  const data = await res.json()
  const posts: any[] = data.posts || []

  const items = posts
    .map((post: any) => {
      const link = `${SITE_URL}/blog/${post.slug}`
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date(post.created_at).toUTCString()
      const description = post.excerpt
        ? `<![CDATA[${post.excerpt}]]>`
        : ""
      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>博客</title>
    <link>${SITE_URL}/blog</link>
    <description>最新博客文章和资讯</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/feed/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  })
}
