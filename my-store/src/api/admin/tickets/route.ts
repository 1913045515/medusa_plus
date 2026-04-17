import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TicketService } from "../../../modules/ticket"

// GET /admin/tickets
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const query = req.query as Record<string, string>

  const result = await svc.listTickets({
    status: query.status as any,
    q: query.q,
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 20,
  })

  res.json(result)
}
