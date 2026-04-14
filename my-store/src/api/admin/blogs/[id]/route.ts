import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../modules/blog/services/blog.service"
import { blogMediaService } from "../../../../modules/blog/services/media.service"

function getBlogService(req: MedusaRequest) {
  return new BlogService(req.scope)
}

async function withSignedCoverImage(post: any): Promise<any> {
  if (!post?.cover_image) return post
  const signed = await blogMediaService.signUrl(post.cover_image)
  return { ...post, cover_image_signed_url: signed }
}

// GET /admin/blogs/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getBlogService(req)
  const post = await svc.getPostById(req.params.id)
  if (!post) return res.status(404).json({ message: "Post not found" })
  const tags = await svc.getPostTags(req.params.id)
  res.json({ post: await withSignedCoverImage({ ...post, tags }) })
}

// PATCH /admin/blogs/:id
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getBlogService(req)
  const updated_by = (req as any).auth_context?.actor_id || undefined
  const post = await svc.updatePost(req.params.id, req.body as any, updated_by)
  if (!post) return res.status(404).json({ message: "Post not found" })
  res.json({ post })
}

// DELETE /admin/blogs/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = getBlogService(req)
  await svc.softDeletePost(req.params.id)
  res.json({ success: true })
}
