import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../modules/blog/services/blog.service"

// GET /store/blogs
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const query = req.query as Record<string, string>

  // Get customer context for visibility
  const customer_id = (req as any).auth_context?.actor_id || undefined
  let visibility_group_ids: string[] | undefined
  if (customer_id) {
    visibility_group_ids = await svc.getCustomerGroupIds(customer_id)
  }

  const result = await svc.listPosts({
    status: "published",
    category_id: query.category_id,
    tag_id: query.tag_id,
    q: query.q,
    visibility_customer_id: customer_id,
    visibility_group_ids,
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 12,
  })

  // Bucket is public — cover_image permanent URL is directly accessible
  res.json(result)
}
