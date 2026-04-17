import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FILE_ASSET_MODULE } from "../../../../../modules/file-asset"
import type FileAssetModuleService from "../../../../../modules/file-asset/service"

/**
 * GET /store/file-assets/:id/status
 *
 * Returns download availability info for this file asset for the authenticated customer.
 * Does NOT generate a presigned URL — that only happens on the actual download endpoint.
 *
 * Response: {
 *   remaining_downloads: number,   // remaining today (0 = exhausted)
 *   download_available_until: string  // ISO timestamp: now + 30 mins (indicates page freshness)
 * }
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const fileAssetId = req.params.id
  const authContext = (req as any).auth_context
  const customerId: string | undefined = authContext?.actor_id

  if (!customerId) {
    return res.status(401).json({ message: "请先登录" })
  }

  const fileAssetService = req.scope.resolve<FileAssetModuleService>(FILE_ASSET_MODULE)

  const assets = await fileAssetService.listFileAssets({ id: fileAssetId })
  if (!assets[0]) {
    return res.status(404).json({ message: "文件不存在" })
  }

  const today = new Date()
  const usedToday = await fileAssetService.countDownloadsByCustomerAndDate(
    customerId,
    fileAssetId,
    today
  )
  const limit = fileAssetService.getDownloadLimitPerDay()
  const remainingDownloads = Math.max(0, limit - usedToday)

  // 30 minutes from now — indicates when this page data becomes stale
  const downloadAvailableUntil = new Date(
    Date.now() + fileAssetService.getPresignedUrlExpiresSeconds() * 1000
  ).toISOString()

  res.json({
    remaining_downloads: remainingDownloads,
    download_available_until: downloadAvailableUntil,
  })
}
