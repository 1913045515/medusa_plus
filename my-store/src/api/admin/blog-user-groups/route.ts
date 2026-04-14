import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../modules/blog/services/blog.service"

// GET /admin/blog-user-groups
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const groups = await svc.listUserGroups()
  res.json({ groups })
}

// POST /admin/blog-user-groups
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const actor_id = (req as any).auth_context?.actor_id || undefined
  const group = await svc.createUserGroup(req.body as any, actor_id)
  res.status(201).json({ group })
}
