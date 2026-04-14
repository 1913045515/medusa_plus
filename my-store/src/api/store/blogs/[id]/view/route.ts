import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"

// POST /store/blogs/:id/view
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  const customer_id = (req as any).auth_context?.actor_id || undefined
  await svc.recordView(req.params.id, ip, customer_id)
  res.json({ success: true })
}
