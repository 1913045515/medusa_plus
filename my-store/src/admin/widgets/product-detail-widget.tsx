import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, toast } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import ProductDetailEditor from "../components/product-detail-editor"

type AdminProductDetailWidgetProps = {
  data: { id: string; description?: string | null }
}

const ProductDetailWidget = ({ data }: AdminProductDetailWidgetProps) => {
  const { t } = useTranslation()
  const productId = data.id

  // Description = native product.description (rich text, replaces plain-text field)
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

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      // Save short description via native Medusa Admin API
      const shortRes = await fetch(`/admin/products/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: shortHtml || "" }),
      })
      // Save long description via custom API
      const longRes = await fetch(`/admin/products/${productId}/detail`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ long_desc_html: longHtml || null }),
      })
      if (shortRes.ok && longRes.ok) {
        toast.success(t("productDetail.saveSuccess", "Saved"))
      } else {
        toast.error(t("productDetail.saveError", "Save failed"))
      }
    } catch {
      toast.error(t("productDetail.saveError", "Save failed"))
    } finally {
      setSaving(false)
    }
  }, [productId, shortHtml, longHtml, t])

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <Heading level="h2">
          {t("productDetail.sectionTitle", "Product Descriptions (Rich Text)")}
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

      {/* Description — edits native product.description (same field as General Information) */}
      <div className="px-6 py-4 border-b border-ui-border-base">
        <Heading level="h3" className="text-sm font-medium text-ui-fg-subtle mb-2">
          {t("productDetail.shortDescLabel", "Description")}
        </Heading>
        <p className="text-xs text-ui-fg-muted mb-3">
          {t("productDetail.shortDescHint", "Edits the product Description field with rich text support. Use this instead of the plain text field above.")}
        </p>
        <ProductDetailEditor value={shortHtml} onChange={setShortHtml} />
      </div>

      {/* Long Description — edits custom long_desc_html */}
      <div className="px-6 py-4">
        <Heading level="h3" className="text-sm font-medium text-ui-fg-subtle mb-2">
          {t("productDetail.longDescLabel", "Long Description")}
        </Heading>
        <p className="text-xs text-ui-fg-muted mb-3">
          {t("productDetail.longDescHint", "Displayed below the product images as a full-width content section.")}
        </p>
        {longLoading ? (
          <div className="h-32 flex items-center justify-center text-ui-fg-muted text-sm">
            {t("productDetail.loading", "Loading...")}
          </div>
        ) : (
          <ProductDetailEditor value={longHtml} onChange={setLongHtml} />
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductDetailWidget

