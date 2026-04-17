import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TicketService } from "../../../../modules/ticket"

// POST /store/tickets/migrate
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const body = req.body as any

  if (!body.guest_token || !body.customer_email) {
    return res.status(400).json({ message: "guest_token and customer_email are required" })
  }

  const migrated = await svc.migrateGuestTickets(body.guest_token, body.customer_email)
  res.json({ migrated })
}
