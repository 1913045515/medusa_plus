import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../modules/blog/services/blog.service"

// PATCH /admin/blog-categories/:id
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const actor_id = (req as any).auth_context?.actor_id || undefined
  const category = await svc.updateCategory(req.params.id, req.body as any, actor_id)
  res.json({ category })
}

// DELETE /admin/blog-categories/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  await svc.deleteCategory(req.params.id)
  res.json({ success: true })
}
