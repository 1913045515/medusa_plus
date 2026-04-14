import { randomUUID } from "node:crypto"
import { createReadStream } from "node:fs"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { parseAdminUploadRequest } from "../_utils/media-upload"
import { blogMediaService } from "../../../modules/blog/services/media.service"

/**
 * POST /admin/blog-content-images
 *
 * Upload an inline content image (e.g. pasted from clipboard in the rich text editor)
 * to the blog S3 bucket and return a 1-hour pre-signed URL suitable for immediate display.
 *
 * The pre-signed URL is embedded directly into the article HTML content as the image src.
 * The permanent S3 URL is also returned so the caller can store it if needed.
 *
 * Response: { url: signedUrl, permanent_url: permanentUrl }
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!blogMediaService.isConfigured()) {
    return res.status(503).json({ message: "Blog S3 media storage is not configured." })
  }

  const upload = await parseAdminUploadRequest(req, blogMediaService.getMaxFileSizeBytes())
  try {
    const entityId = randomUUID()
    const asset = await blogMediaService.upload(
      { entity: "content_image", entity_id: entityId, field: "inline" },
      upload.file_name,
      upload.mime_type,
      upload.size_bytes,
      createReadStream(upload.temp_file_path)
    )

    // Generate a 1-hour signed URL for immediate display in the editor
    const signedUrl = await blogMediaService.signUrl(asset.permanent_url, 3600)

    return res.status(200).json({
      url: signedUrl ?? asset.permanent_url,
      permanent_url: asset.permanent_url,
    })
  } finally {
    await upload.cleanup()
  }
}
