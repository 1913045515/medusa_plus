import { model } from "@medusajs/framework/utils"

const ProductImageMeta = model.define("product_image_meta", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  image_id: model.text(),
  is_main: model.boolean().default(false),
  sort_order: model.number().default(0),
})

export default ProductImageMeta
