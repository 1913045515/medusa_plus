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

  // Debug: 查明鉴权上下文是否存在，以及当前 customerId 是什么
  console.log("[store/lessons/:id/play] lessonId=", id)
  console.log("[store/lessons/:id/play] auth_context=", authContext)
  console.log("[store/lessons/:id/play] customerId=", customerId)

  // Debug: 查明请求是否带上了授权信息（脱敏）
  const authHeader = req.headers?.authorization
  const cookieHeader = req.headers?.cookie
  console.log(
    "[store/lessons/:id/play] authorization header present=",
    Boolean(authHeader)
  )
  console.log(
    "[store/lessons/:id/play] authorization scheme=",
    typeof authHeader === "string" ? authHeader.split(" ")[0] : null
  )
  console.log(
    "[store/lessons/:id/play] cookie header present=",
    Boolean(cookieHeader)
  )

  // Debug: 解码 JWT token 内容（不验签，仅看 payload）
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1]
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"))
      console.log("[store/lessons/:id/play] JWT payload=", payload)
    } catch (e) {
      console.log("[store/lessons/:id/play] JWT decode error=", e)
    }
  }

  // 如果请求带了 Bearer，但框架没有解析出 authContext，说明 token 校验失败/未启用 store auth
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

  res.json({ video_url: result.video_url })
}
