import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { lessonService, courseService, setCourseModuleScope } from "../../../../../modules/course"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const { id } = req.params
  const locale = (req.headers["x-medusa-locale"] as string | undefined) ?? (req.query.locale as string | undefined) ?? null

  // 确保课程本身是 published 状态，否则 404
  const course = await courseService.getCourse(id, locale)
  if (!course || course.status !== "published") {
    return res.status(404).json({ message: "Course not found" })
  }

  // 只返回 published 状态的 lesson
  const lessons = await lessonService.getLessonsByCourse(id, locale)
  const publishedLessons = lessons.filter((l) => l.status === "published")

  // Store API 不暴露 video_url，由 /play 接口按权限返回
  const publicLessons = publishedLessons.map(({ video_url: _omit, ...rest }) => rest)

  res.json({ lessons: publicLessons, count: publicLessons.length })
}
