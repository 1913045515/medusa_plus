import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TicketService } from "../../../../../modules/ticket"

// POST /admin/tickets/:id/messages — admin reply
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const { id } = req.params
  const body = req.body as any

  if (!body.content) {
    return res.status(400).json({ message: "content is required" })
  }

  try {
    const message = await svc.addMessage({
      ticket_id: id,
      sender_type: "admin",
      content: body.content,
    })
    res.status(201).json({ message })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
