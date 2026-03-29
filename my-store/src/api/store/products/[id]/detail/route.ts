import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { productDetailService, setProductDetailModuleScope } from "../../../../../modules/product-detail"

// GET /store/products/:id/detail
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setProductDetailModuleScope(req.scope)
  const productId = req.params.id
  const record = await productDetailService.getByProductId(productId)
  res.json({
    long_desc_html: record?.long_desc_html ?? null,
  })
}
