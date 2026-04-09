import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { courseService, courseMediaService, setCourseModuleScope } from "../../../../modules/course"
import type { UpdateCourseInput, StoredS3MediaAsset } from "../../../../modules/course"

async function trySign(asset: StoredS3MediaAsset | null): Promise<string | null> {
  if (!asset || !courseMediaService.isConfigured()) return null
  return courseMediaService.sign(asset).then((s) => s.url).catch(() => null)
}

// GET /admin/courses/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const locale = (req.query.locale as string | undefined) ?? null
  const course = await courseService.getCourse(req.params.id, locale)
  if (!course) return res.status(404).json({ message: "Course not found" })
  res.json({ course: { ...course, thumbnail_signed_url: await trySign(course.thumbnail_asset) } })
}

// PUT /admin/courses/:id
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const course = await courseService.updateCourse(
    req.params.id,
    req.body as UpdateCourseInput
  )
  res.json({ course })
}

// DELETE /admin/courses/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  await courseService.deleteCourse(req.params.id)
  res.status(200).json({ id: req.params.id, deleted: true })
}
