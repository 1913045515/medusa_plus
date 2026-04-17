import { model } from "@medusajs/framework/utils"

const PaypalConfig = model.define("paypal_config", {
  id: model.id().primaryKey(),
  client_id: model.text(),
  client_secret_encrypted: model.text(),
  mode: model.text().default("sandbox"),
  card_fields_enabled: model.boolean().default(false),
})

export default PaypalConfig
