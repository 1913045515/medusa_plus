import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../modules/blog/services/blog.service"

// GET /admin/blog-categories
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const categories = await svc.listCategories()
  res.json({ categories })
}

// POST /admin/blog-categories
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const actor_id = (req as any).auth_context?.actor_id || undefined
  const category = await svc.createCategory(req.body as any, actor_id)
  res.status(201).json({ category })
}
