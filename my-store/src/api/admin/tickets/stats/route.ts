import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TicketService } from "../../../../modules/ticket"

// GET /admin/tickets/stats
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const stats = await svc.getTicketStats()
  res.json({ stats })
}
