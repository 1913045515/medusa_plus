import { model } from "@medusajs/framework/utils"

const PasswordResetToken = model.define("password_reset_token", {
  id: model.id().primaryKey(),
  email: model.text(),
  token: model.text(),
  used: model.boolean().default(false),
  expires_at: model.dateTime(),
})

export default PasswordResetToken
