import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../modules/blog/services/blog.service"

// GET /admin/blog-tags
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const tags = await svc.listTags()
  res.json({ tags })
}

// POST /admin/blog-tags
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const actor_id = (req as any).auth_context?.actor_id || undefined
  const tag = await svc.createTag(req.body as any, actor_id)
  res.status(201).json({ tag })
}
