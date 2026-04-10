import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { siteAnalyticsService, setSiteAnalyticsModuleScope } from "../../../../../modules/site-analytics"

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  setSiteAnalyticsModuleScope(req.scope)

  try {
    await siteAnalyticsService.deleteLog(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Failed to delete analytics log" })
  }
}