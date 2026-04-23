import { createReadStream } from "node:fs"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FILE_ASSET_MODULE } from "../../../modules/file-asset"
import type FileAssetModuleService from "../../../modules/file-asset/service"
import { parseAdminUploadRequest } from "../_utils/media-upload"

const MAX_FILE_BYTES = 500 * 1024 * 1024 // 500 MB

/**
 * GET /admin/file-assets
 * Query params: q (search name), limit (default 20), offset (default 0)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const fileAssetService = req.scope.resolve<FileAssetModuleService>(FILE_ASSET_MODULE)

  const q = (req.query.q as string) || ""
  const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 100)
  const offset = parseInt((req.query.offset as string) || "0", 10)

  const filters: Record<string, unknown> = {}
  if (q) {
    // MedusaService supports $like filter for text columns
    filters.name = { $ilike: `%${q}%` }
  }

  const [assets, count] = await fileAssetService.listAndCountFileAssets(
    filters,
    {
      skip: offset,
      take: limit,
      order: { created_at: "DESC" },
    }
  )

  res.json({ file_assets: assets, count, limit, offset })
}

/**
 * POST /admin/file-assets
 * multipart/form-data upload — field name: "file"
 * Optional form field: "is_public" = "true" | "false"
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const fileAssetService = req.scope.resolve<FileAssetModuleService>(FILE_ASSET_MODULE)

  // Parse multipart upload (server-enforced 500 MB limit)
  let upload
  try {
    upload = await parseAdminUploadRequest(req, MAX_FILE_BYTES)
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "文件上传失败" })
  }

  // Determine if uploading to public bucket
  const isPublic = upload.fields?.is_public === "true"

  if (isPublic && !fileAssetService.isPublicS3Configured()) {
    await upload.cleanup()
    return res.status(503).json({
      message:
        "公有 S3 存储桶未配置。请设置 FILE_ASSET_PUBLIC_S3_BUCKET 或 BLOG_MEDIA_S3_BUCKET 环境变量。",
    })
  }

  if (!isPublic && !fileAssetService.isS3Configured()) {
    await upload.cleanup()
    return res.status(503).json({
      message:
        "S3 未配置，无法上传文件。请设置 FILE_ASSET_S3_BUCKET、FILE_ASSET_S3_ACCESS_KEY_ID、FILE_ASSET_S3_SECRET_ACCESS_KEY 环境变量。",
    })
  }

  try {
    const stream = createReadStream(upload.temp_file_path)

    if (upload.size_bytes > MAX_FILE_BYTES) {
      await upload.cleanup()
      return res.status(400).json({ message: "文件大小不能超过 500 MB" })
    }

    let s3Key: string
    let s3Bucket: string

    if (isPublic) {
      const result = await fileAssetService.uploadToPublicS3(
        upload.file_name,
        upload.mime_type,
        upload.size_bytes,
        stream
      )
      s3Key = result.s3Key
      s3Bucket = result.s3Bucket
    } else {
      const result = await fileAssetService.uploadToS3(
        upload.file_name,
        upload.mime_type,
        upload.size_bytes,
        stream
      )
      s3Key = result.s3Key
      s3Bucket = result.s3Bucket
    }

    const asset = await fileAssetService.createFileAssets({
      name: upload.file_name,
      original_filename: upload.file_name,
      s3_key: s3Key,
      s3_bucket: s3Bucket,
      mime_type: upload.mime_type,
      size_bytes: upload.size_bytes,
      description: null,
      is_public: isPublic,
    })

    await upload.cleanup()
    return res.status(201).json({ file_asset: asset })
  } catch (err: any) {
    await upload.cleanup().catch(() => undefined)
    console.error("[POST /admin/file-assets] S3 upload failed:", err)
    return res.status(500).json({ message: err?.message ?? "文件上传到 S3 失败" })
  }
}
