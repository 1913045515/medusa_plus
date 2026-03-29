import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { productImageMetaService, setProductDetailModuleScope } from "../../../../../modules/product-detail"

// GET /store/products/:id/images-meta
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setProductDetailModuleScope(req.scope)
  const productId = req.params.id
  const images = await productImageMetaService.getByProductId(productId)
  // Fallback: if no meta exists, return empty array (storefront will use default order)
  res.json({ images })
}
