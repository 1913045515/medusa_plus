import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { TicketService } from "../../../modules/ticket"

// GET /store/tickets
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new TicketService(req.scope)
  const query = req.query as Record<string, string>

  // When the customer is authenticated, enforce data ownership: only return
  // tickets belonging to their account. Do NOT honour the client-supplied
  // customer_email query param for authenticated users.
  const actorId = (req as any).auth_context?.actor_id as string | undefined
  let resolvedEmail: string | undefined
  let resolvedGuestToken: string | undefined

  if (actorId) {
    // actor_id is the customer id — resolve their email from the Customers module
    try {
      const customerService = req.scope.resolve(Modules.CUSTOMER)
      const customer = await customerService.retrieveCustomer(actorId).catch(() => null)
      resolvedEmail = customer?.email ?? undefined
    } catch {
      // If resolution fails fall back to no filter; an empty result is safer than a leak
      resolvedEmail = "__no_match__"
    }
  } else {
    // Unauthenticated — allow guest_token lookup only (never bare email from params)
    resolvedGuestToken = query.guest_token
  }

  const result = await svc.listTickets({
    customer_email: resolvedEmail,
    guest_token: resolvedGuestToken,
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
