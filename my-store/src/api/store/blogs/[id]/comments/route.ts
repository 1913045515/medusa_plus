import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"

// GET /store/blogs/:id/comments
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const comments = await svc.listComments(req.params.id, "approved")
  res.json({ comments })
}

// POST /store/blogs/:id/comments
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const customer_id = (req as any).auth_context?.actor_id
  if (!customer_id) return res.status(401).json({ message: "Authentication required" })

  // Check post allows comments
  const post = await svc.getPostById(req.params.id)
  if (!post) return res.status(404).json({ message: "Post not found" })
  if (!post.allow_comments) return res.status(403).json({ message: "Comments are closed for this post" })

  const { content } = req.body as { content: string }
  if (!content?.trim()) return res.status(400).json({ message: "Content is required" })

  const comment = await svc.createComment({
    post_id: req.params.id,
    customer_id,
    content: content.trim(),
  })

  res.status(201).json({ comment })
}
