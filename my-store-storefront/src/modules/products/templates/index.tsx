import React, { Suspense } from "react"

import ImageCarousel from "@modules/products/components/image-carousel"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import ProductRichtext from "@modules/products/components/product-richtext"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ImageWithMeta = {
  id: string
  url: string
  is_main?: boolean
  sort_order: number
}

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  longDescHtml?: string | null
  imagesMeta?: Array<{
    image_id: string
    is_main: boolean
    sort_order: number
  }>
  dict?: {
    productDetails: string
    shortDescription: string
    longDescription: string
    previousImage: string
    nextImage: string
  }
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
  longDescHtml,
  imagesMeta,
  dict,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // Merge images with meta for sorting & main flag
  const metaMap = new Map(
    (imagesMeta ?? []).map((m) => [m.image_id, m])
  )
  const carouselImages: ImageWithMeta[] = images
    .map((img, idx) => {
      const meta = metaMap.get(img.id)
      return {
        id: img.id,
        url: img.url?.trim() ?? "",
        is_main: meta?.is_main ?? (idx === 0 && !imagesMeta?.length),
        sort_order: meta?.sort_order ?? idx,
      }
    })
    .filter((img) => img.url.length > 0)
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <>
      {/* Left-right split layout — mobile stacks vertically */}
      <div
        className="content-container flex flex-col medium:flex-row medium:items-start gap-8 py-10 medium:py-14 relative"
        data-testid="product-container"
      >
        {/* Left: Image Carousel (50%) */}
        <div className="w-full medium:w-1/2 medium:sticky medium:top-28">
          <ImageCarousel
            images={carouselImages}
            dict={{
              previousImage: dict?.previousImage ?? "Previous",
              nextImage: dict?.nextImage ?? "Next",
            }}
          />
        </div>

        {/* Right: Product Info (50%) */}
        <div className="w-full medium:w-1/2 flex flex-col gap-y-4">
          <ProductInfo product={product} />

          {/* Short description — native product.description rendered as rich text */}
          {product.description && (
            <ProductRichtext
              html={product.description}
            />
          )}

          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>

          <ProductTabs product={product} />
        </div>
      </div>

      {/* Long description — full-width section below the split layout */}
      {longDescHtml && (
        <div className="border-t border-ui-border-base">
          <div className="content-container py-6 medium:py-8">
            <ProductRichtext
              html={longDescHtml}
            />
          </div>
        </div>
      )}
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
