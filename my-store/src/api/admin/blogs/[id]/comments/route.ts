import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"

// GET /admin/blogs/:id/comments
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const status = req.query.status as string | undefined
  const comments = await svc.listComments(req.params.id, status)
  res.json({ comments })
}

// PATCH /admin/blogs/:id/comments  — bulk or single status update
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const { comment_id, status } = req.body as { comment_id: string; status: "approved" | "rejected" }
  const comment = await svc.updateCommentStatus(comment_id, status)
  res.json({ comment })
}

// DELETE /admin/blogs/:id/comments
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const { comment_id } = req.body as { comment_id: string }
  await svc.deleteComment(comment_id)
  res.json({ success: true })
}
