import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BlogService } from "../../../modules/blog/services/blog.service"

// GET /store/search?q=keyword&limit=5
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const q = ((req.query.q as string) || "").trim()
  const limit = Math.min(parseInt((req.query.limit as string) || "5", 10), 20)

  if (!q || q.length < 2) {
    res.json({ blogs: [], products: [], courses: [], total: 0 })
    return
  }

  const knex = req.scope.resolve(
    ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection"
  )

  const pattern = `%${q}%`

  // Get customer visibility context (same as /store/blogs)
  const blogSvc = new BlogService(req.scope)
  const customer_id = (req as any).auth_context?.actor_id || undefined
  let visibility_group_ids: string[] | undefined
  if (customer_id) {
    visibility_group_ids = await blogSvc.getCustomerGroupIds(customer_id)
  }

  const blogResult = await blogSvc.listPosts({
    status: "published",
    q,
    visibility_customer_id: customer_id,
    visibility_group_ids,
    page: 1,
    limit,
  })

  const [products, courses] = await Promise.all([
    knex("product")
      .select("id", "title", "handle", "thumbnail", "description")
      .where("status", "published")
      .whereNull("deleted_at")
      .where(function () {
        this.whereRaw("title ILIKE ?", [pattern])
          .orWhereRaw("description ILIKE ?", [pattern])
      })
      .orderBy("created_at", "desc")
      .limit(limit),

    knex("course")
      .select("id", "title", "handle", "description", "thumbnail_url")
      .where("status", "published")
      .whereNull("deleted_at")
      .where(function () {
        this.whereRaw("title ILIKE ?", [pattern])
          .orWhereRaw("description ILIKE ?", [pattern])
      })
      .orderBy("created_at", "desc")
      .limit(limit),
  ])

  const blogs = blogResult.posts.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    cover_image: p.cover_image,
  }))

  res.json({
    blogs,
    products,
    courses,
    total: blogs.length + products.length + courses.length,
  })
}
