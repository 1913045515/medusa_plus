import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { courseService, setCourseModuleScope } from "../../../modules/course"
import type { CreateCourseInput } from "../../../modules/course"

// GET /admin/courses
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const locale = (req.query.locale as string | undefined) ?? null
  const courses = await courseService.listCourses(undefined, locale)
  res.json({ courses, count: courses.length })
}

// POST /admin/courses
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const input = req.body as CreateCourseInput
  const course = await courseService.createCourse(input)
  res.status(201).json({ course })
}
