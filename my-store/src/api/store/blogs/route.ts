import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../modules/blog/services/blog.service"

// GET /store/blogs
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const query = req.query as Record<string, string>

  // Get customer context for visibility
  // Wrap in try-catch to gracefully degrade if group tables are missing
  const customer_id = (req as any).auth_context?.actor_id || undefined
  let visibility_group_ids: string[] = []
  if (customer_id) {
    try {
      visibility_group_ids = await svc.getCustomerGroupIds(customer_id)
    } catch (e) {
      console.error("[BlogRoute] getCustomerGroupIds failed, falling back to anonymous visibility:", e)
    }
  }

  try {
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

    res.json(result)
  } catch (err) {
    console.error("[BlogRoute] listPosts failed:", err)
    // Fall back to anonymous public-only posts on error
    const fallback = await svc.listPosts({
      status: "published",
      category_id: query.category_id,
      tag_id: query.tag_id,
      q: query.q,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 12,
    })
    res.json(fallback)
  }
}
