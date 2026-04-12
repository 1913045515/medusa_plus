import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PASSWORD_RESET_MODULE } from "../../../../modules/password-reset"
import PasswordResetModuleService from "../../../../modules/password-reset/service"

// GET /store/password-reset/validate?token=xxx
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const token = req.query.token as string | undefined

  if (!token || typeof token !== "string") {
    return res.status(400).json({ valid: false, message: "缺少 token 参数" })
  }

  const resetService = req.scope.resolve<PasswordResetModuleService>(PASSWORD_RESET_MODULE)

  const records = await resetService.listPasswordResetTokens({ token } as any)
  if (!records || records.length === 0) {
    return res.json({ valid: false, message: "无效的重置链接" })
  }

  const record = records[0]

  if (record.used) {
    return res.json({ valid: false, message: "此重置链接已被使用" })
  }

  if (new Date(record.expires_at) < new Date()) {
    return res.json({ valid: false, message: "重置链接已过期（有效期10分钟）" })
  }

  return res.json({ valid: true, email: record.email })
}
