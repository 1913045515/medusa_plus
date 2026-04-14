import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"

// GET /admin/blogs/:id/versions
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const versions = await svc.listVersions(req.params.id)
  res.json({ versions })
}

// POST /admin/blogs/:id/versions  (restore)
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const { version_id } = req.body as { version_id: string }
  const restored_by = (req as any).auth_context?.actor_id || undefined
  const post = await svc.restoreVersion(req.params.id, version_id, restored_by)
  res.json({ post })
}

// DELETE /admin/blogs/:id/versions  (batch delete)
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const { version_ids } = req.body as { version_ids: string[] }
  if (!Array.isArray(version_ids) || version_ids.length === 0) {
    return res.status(400).json({ message: "version_ids must be a non-empty array" })
  }
  await svc.deleteVersions(req.params.id, version_ids)
  res.json({ success: true })
}
