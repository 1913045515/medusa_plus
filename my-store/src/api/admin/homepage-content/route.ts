import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  homepageContentService,
  setCourseModuleScope,
  type CreateHomepageContentInput,
  type UpsertHomepageContentInput,
} from "../../../modules/course"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const locale = (req.query.locale as string | undefined) ?? null
  const homepages = await homepageContentService.listHomepageContents(locale)
  const active = homepages.find((item) => item.is_active) ?? null
  res.json({ homepages, active_homepage_id: active?.id ?? null })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  try {
    const homepage = await homepageContentService.createHomepageContent(
      req.body as CreateHomepageContentInput
    )
    res.status(201).json({ homepage })
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Failed to create homepage content" })
  }
}

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  try {
    const homepage = await homepageContentService.saveHomepageContent(
      req.body as UpsertHomepageContentInput
    )
    res.json({ homepage })
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Failed to save homepage content" })
  }
}