const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY
  if (!key) {
    throw new Error("Missing publishable key. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in my-store-storefront/.env.local")
  }
  return key
}

function storeHeaders() {
  return {
    "x-publishable-api-key": getPublishableKey(),
  }
}

export type ContentPageItem = {
  title: string
  footer_label: string | null
  slug: string
  sort_order: number
}

export type ContentPageDetail = {
  title: string
  body: string | null
  seo_title: string | null
  seo_description: string | null
  slug: string
  published_at: string | null
}

export async function getContentPage(slug: string): Promise<ContentPageDetail | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/content-pages/${encodeURIComponent(slug)}`, {
      headers: storeHeaders(),
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.content_page ?? null
  } catch {
    return null
  }
}

export async function getFooterContentPages(): Promise<ContentPageItem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/store/content-pages?show_in_footer=true`, {
      headers: storeHeaders(),
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.content_pages ?? []
  } catch {
    return []
  }
}
