import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TicketService } from "../../../../../modules/ticket"

// POST /store/tickets/:id/messages
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const { id } = req.params
  const body = req.body as any

  // Rate limit guests
  const guestToken = body.guest_token
  if (guestToken) {
    const allowed = await svc.checkGuestRateLimit(guestToken)
    if (!allowed) {
      return res.status(429).json({ message: "Too many messages. Please try again later." })
    }
  }

  try {
    const message = await svc.addMessage({
      ticket_id: id,
      sender_type: "user",
      content: body.content,
    })
    res.status(201).json({ message })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
