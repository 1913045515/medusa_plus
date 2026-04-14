import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogPost, getRelatedPosts, getAdjacentPosts, getBlogComments } from "@lib/data/blog"
import { retrieveCustomer } from "@lib/data/customer"
import { getLocale } from "@lib/data/locale-actions"
import { getBlogDictionary } from "@lib/i18n/dictionaries"
import BlogDetailTemplate from "@modules/blog/templates/blog-detail"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{ preview?: string; password?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  try {
    const post = await getBlogPost(slug, { preview: sp.preview })
    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      openGraph: {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt || undefined,
        type: "article",
        publishedTime: post.published_at || undefined,
        images: post.cover_image ? [{ url: post.cover_image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt || undefined,
        images: post.cover_image ? [post.cover_image] : undefined,
      },
    }
  } catch {
    return { title: "文章详情" }
  }
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  let post
  try {
    post = await getBlogPost(slug, { preview: sp.preview, password: sp.password })
  } catch (err: any) {
    if (err.message?.includes("403") || err.message?.includes("password")) {
      return <BlogDetailTemplate post={null} passwordProtected slug={slug} />
    }
    notFound()
  }

  if (!post) notFound()

  const [related, adjacent, comments, customer, locale] = await Promise.all([
    getRelatedPosts(post.id).catch(() => []),
    getAdjacentPosts(post.id).catch(() => ({ prev: null, next: null })),
    post.allow_comments ? getBlogComments(post.id).catch(() => []) : Promise.resolve([]),
    retrieveCustomer().catch(() => null),
    getLocale().catch(() => null),
  ])
  const dict = getBlogDictionary(locale)

  return (
    <BlogDetailTemplate
      post={post}
      related={related}
      adjacent={adjacent}
      comments={comments}
      customer={customer}
      dict={dict}
      passwordProtected={false}
      slug={slug}
    />
  )
}
