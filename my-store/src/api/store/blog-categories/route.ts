import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../modules/blog/services/blog.service"

// GET /store/blog-categories
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)

  const customer_id = (req as any).auth_context?.actor_id as string | undefined
  let visibility_group_ids: string[] = []
  if (customer_id) {
    try {
      visibility_group_ids = await svc.getCustomerGroupIds(customer_id)
    } catch {
      // ignore — fall back to public-only counts
    }
  }

  const categories = await svc.listCategories({
    visibility_customer_id: customer_id,
    visibility_group_ids,
  })
  res.json({ categories })
}
