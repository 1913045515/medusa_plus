const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY

  if (!key) {
    throw new Error(
      "Missing publishable key. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in my-store-storefront/.env.local"
    )
  }
  return key
}

const baseHeaders: Record<string, string> = {
  "x-publishable-api-key": "",
}

function headers(): Record<string, string> {
  return { "x-publishable-api-key": getPublishableKey() }
}

export async function getProductDetail(
  productId: string
): Promise<{ long_desc_html: string | null }> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/products/${productId}/detail`,
      { method: "GET", headers: headers(), cache: "no-store" }
    )
    if (!res.ok) return { long_desc_html: null }
    return (await res.json()) as { long_desc_html: string | null }
  } catch {
    return { long_desc_html: null }
  }
}

export type ProductImageMetaItem = {
  id: string
  product_id: string
  image_id: string
  is_main: boolean
  sort_order: number
}

export async function getProductImagesMeta(
  productId: string
): Promise<ProductImageMetaItem[]> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/products/${productId}/images-meta`,
      { method: "GET", headers: headers(), cache: "no-store" }
    )
    if (!res.ok) return []
    const data = (await res.json()) as { images?: ProductImageMetaItem[] }
    return data.images ?? []
  } catch {
    return []
  }
}
