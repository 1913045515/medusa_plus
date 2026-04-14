import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../modules/blog/services/blog.service"

// GET /store/blog-categories/:slug
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const category = await svc.getCategoryBySlug(req.params.slug)
  if (!category) return res.status(404).json({ message: "Category not found" })
  res.json({ category })
}
