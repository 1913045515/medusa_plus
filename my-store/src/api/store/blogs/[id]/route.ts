import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../modules/blog/services/blog.service"
import { blogMediaService } from "../../../../modules/blog/services/media.service"

// GET /store/blogs/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const { id } = req.params
  const isSlug = !id.startsWith("blog_")
  const post = isSlug
    ? await svc.getPostBySlug(id)
    : await svc.getPostById(id)

  if (!post) return res.status(404).json({ message: "Post not found" })

  // Check preview token (bypass publish check for admin preview)
  const previewToken = req.query.preview as string | undefined
  const isPreview = previewToken && previewToken === process.env.BLOG_PREVIEW_TOKEN

  if (!isPreview && post.status !== "published") {
    return res.status(404).json({ message: "Post not found" })
  }

  // Visibility check
  const customer_id = (req as any).auth_context?.actor_id || undefined
  if (!isPreview && post.visibility !== "all") {
    if (post.visibility === "user") {
      const userIds: string[] = post.visibility_user_ids || []
      if (!customer_id || !userIds.includes(customer_id)) {
        return res.status(404).json({ message: "Post not found" })
      }
    }
    if (post.visibility === "group") {
      if (!customer_id) return res.status(404).json({ message: "Post not found" })
      const groupIds = await svc.getCustomerGroupIds(customer_id)
      const visGroupIds: string[] = post.visibility_group_ids || []
      const hasAccess = visGroupIds.some((g: string) => groupIds.includes(g))
      if (!hasAccess) return res.status(404).json({ message: "Post not found" })
    }
  }

  // Password check
  const { password: submitPw } = req.query as { password?: string }
  if (!isPreview && post.password) {
    if (!submitPw || submitPw !== post.password) {
      return res.status(403).json({
        message: "Password required",
        password_protected: true,
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          cover_image: post.cover_image,
          published_at: post.published_at,
        },
      })
    }
  }

  const tags = await svc.getPostTags(post.id)
  const cover_image_signed_url = await blogMediaService.signUrl(post.cover_image || "")
  res.json({ post: { ...post, tags, cover_image_signed_url } })
}
