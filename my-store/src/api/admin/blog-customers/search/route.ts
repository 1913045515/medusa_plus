import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /admin/blog-customers/search?q=keyword&limit=10
// Search customers by email or first_name/last_name (nickname)
// Also supports ?ids=id1,id2,id3 for batch lookup by IDs
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const q = (req.query.q as string || "").trim()
  const idsParam = (req.query.ids as string || "").trim()
  const limit = Math.min(parseInt(req.query.limit as string || "10", 10), 50)

  // Batch lookup by IDs
  if (idsParam) {
    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 100)
    if (ids.length === 0) return res.json({ customers: [] })
    const customers = await knex("customer")
      .select("id", "email", "first_name", "last_name", "created_at", "updated_at")
      .whereIn("id", ids)
      .whereNull("deleted_at")
    return res.json({ customers })
  }

  if (!q) {
    return res.json({ customers: [] })
  }

  const pattern = `%${q}%`

  const customers = await knex("customer")
    .select("id", "email", "first_name", "last_name", "created_at", "updated_at")
    .where(function () {
      this.whereILike("email", pattern)
        .orWhereILike("first_name", pattern)
        .orWhereILike("last_name", pattern)
    })
    .whereNull("deleted_at")
    .orderBy("created_at", "desc")
    .limit(limit)

  return res.json({ customers })
}
