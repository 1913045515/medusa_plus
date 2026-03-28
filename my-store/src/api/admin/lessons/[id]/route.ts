import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lessonService, setCourseModuleScope } from "../../../../modules/course"
import type { UpdateLessonInput } from "../../../../modules/course"

// GET /admin/lessons/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const locale = (req.query.locale as string | undefined) ?? null
  const lesson = await lessonService.getLesson(req.params.id, locale)
  if (!lesson) return res.status(404).json({ message: "Lesson not found" })
  res.json({ lesson })
}

// PUT /admin/lessons/:id
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const lesson = await lessonService.updateLesson(
    req.params.id,
    req.body as UpdateLessonInput
  )
  res.json({ lesson })
}

// DELETE /admin/lessons/:id
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  await lessonService.deleteLesson(req.params.id)
  res.status(200).json({ id: req.params.id, deleted: true })
}
