// ─── Product Detail (Rich Text) ──────────────────────────────────────────────

export type ProductDetailRecord = {
  id: string
  product_id: string
  long_desc_html: string | null
  created_at: string
  updated_at: string
}

export type CreateProductDetailInput = {
  product_id: string
  long_desc_html?: string | null
}

export type UpdateProductDetailInput = {
  long_desc_html?: string | null
}

// ─── Product Image Meta ──────────────────────────────────────────────────────

export type ProductImageMetaRecord = {
  id: string
  product_id: string
  image_id: string
  is_main: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type UpsertProductImageMetaInput = {
  image_id: string
  is_main: boolean
  sort_order: number
}
