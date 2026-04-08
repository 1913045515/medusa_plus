import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  lessonService,
  purchaseService,
  setCourseModuleScope,
} from "../../../../../modules/course"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCourseModuleScope(req.scope)
  const { id } = req.params

  // 先查 lesson，非 published 状态直接 404，避免泄露草稿内容
  const lesson = await lessonService.getLesson(id)
  if (!lesson || lesson.status !== "published") {
    return res.status(404).json({ message: "Lesson not found" })
  }

  // Medusa 版本差异：有的挂在 req.auth_context，有的挂在 req.authContext
  const authContext = (req as any).auth_context ?? (req as any).authContext
  const customerId = authContext?.actor_id ?? authContext?.actorId ?? null
  const authHeader = req.headers?.authorization

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1]
      JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"))
    } catch {
      // ignore malformed token payload during lightweight validation
    }
  }

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ") && !customerId) {
    return res.status(401).json({
      message:
        "Invalid or unrecognized customer token (no auth_context). Check JWT_SECRET/CORS/auth setup.",
    })
  }

  const result = await lessonService.resolvePlayUrl(
    id,
    customerId,
    (cid, courseId) => purchaseService.hasPurchased(cid, courseId)
  )

  if (!result.ok) {
    return res.status(result.code).json({ message: result.message })
  }

  res.json({
    video_url: result.video_url,
    video_url_expires_at: result.video_url_expires_at ?? null,
    video_url_expires_in_seconds: result.video_url_expires_in_seconds ?? null,
  })
}
