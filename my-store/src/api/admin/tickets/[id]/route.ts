import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TicketService } from "../../../../modules/ticket"

// GET /admin/tickets/:id — auto-transitions open → pending
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const { id } = req.params

  const result = await svc.getTicket(id)
  if (!result) return res.status(404).json({ message: "Ticket not found" })

  // Auto-mark pending when admin views an open ticket
  if (result.ticket.status === "open") {
    await svc.updateTicketStatus(id, "pending")
    result.ticket.status = "pending"
  }

  res.json(result)
}

// PATCH /admin/tickets/:id — change status
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const { id } = req.params
  const body = req.body as any

  if (!body.status) {
    return res.status(400).json({ message: "status is required" })
  }

  try {
    const ticket = await svc.updateTicketStatus(id, body.status)
    res.json({ ticket })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
