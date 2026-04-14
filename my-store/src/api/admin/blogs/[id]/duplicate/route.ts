import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"

// POST /admin/blogs/:id/duplicate
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const author_id = (req as any).auth_context?.actor_id || undefined
  const post = await svc.duplicatePost(req.params.id, author_id)
  res.status(201).json({ post })
}
