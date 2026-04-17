import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TicketService } from "../../../../modules/ticket"

// GET /store/tickets/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const { id } = req.params

  const result = await svc.getTicket(id)
  if (!result) return res.status(404).json({ message: "Ticket not found" })

  res.json(result)
}

// PATCH /store/tickets/:id — user closes their own ticket
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const { id } = req.params
  const body = req.body as any

  if (body.status !== "closed") {
    return res.status(400).json({ message: "Users can only close tickets" })
  }

  try {
    const ticket = await svc.updateTicketStatus(id, "closed")
    res.json({ ticket })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
