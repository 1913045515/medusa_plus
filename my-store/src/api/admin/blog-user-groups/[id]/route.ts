import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../modules/blog/services/blog.service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /admin/blog-user-groups/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const group = await svc.getUserGroup(req.params.id)
  if (!group) return res.status(404).json({ message: "User group not found" })
  const members = await svc.listGroupMembers(req.params.id)

  // Enrich members with customer info from the customer table
  const customerIds = members.map((m: any) => m.customer_id)
  let customerMap: Record<string, any> = {}
  if (customerIds.length > 0) {
    const customers = await knex("customer")
      .select("id", "email", "first_name", "last_name", "created_at", "updated_at")
      .whereIn("id", customerIds)
    customerMap = Object.fromEntries(customers.map((c: any) => [c.id, c]))
  }

  const enrichedMembers = members.map((m: any) => {
    const cust = customerMap[m.customer_id] || {}
    return {
      id: m.id,
      customer_id: m.customer_id,
      group_id: m.group_id,
      email: cust.email || null,
      first_name: cust.first_name || null,
      last_name: cust.last_name || null,
      customer_created_at: cust.created_at || null,
      customer_updated_at: cust.updated_at || null,
      joined_at: m.created_at,
    }
  })

  res.json({ group: { ...group, members: enrichedMembers } })
}

// PATCH /admin/blog-user-groups/:id
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const actor_id = (req as any).auth_context?.actor_id || undefined
  const group = await svc.updateUserGroup(req.params.id, req.body as any, actor_id)
  res.json({ group })
}

// DELETE /admin/blog-user-groups/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  await svc.deleteUserGroup(req.params.id)
  res.json({ success: true })
}
