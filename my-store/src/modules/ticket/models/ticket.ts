import { model } from "@medusajs/framework/utils"

const Ticket = model.define("ticket", {
  id: model.id().primaryKey(),
  title: model.text(),
  status: model.text().default("open"),
  customer_email: model.text().nullable(),
  guest_token: model.text().nullable(),
  resolved_at: model.dateTime().nullable(),
})

export default Ticket
