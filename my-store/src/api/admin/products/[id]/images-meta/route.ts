import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { productImageMetaService, setProductDetailModuleScope } from "../../../../../modules/product-detail"
import type { UpsertProductImageMetaInput } from "../../../../../modules/product-detail/types"

// GET /admin/products/:id/images-meta
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setProductDetailModuleScope(req.scope)
  const productId = req.params.id
  const images = await productImageMetaService.getByProductId(productId)
  res.json({ images })
}

// PUT /admin/products/:id/images-meta
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  setProductDetailModuleScope(req.scope)
  const productId = req.params.id
  const { images } = req.body as { images: UpsertProductImageMetaInput[] }
  if (!Array.isArray(images)) {
    res.status(400).json({ message: "images must be an array" })
    return
  }
  const result = await productImageMetaService.bulkUpsert(productId, images)
  res.json({ images: result })
}
