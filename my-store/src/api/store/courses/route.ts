import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { courseService, setCourseModuleScope } from "../../../modules/course"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const locale = (req.headers["x-medusa-locale"] as string | undefined) ?? (req.query.locale as string | undefined) ?? null
  const courses = await courseService.listCourses({ status: "published" }, locale)
  res.json({ courses, count: courses.length })
}
