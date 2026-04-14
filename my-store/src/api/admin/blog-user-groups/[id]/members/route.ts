import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"

// POST /admin/blog-user-groups/:id/members
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const { customer_id } = req.body as { customer_id: string }
  const member = await svc.addGroupMember(req.params.id, customer_id)
  res.status(201).json({ member })
}

// DELETE /admin/blog-user-groups/:id/members
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const { customer_id } = req.body as { customer_id: string }
  await svc.removeGroupMember(req.params.id, customer_id)
  res.json({ success: true })
}
