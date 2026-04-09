import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { courseService, courseMediaService, setCourseModuleScope } from "../../../modules/course"
import type { CreateCourseInput, StoredS3MediaAsset } from "../../../modules/course"

async function trySign(asset: StoredS3MediaAsset | null): Promise<string | null> {
  if (!asset || !courseMediaService.isConfigured()) return null
  return courseMediaService.sign(asset).then((s) => s.url).catch(() => null)
}

// GET /admin/courses
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const locale = (req.query.locale as string | undefined) ?? null
  const courses = await courseService.listCourses(undefined, locale)
  const withUrls = await Promise.all(
    courses.map(async (c) => ({
      ...c,
      thumbnail_signed_url: await trySign(c.thumbnail_asset),
    }))
  )
  res.json({ courses: withUrls, count: withUrls.length })
}

// POST /admin/courses
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const input = req.body as CreateCourseInput
  const course = await courseService.createCourse(input)
  res.status(201).json({ course })
}
