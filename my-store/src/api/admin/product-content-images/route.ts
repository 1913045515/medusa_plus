import { randomUUID } from "node:crypto"
import { createReadStream } from "node:fs"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { parseAdminUploadRequest } from "../_utils/media-upload"
import { blogMediaService } from "../../../modules/blog/services/media.service"

/**
 * POST /admin/product-content-images
 *
 * Upload an inline content image (e.g. pasted from clipboard in the rich text editor)
 * to the public S3 bucket and return the permanent public URL.
 *
 * Response: { url: permanentUrl }
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!blogMediaService.isConfigured()) {
    return res.status(503).json({ message: "Public media S3 storage is not configured." })
  }

  const upload = await parseAdminUploadRequest(req, blogMediaService.getMaxFileSizeBytes())
  try {
    const entityId = randomUUID()
    const asset = await blogMediaService.upload(
      { entity: "product_content", entity_id: entityId, field: "inline" },
      upload.file_name,
      upload.mime_type,
      upload.size_bytes,
      createReadStream(upload.temp_file_path)
    )

    // Bucket is public — return permanent URL directly
    return res.status(200).json({
      url: asset.permanent_url,
    })
  } finally {
    await upload.cleanup()
  }
}
