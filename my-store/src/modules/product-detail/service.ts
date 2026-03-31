import { MedusaService } from "@medusajs/framework/utils"

import ProductDetail from "./models/product-detail"
import ProductImageMeta from "./models/product-image-meta"

class ProductDetailModuleService extends MedusaService({
  ProductDetail,
  ProductImageMeta,
}) {}

export default ProductDetailModuleService
