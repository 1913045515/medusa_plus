import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../../modules/blog/services/blog.service"
import { blogMediaService } from "../../../../../modules/blog/services/media.service"

// GET /store/blogs/:id/related
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const rawPosts = await svc.getRelated(req.params.id, 3)
  const posts = await Promise.all(
    rawPosts.map(async (post: any) => {
      if (!post.cover_image) return post
      const cover_image_signed_url = await blogMediaService.signUrl(post.cover_image)
      return { ...post, cover_image_signed_url }
    })
  )
  res.json({ posts })
}
