import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, toast } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import ProductImagesManager from "./product-images-manager"

type ImageItem = {
  image_id: string
  url: string
  is_main: boolean
  sort_order: number
}

type AdminProductImagesWidgetProps = {
  data: {
    id: string
    images?: Array<{ id: string; url: string }>
  }
}

const ProductImagesWidget = ({ data }: AdminProductImagesWidgetProps) => {
  const { t } = useTranslation()
  const productId = data.id
  const [images, setImages] = useState<ImageItem[]>([])
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const productImages = data.images ?? []

    fetch(`/admin/products/${productId}/images-meta`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        const metaMap = new Map<string, { is_main: boolean; sort_order: number }>()
        for (const m of d.images ?? []) {
          metaMap.set(m.image_id, { is_main: m.is_main, sort_order: m.sort_order })
        }

        // Merge product images with saved meta
        const merged: ImageItem[] = productImages.map((img, idx) => {
          const meta = metaMap.get(img.id)
          return {
            image_id: img.id,
            url: img.url,
            is_main: meta?.is_main ?? (idx === 0),
            sort_order: meta?.sort_order ?? idx,
          }
        })
        merged.sort((a, b) => a.sort_order - b.sort_order)
        setImages(merged)
        setLoaded(true)
      })
      .catch(() => {
        // Fallback: use product images with default order
        setImages(
          productImages.map((img, idx) => ({
            image_id: img.id,
            url: img.url,
            is_main: idx === 0,
            sort_order: idx,
          }))
        )
        setLoaded(true)
      })
  }, [productId, data.images])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const payload = images.map((img, idx) => ({
        image_id: img.image_id,
        is_main: img.is_main,
        sort_order: idx,
      }))
      const res = await fetch(`/admin/products/${productId}/images-meta`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: payload }),
      })
      if (res.ok) {
        toast.success(t("productImages.saveSuccess", "Saved"))
      } else {
        toast.error(t("productImages.saveError", "Save failed"))
      }
    } catch {
      toast.error(t("productImages.saveError", "Save failed"))
    } finally {
      setSaving(false)
    }
  }, [productId, images, t])

  if (!loaded) return null

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <Heading level="h2">
          {t("productImages.sectionTitle", "Product Image Management")}
        </Heading>
        <Button
          variant="primary"
          size="small"
          isLoading={saving}
          onClick={handleSave}
        >
          {t("productImages.saveOrder", "Save Order")}
        </Button>
      </div>
      <div className="px-6 py-4">
        <ProductImagesManager images={images} onChange={setImages} />
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductImagesWidget
