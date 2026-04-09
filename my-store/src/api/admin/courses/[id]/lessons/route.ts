import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  lessonService,
  courseService,
  courseMediaService,
  setCourseModuleScope,
} from "../../../../../modules/course"
import type { CreateLessonInput, StoredS3MediaAsset } from "../../../../../modules/course"

async function trySign(asset: StoredS3MediaAsset | null): Promise<string | null> {
  if (!asset || !courseMediaService.isConfigured()) return null
  return courseMediaService.sign(asset).then((s) => s.url).catch(() => null)
}

// GET /admin/courses/:id/lessons
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const { id: courseId } = req.params
  const locale = (req.query.locale as string | undefined) ?? null

  // 确保课程存在
  const course = await courseService.getCourse(courseId, locale)
  if (!course) return res.status(404).json({ message: "Course not found" })

  const lessons = await lessonService.getLessonsByCourse(courseId, locale)
  const withUrls = await Promise.all(
    lessons.map(async (l) => ({
      ...l,
      thumbnail_signed_url: await trySign(l.thumbnail_asset),
      video_signed_url: await trySign(l.video_asset),
    }))
  )
  res.json({ lessons: withUrls, count: withUrls.length })
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
