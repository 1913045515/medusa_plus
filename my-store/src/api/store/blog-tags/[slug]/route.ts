import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../modules/blog/services/blog.service"

// GET /store/blog-tags/:slug
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const tag = await svc.getTagBySlug(req.params.slug)
  if (!tag) return res.status(404).json({ message: "Tag not found" })
  res.json({ tag })
}
