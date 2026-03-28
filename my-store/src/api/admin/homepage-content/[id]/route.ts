import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { homepageContentService, setCourseModuleScope } from "../../../../modules/course"

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)

  try {
    await homepageContentService.deleteHomepageContent(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Failed to delete homepage content" })
  }
}