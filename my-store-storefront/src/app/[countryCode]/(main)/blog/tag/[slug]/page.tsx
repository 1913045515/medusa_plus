import { listBlogPosts, listBlogCategories, listBlogTags } from "@lib/data/blog"
import { getLocale } from "@lib/data/locale-actions"
import { getAuthHeaders } from "@lib/data/cookies"
import { getBlogDictionary } from "@lib/i18n/dictionaries"
import BlogListTemplate from "@modules/blog/templates/blog-list"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function BlogTagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const page = sp.page ? parseInt(sp.page, 10) : 1

  const [authHeaders, tags, locale] = await Promise.all([getAuthHeaders(), listBlogTags(), getLocale().catch(() => null)])
  const categories = await listBlogCategories(authHeaders as Record<string, string>)
  const tag = tags.find((t) => t.slug === slug)
  const dict = getBlogDictionary(locale)

  const result = await listBlogPosts({
    page,
    limit: 12,
    tag_id: tag?.id,
  })

  return (
    <BlogListTemplate
      posts={result.posts}
      total={result.total}
      page={page}
      limit={12}
      categories={categories}
      tags={tags}
      searchParams={{ tag_id: tag?.id, page: String(page) }}
      pageTitle={tag ? `${dict?.tagPrefix ?? "Tag"}: ${tag.name}` : slug}
      dict={dict}
    />
  )
}
