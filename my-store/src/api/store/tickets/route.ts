import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TicketService } from "../../../modules/ticket"

// GET /store/tickets
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const query = req.query as Record<string, string>

  const customer_email = (req as any).auth_context?.actor_id ? undefined : undefined
  // Resolve customer email from auth context actor
  const actorId = (req as any).auth_context?.actor_id
  let resolvedEmail: string | undefined
  if (actorId) {
    // actor_id is the customer id; we use email from query or rely on guest_token fallback
    resolvedEmail = query.customer_email
  }

  const result = await svc.listTickets({
    customer_email: resolvedEmail,
    guest_token: query.guest_token,
    status: query.status as any,
    q: query.q,
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 20,
  })

  res.json(result)
}

// POST /store/tickets
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const body = req.body as any

  const result = await svc.createTicket({
    title: body.title,
    content: body.content,
    customer_email: body.customer_email,
    guest_token: body.guest_token,
  })

  res.status(201).json(result)
}
