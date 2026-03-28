import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { homepageContentService, setCourseModuleScope } from "../../../modules/course"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const locale = (req.headers["x-medusa-locale"] as string | undefined) ?? (req.query.locale as string | undefined) ?? null
  const siteKey = (req.query.site_key as string | undefined)?.trim() || "default"
  const homepage = await homepageContentService.getPublishedHomepageContent(locale, siteKey)
  res.json({ homepage: homepage.content })
}