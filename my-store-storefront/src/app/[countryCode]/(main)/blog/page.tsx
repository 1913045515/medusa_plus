import { Metadata } from "next"
import { listBlogPosts, listBlogCategories, listBlogTags } from "@lib/data/blog"
import { getLocale } from "@lib/data/locale-actions"
import { getAuthHeaders } from "@lib/data/cookies"
import { getBlogDictionary } from "@lib/i18n/dictionaries"
import BlogListTemplate from "@modules/blog/templates/blog-list"

export const metadata: Metadata = {
  title: "博客",
  description: "浏览我们的最新文章和资讯",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string; category_id?: string; tag_id?: string; q?: string }>
}

export default async function BlogPage({ params, searchParams }: Props) {
  await params
  const sp = await searchParams
  const page = sp.page ? parseInt(sp.page, 10) : 1
  const [locale, authHeaders] = await Promise.all([getLocale(), getAuthHeaders()])
  const dict = getBlogDictionary(locale)

  const [result, categories, tags] = await Promise.all([
    listBlogPosts({
      page,
      limit: 12,
      category_id: sp.category_id,
      tag_id: sp.tag_id,
      q: sp.q,
    }),
    listBlogCategories(authHeaders as Record<string, string>),
    listBlogTags(),
  ])

  return (
    <BlogListTemplate
      posts={result.posts}
      total={result.total}
      page={page}
      limit={12}
      categories={categories}
      tags={tags}
      searchParams={sp}
      dict={dict}
    />
  )
}
