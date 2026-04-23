import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FILE_ASSET_MODULE } from "../../../../../modules/file-asset"
import type FileAssetModuleService from "../../../../../modules/file-asset/service"

/**
 * GET /admin/file-assets/:id/url
 *
 * Returns the URL for a file asset:
 * - Public files: permanent URL
 * - Private files: presigned URL (valid 30 minutes)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const fileAssetService = req.scope.resolve<FileAssetModuleService>(FILE_ASSET_MODULE)

  const assets = await fileAssetService.listFileAssets({ id: req.params.id })
  const asset = assets[0]
  if (!asset) {
    return res.status(404).json({ message: "文件不存在" })
  }

  try {
    if (asset.is_public) {
      const url = fileAssetService.getPublicFileUrl(asset.s3_key)
      return res.json({ url, is_temporary: false })
    } else {
      const url = await fileAssetService.generateAdminPresignedUrl(asset.id)
      return res.json({ url, is_temporary: true, expires_in_seconds: 1800 })
    }
  } catch (err: any) {
    return res.status(500).json({ message: err?.message ?? "获取文件 URL 失败" })
  }
}
