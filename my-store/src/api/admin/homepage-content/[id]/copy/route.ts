import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { homepageContentService, setCourseModuleScope } from "../../../../../modules/course"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  try {
    const homepage = await homepageContentService.duplicateHomepageContent(req.params.id)
    res.status(201).json({ homepage })
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Failed to copy homepage content" })
  }
}