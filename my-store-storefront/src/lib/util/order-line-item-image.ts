import { HttpTypes } from "@medusajs/types"

type ProductImageLike = {
  url?: string | null
} | null

type ProductLike = {
  thumbnail?: string | null
  images?: ProductImageLike[] | null
} | null

type LineItemLike = Pick<HttpTypes.StoreOrderLineItem, "thumbnail" | "product" | "variant">

const pickFirstImageList = (products: ProductLike[]): ProductImageLike[] => {
  for (const product of products) {
    if (product?.images?.length) {
      return product.images
    }
  }

  return []
}

export const getOrderLineItemImage = (item: LineItemLike) => {
  const directProduct = item.product as ProductLike
  const variantProduct = (item.variant?.product as ProductLike | undefined) ?? null
  const productCandidates = [directProduct, variantProduct]

  const thumbnail =
    item.thumbnail ||
    directProduct?.thumbnail ||
    variantProduct?.thumbnail ||
    null

  return {
    thumbnail,
    images: pickFirstImageList(productCandidates),
  }
}