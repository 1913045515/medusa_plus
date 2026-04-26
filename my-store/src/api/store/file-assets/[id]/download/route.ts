import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FILE_ASSET_MODULE } from "../../../../../modules/file-asset"
import type FileAssetModuleService from "../../../../../modules/file-asset/service"

/**
 * GET /store/file-assets/:id/download
 *
 * Security flow:
 * 1. Require logged-in customer (401 if not)
 * 2. Verify customer has a completed order containing the file asset (403 if not)
 * 3. Check download count limit — 3 per (customer, file, UTC day) (429 if exceeded)
 * 4. Generate 30-min presigned URL, record log, return 302
 *
 * The presigned URL ONLY appears in the Location header (302), never in any JSON body.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const fileAssetId = req.params.id
  const requestedOrderId =
    typeof req.query.order_id === "string" ? req.query.order_id : undefined
  const authContext = (req as any).auth_context
  const customerId: string | undefined = authContext?.actor_id

  // 1. Require authentication
  if (!customerId) {
    return res.status(401).json({ message: "请先登录后再进行下载" })
  }

  const fileAssetService = req.scope.resolve<FileAssetModuleService>(FILE_ASSET_MODULE)

  // Verify file asset exists
  const assets = await fileAssetService.listFileAssets({ id: fileAssetId })
  const asset = assets[0]
  if (!asset) {
    return res.status(404).json({ message: "文件不存在" })
  }

  // 2. Verify customer has purchased this file asset via an order line item
  const query = req.scope.resolve("query") as any
  let authorizedOrderId: string | null = null

  try {
    const ordersRes = await query.graph({
      entity: "order",
      fields: [
        "id",
        "customer_id",
        "status",
        "items.id",
        "items.metadata",
      ],
      filters: requestedOrderId
        ? { customer_id: customerId, id: requestedOrderId }
        : { customer_id: customerId },
    })

    const orders: any[] = ordersRes?.data ?? []

    for (const order of orders) {
      // Only consider completed/pending (not cancelled) orders
      if (order.status === "canceled") continue
      const items: any[] = order.items ?? []
      for (const item of items) {
        const meta = (item.metadata ?? {}) as Record<string, unknown>
        const fulfillment = meta.virtual_fulfillment as Record<string, unknown> | undefined
        if (fulfillment?.resource_file_asset_id === fileAssetId) {
          authorizedOrderId = order.id
          break
        }
      }
      if (authorizedOrderId) break
    }
  } catch (err) {
    console.error("[file-asset/download] Failed to query orders:", err)
    return res.status(500).json({ message: "验证订单时出错" })
  }

  if (!authorizedOrderId) {
    return res.status(403).json({
      message: "您未购买该产品，无下载权限",
    })
  }

  // 3. Check download count limit
  const today = new Date()
  const usedToday = await fileAssetService.countDownloadsByCustomerAndDate(
    customerId,
    fileAssetId,
    today,
    authorizedOrderId
  )
  const limit = fileAssetService.getDownloadLimitPerDay()

  if (usedToday >= limit) {
    return res.status(429).json({
      message: `今日下载次数已达上限（${limit}次），请明日再试`,
      limit,
      used: usedToday,
    })
  }

  // 4. Generate presigned URL, record log, redirect
  let presignedUrl: string
  try {
    presignedUrl = await fileAssetService.generatePresignedDownloadUrl(fileAssetId)
  } catch (err: any) {
    console.error("[file-asset/download] Failed to generate presigned URL:", err)
    return res.status(500).json({ message: "无法生成下载链接" })
  }

  // Record download BEFORE redirect (so we always count even if client ignores redirect)
  await fileAssetService.recordDownload(customerId, fileAssetId, authorizedOrderId)

  // 302 redirect — URL only in Location header, never in response body
  res.setHeader("Location", presignedUrl)
  res.setHeader("Cache-Control", "no-store")
  return res.status(302).end()
}
