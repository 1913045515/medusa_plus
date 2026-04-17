import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

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

  const [blogs, products, courses] = await Promise.all([
    knex("blog_post")
      .select("id", "title", "slug", "excerpt", "cover_image")
      .where("status", "published")
      .whereNull("deleted_at")
      .where(function () {
        this.whereILike("title", pattern).orWhereILike("excerpt", pattern)
      })
      .orderBy("published_at", "desc")
      .limit(limit),

    knex("product")
      .select("id", "title", "handle", "thumbnail", "description")
      .where("status", "published")
      .whereNull("deleted_at")
      .where(function () {
        this.whereILike("title", pattern).orWhereILike("description", pattern)
      })
      .orderBy("created_at", "desc")
      .limit(limit),

    knex("course")
      .select("id", "title", "handle", "description", "thumbnail_url")
      .where("status", "published")
      .whereNull("deleted_at")
      .where(function () {
        this.whereILike("title", pattern).orWhereILike("description", pattern)
      })
      .orderBy("created_at", "desc")
      .limit(limit),
  ])

  res.json({
    blogs,
    products,
    courses,
    total: blogs.length + products.length + courses.length,
  })
}
