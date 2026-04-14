import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../modules/blog/services/blog.service"

// PATCH /admin/blog-tags/:id
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const actor_id = (req as any).auth_context?.actor_id || undefined
  const tag = await svc.updateTag(req.params.id, req.body as any, actor_id)
  res.json({ tag })
}

// DELETE /admin/blog-tags/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  await svc.deleteTag(req.params.id)
  res.json({ success: true })
}
