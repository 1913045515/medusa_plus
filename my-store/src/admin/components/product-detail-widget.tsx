import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, toast } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import ProductDetailEditor from "./product-detail-editor"

type AdminProductDetailWidgetProps = {
  data: { id: string; description?: string | null }
}

const ProductDetailWidget = ({ data }: AdminProductDetailWidgetProps) => {
  const { t } = useTranslation()
  const productId = data.id

  // Short description = native product.description (rich text)
  const [shortHtml, setShortHtml] = useState(data.description ?? "")
  // Long description = custom long_desc_html
  const [longHtml, setLongHtml] = useState("")
  const [longLoading, setLongLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!productId) {
      setLongLoading(false)
      return
    }
    fetch(`/admin/products/${productId}/detail`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setLongHtml(d.long_desc_html ?? "")
      })
      .catch(() => {})
      .finally(() => setLongLoading(false))
  }, [productId])

  // Keep shortHtml in sync when parent data changes
  useEffect(() => {
    setShortHtml(data.description ?? "")
  }, [data.description])

  const uploadProductContentImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/admin/product-content-images", {
      method: "POST",
      credentials: "include",
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as any).message ?? `Upload failed: ${res.status}`)
    }
    const data = await res.json()
    return data.url as string
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      // Save short description via native Medusa Admin API
      // Use null for empty string to avoid Medusa validation rejection
      const descriptionValue = shortHtml.trim() ? shortHtml : null
      const shortRes = await fetch(`/admin/products/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: descriptionValue }),
      })
      if (!shortRes.ok) {
        const errJson = await shortRes.json().catch(() => ({}))
        const msg = errJson?.message ?? `${t("productDetail.saveError", "Save failed")} (${shortRes.status})`
        toast.error(msg)
        return
      }
      // Save long description via custom API
      const longRes = await fetch(`/admin/products/${productId}/detail`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ long_desc_html: longHtml.trim() ? longHtml : null }),
      })
      if (!longRes.ok) {
        const errJson = await longRes.json().catch(() => ({}))
        const msg = errJson?.message ?? `${t("productDetail.saveError", "Save failed")} (${longRes.status})`
        toast.error(msg)
        return
      }
      toast.success(t("productDetail.saveSuccess", "Saved"))
    } catch (err: any) {
      toast.error(err?.message ?? t("productDetail.saveError", "Save failed"))
    } finally {
      setSaving(false)
    }
  }, [productId, shortHtml, longHtml, t])

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <Heading level="h2">
          {t("productDetail.sectionTitle", "Product Description (Rich Text)")}
        </Heading>
        <Button
          variant="primary"
          size="small"
          isLoading={saving}
          onClick={handleSave}
        >
          {t("productDetail.save", "Save")}
        </Button>
      </div>

      {/* Short Description — edits native product.description */}
      <div className="px-6 py-4 border-b border-ui-border-base">
        <Heading level="h3" className="text-sm font-medium text-ui-fg-subtle mb-2">
          {t("productDetail.shortDescLabel", "Short Description")}
        </Heading>
        <p className="text-xs text-ui-fg-muted mb-3">
          {t("productDetail.shortDescHint", "Displayed on the right side of product page, next to images.")}
        </p>
        <ProductDetailEditor value={shortHtml} onChange={setShortHtml} onImageUpload={uploadProductContentImage} />
      </div>

      {/* Long Description — edits custom long_desc_html */}
      <div className="px-6 py-4">
        <Heading level="h3" className="text-sm font-medium text-ui-fg-subtle mb-2">
          {t("productDetail.longDescLabel", "Long Description")}
        </Heading>
        <p className="text-xs text-ui-fg-muted mb-3">
          {t("productDetail.longDescHint", "Displayed below images and short description as full-width content.")}
        </p>
        {longLoading ? (
          <div className="h-32 flex items-center justify-center text-ui-fg-muted text-sm">
            {t("productDetail.loading", "Loading...")}
          </div>
        ) : (
          <ProductDetailEditor value={longHtml} onChange={setLongHtml} onImageUpload={uploadProductContentImage} />
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductDetailWidget
