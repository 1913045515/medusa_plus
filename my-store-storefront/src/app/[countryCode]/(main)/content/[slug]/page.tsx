import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getContentPage } from "@lib/data/content-pages"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getContentPage(slug)
  if (!page) return { title: "页面未找到" }
  return {
    title: page.seo_title || page.title,
    description: page.seo_description || undefined,
  }
}

export default async function ContentPageRoute({ params }: Props) {
  const { slug } = await params
  const page = await getContentPage(slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="content-container py-12 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8 text-ui-fg-base">{page.title}</h1>
      {page.body ? (
        <div
          className="prose prose-sm max-w-none text-ui-fg-subtle"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      ) : (
        <p className="text-ui-fg-subtle">此页面暂无内容。</p>
      )}
    </div>
  )
}
