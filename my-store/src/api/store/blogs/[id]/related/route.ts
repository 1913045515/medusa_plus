import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"

// GET /store/blogs/:id/related
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  // Bucket is public — cover_image permanent URLs are directly accessible
  const posts = await svc.getRelated(req.params.id, 3)
  res.json({ posts })
}
