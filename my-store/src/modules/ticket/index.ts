import { Module } from "@medusajs/framework/utils"
import TicketModuleService from "./service"

export const TICKET_MODULE = "ticket"

export * from "./services/ticket.service"

export default Module(TICKET_MODULE, {
  service: TicketModuleService,
})
