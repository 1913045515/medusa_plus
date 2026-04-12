import { model } from "@medusajs/framework/utils"

const StoreSetting = model.define("store_settings", {
  id: model.id().primaryKey(),
  cart_enabled: model.boolean().default(true),
})

export default StoreSetting
