import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { courseService, setCourseModuleScope } from "../../../../modules/course"
import type { UpdateCourseInput } from "../../../../modules/course"

// GET /admin/courses/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const locale = (req.query.locale as string | undefined) ?? null
  const course = await courseService.getCourse(req.params.id, locale)
  if (!course) return res.status(404).json({ message: "Course not found" })
  res.json({ course })
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
