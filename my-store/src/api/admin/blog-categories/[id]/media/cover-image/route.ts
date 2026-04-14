import { createReadStream } from "node:fs"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { parseAdminUploadRequest } from "../../../../_utils/media-upload"
import { blogMediaService } from "../../../../../../modules/blog/services/media.service"
import { BlogService } from "../../../../../../modules/blog/services/blog.service"

// POST /admin/blog-categories/:id/media/cover-image
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!blogMediaService.isConfigured()) {
    return res.status(503).json({ message: "Blog S3 media storage is not configured." })
  }

  const svc = new BlogService(req.scope)
  const category = await svc.getCategoryById(req.params.id)
  if (!category) return res.status(404).json({ message: "Blog category not found" })

  const upload = await parseAdminUploadRequest(req, blogMediaService.getMaxFileSizeBytes())
  try {
    const asset = await blogMediaService.upload(
      { entity: "category", entity_id: req.params.id, field: "cover_image" },
      upload.file_name,
      upload.mime_type,
      upload.size_bytes,
      createReadStream(upload.temp_file_path)
    )
    await svc.updateCategory(req.params.id, { cover_image: asset.permanent_url })
    return res.status(200).json({ cover_image: asset.permanent_url, asset })
  } finally {
    await upload.cleanup()
  }
}

// DELETE /admin/blog-categories/:id/media/cover-image
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const svc = new BlogService(req.scope)
  const category = await svc.getCategoryById(req.params.id)
  if (!category) return res.status(404).json({ message: "Blog category not found" })

  await svc.updateCategory(req.params.id, { cover_image: null })
  return res.json({ success: true })
}
