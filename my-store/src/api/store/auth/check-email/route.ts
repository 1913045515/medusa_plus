import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /store/auth/check-email
 *
 * 检查邮箱是否已注册：同时查 customer 表 和 provider_identity 表，
 * 任意一处有记录即视为"已注册"。
 * Body: { email: string }
 * Response: { exists: boolean }
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email } = req.body as { email?: string }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "邮箱格式无效 / Invalid email address" })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
  const authModuleService = req.scope.resolve(Modules.AUTH)

  // 查 customer 表
  const existingCustomers = await customerModuleService.listCustomers({ email: normalizedEmail })
  if (existingCustomers.length > 0) {
    return res.status(200).json({ exists: true })
  }

  // 查 provider_identity 表（防止孤儿记录导致误判）
  const existingIdentities = await authModuleService.listAuthIdentities({
    provider_identities: {
      entity_id: normalizedEmail,
      provider: "emailpass",
    },
  } as any)
  if (existingIdentities.length > 0) {
    return res.status(200).json({ exists: true })
  }

  return res.status(200).json({ exists: false })
}
