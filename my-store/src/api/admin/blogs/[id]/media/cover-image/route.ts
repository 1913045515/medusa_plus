import { createReadStream } from "node:fs"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { parseAdminUploadRequest } from "../../../../_utils/media-upload"
import { blogMediaService } from "../../../../../../modules/blog/services/media.service"
import { BlogService } from "../../../../../../modules/blog/services/blog.service"

// POST /admin/blogs/:id/media/cover-image
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!blogMediaService.isConfigured()) {
    return res.status(503).json({ message: "Blog S3 media storage is not configured." })
  }

  const svc = new BlogService(req.scope)
  const post = await svc.getPostById(req.params.id)
  if (!post) return res.status(404).json({ message: "Blog post not found" })

  const upload = await parseAdminUploadRequest(req, blogMediaService.getMaxFileSizeBytes())
  try {
    const asset = await blogMediaService.upload(
      { entity: "post", entity_id: req.params.id, field: "cover_image" },
      upload.file_name,
      upload.mime_type,
      upload.size_bytes,
      createReadStream(upload.temp_file_path)
    )

    // If the post already had a cover image from S3, delete the old object
    if ((post as any).cover_image_asset) {
      await blogMediaService.delete((post as any).cover_image_asset).catch(() => undefined)
    }

    // Update the post cover_image URL
    await svc.updatePost(req.params.id, { cover_image: asset.permanent_url })

    // Bucket is public — return permanent URL directly
    return res.status(200).json({
      cover_image: asset.permanent_url,
      asset,
    })
  } finally {
    await upload.cleanup()
  }
}

// DELETE /admin/blogs/:id/media/cover-image
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const post = await svc.getPostById(req.params.id)
  if (!post) return res.status(404).json({ message: "Blog post not found" })

  await svc.updatePost(req.params.id, { cover_image: null })
  return res.json({ success: true })
}
