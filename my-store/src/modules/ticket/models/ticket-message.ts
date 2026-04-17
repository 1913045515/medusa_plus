import { model } from "@medusajs/framework/utils"

const TicketMessage = model.define("ticket_message", {
  id: model.id().primaryKey(),
  ticket_id: model.text(),
  sender_type: model.text(),
  content: model.text(),
})

export default TicketMessage
