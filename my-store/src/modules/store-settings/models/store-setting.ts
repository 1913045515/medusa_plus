import { model } from "@medusajs/framework/utils"

const StoreSetting = model.define("store_settings", {
  id: model.id().primaryKey(),
  cart_enabled: model.boolean().default(true),
  checkout_field_config: model.text().nullable(),
  email_proxy_config: model.text().nullable(),
  email_templates_config: model.text().nullable(),
})

export default StoreSetting
