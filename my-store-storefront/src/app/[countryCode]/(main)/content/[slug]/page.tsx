import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getContentPage } from "@lib/data/content-pages"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getContentPage(slug)
  if (!page) return { title: "Page not found" }
  return {
    title: page.seo_title || page.title,
    description: page.seo_description || undefined,
  }
}

export default async function ContentPageRoute({ params }: Props) {
  const { countryCode, slug } = await params
  const page = await getContentPage(slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero header */}
      <div className="border-b border-neutral-100 bg-neutral-50">
        <div className="content-container py-10 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-5">
            <Link href={`/${countryCode}`} className="hover:text-neutral-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-neutral-600">{page.title}</span>
          </nav>
          {/* Page title */}
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Content body */}
      <div className="content-container py-12 max-w-4xl">
        <div className="max-w-3xl">
          {page.body ? (
            <div
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
          ) : (
            <p className="text-neutral-400 italic">This page has no content yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
