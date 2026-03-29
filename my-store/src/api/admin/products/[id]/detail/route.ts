import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { productDetailService, setProductDetailModuleScope } from "../../../../../modules/product-detail"

// GET /admin/products/:id/detail
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setProductDetailModuleScope(req.scope)
  const productId = req.params.id
  const record = await productDetailService.getByProductId(productId)
  res.json({
    long_desc_html: record?.long_desc_html ?? null,
  })
}

// PUT /admin/products/:id/detail
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  setProductDetailModuleScope(req.scope)
  const productId = req.params.id
  const { long_desc_html } = req.body as {
    long_desc_html?: string | null
  }
  const record = await productDetailService.upsert(productId, { long_desc_html })
  res.json({
    long_desc_html: record.long_desc_html,
  })
}
