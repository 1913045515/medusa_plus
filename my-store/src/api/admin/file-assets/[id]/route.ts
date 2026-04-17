import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { FILE_ASSET_MODULE } from "../../../../modules/file-asset"
import type FileAssetModuleService from "../../../../modules/file-asset/service"

/**
 * GET /admin/file-assets/:id
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const fileAssetService = req.scope.resolve<FileAssetModuleService>(FILE_ASSET_MODULE)

  const assets = await fileAssetService.listFileAssets({ id: req.params.id })
  if (!assets[0]) {
    return res.status(404).json({ message: "文件不存在" })
  }

  res.json({ file_asset: assets[0] })
}

/**
 * PATCH /admin/file-assets/:id
 * Body: { name?, description? }
 */
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const fileAssetService = req.scope.resolve<FileAssetModuleService>(FILE_ASSET_MODULE)

  const body = (req.body ?? {}) as { name?: string; description?: string }
  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = String(body.name).trim()
  if (body.description !== undefined)
    updates.description = body.description ? String(body.description).trim() : null

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No fields to update" })
  }

  const assets = await fileAssetService.listFileAssets({ id: req.params.id })
  if (!assets[0]) {
    return res.status(404).json({ message: "文件不存在" })
  }

  const updated = await fileAssetService.updateFileAssets({
    id: req.params.id,
    ...updates,
  })

  res.json({ file_asset: updated })
}

/**
 * DELETE /admin/file-assets/:id
 * Checks product references before deleting.
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const fileAssetService = req.scope.resolve<FileAssetModuleService>(FILE_ASSET_MODULE)
  const productModule = req.scope.resolve<any>(Modules.PRODUCT)

  const id = req.params.id

  const assets = await fileAssetService.listFileAssets({ id })
  const asset = assets[0]
  if (!asset) {
    return res.status(404).json({ message: "文件不存在" })
  }

  // Check if any product references this file via metadata.resource_file_asset_id
  const allProducts = await productModule.listProducts(
    {},
    { select: ["id", "title", "metadata"] }
  )
  const referenced = allProducts.filter(
    (p: any) => p?.metadata?.resource_file_asset_id === id
  )

  if (referenced.length > 0) {
    return res.status(409).json({
      message: `该文件被 ${referenced.length} 个商品引用，请先移除商品中的文件关联`,
      referenced_count: referenced.length,
    })
  }

  // Delete from S3 (ignores NoSuchKey)
  await fileAssetService.deleteFromS3(asset.s3_bucket, asset.s3_key)

  // Delete DB record
  await fileAssetService.deleteFileAssets(id)

  res.json({ success: true, id })
}
