import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { siteAnalyticsService, setSiteAnalyticsModuleScope } from "../../../../../modules/site-analytics"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setSiteAnalyticsModuleScope(req.scope)

  try {
    const body = (req.body ?? {}) as { ids?: unknown }
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : []

    if (!ids.length) {
      throw new Error("ids is required")
    }

    const deleted_count = await siteAnalyticsService.bulkDeleteLogs(ids)
    res.json({ deleted_count })
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Failed to bulk delete analytics logs" })
  }
}