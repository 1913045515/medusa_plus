import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"

// GET /store/blogs/:id/adjacent
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const adjacent = await svc.getAdjacentPosts(req.params.id)
  res.json(adjacent)
}
