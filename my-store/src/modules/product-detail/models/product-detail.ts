import { model } from "@medusajs/framework/utils"

const ProductDetail = model.define("product_detail", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  long_desc_html: model.text().nullable(),
})

export default ProductDetail
