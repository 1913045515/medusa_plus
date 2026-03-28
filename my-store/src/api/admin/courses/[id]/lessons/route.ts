import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  lessonService,
  courseService,
  setCourseModuleScope,
} from "../../../../../modules/course"
import type { CreateLessonInput } from "../../../../../modules/course"

// GET /admin/courses/:id/lessons
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const { id: courseId } = req.params
  const locale = (req.query.locale as string | undefined) ?? null

  // 确保课程存在
  const course = await courseService.getCourse(courseId, locale)
  if (!course) return res.status(404).json({ message: "Course not found" })

  const lessons = await lessonService.getLessonsByCourse(courseId, locale)
  res.json({ lessons, count: lessons.length })
}

// POST /admin/courses/:id/lessons
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const { id: courseId } = req.params

  // 确保课程存在
  const course = await courseService.getCourse(courseId)
  if (!course) return res.status(404).json({ message: "Course not found" })

  const body = req.body as Omit<CreateLessonInput, "course_id">

  const lesson = await lessonService.createLesson({
    ...body,
    course_id: courseId,
  } as CreateLessonInput)

  res.status(201).json({ lesson })
}
