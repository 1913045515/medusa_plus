import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../modules/blog/services/blog.service"

function getBlogService(req: MedusaRequest) {
  return new BlogService(req.scope)
}

// GET /admin/blogs
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getBlogService(req)
  const query = req.query as Record<string, string>
  const result = await svc.listPosts({
    status: query.status as any,
    category_id: query.category_id,
    tag_id: query.tag_id,
    q: query.q,
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 20,
    include_deleted: false,
    skip_visibility_filter: true,
  })
  res.json(result)
}

// POST /admin/blogs
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getBlogService(req)
  const author_id = (req as any).auth_context?.actor_id || undefined
  const post = await svc.createPost(req.body as any, author_id)
  res.status(201).json({ post })
}
