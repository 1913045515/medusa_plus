import { MedusaService } from "@medusajs/framework/utils"
import Ticket from "./models/ticket"
import TicketMessage from "./models/ticket-message"

class TicketModuleService extends MedusaService({
  Ticket,
  TicketMessage,
}) {}

export default TicketModuleService
