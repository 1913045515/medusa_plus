import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { kdf as scryptKdf } from "scrypt-kdf"
import { Modules } from "@medusajs/framework/utils"
import { EMAIL_OTP_MODULE } from "../../../../modules/email-otp"
import EmailOtpService from "../../../../modules/email-otp/service"
import jwt from "jsonwebtoken"

/**
 * POST /store/auth/register-with-otp
 *
 * 接受 verifiedToken（由 /store/auth/email-otp/verify 签发），
 * 完成账号注册并返回 JWT token。
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { verified_token, first_name, last_name, phone, password } = req.body as {
    verified_token?: string
    first_name?: string
    last_name?: string
    phone?: string
    password?: string
  }

  // 参数校验
  if (!verified_token) {
    return res.status(400).json({ message: "缺少邮箱验证凭证 / Missing email verified_token" })
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "密码不能少于8位 / Password must be at least 8 characters" })
  }

  // 验证 verifiedToken，取出已验证邮箱
  const jwtSecret = process.env.JWT_SECRET || "supersecret"
  const otpService = req.scope.resolve<EmailOtpService>(EMAIL_OTP_MODULE)

  let verifiedEmail: string
  try {
    verifiedEmail = otpService.validateVerifiedToken(verified_token, jwtSecret)
  } catch (err: any) {
    const isExpired = err.message === "VERIFIED_TOKEN_EXPIRED"
    return res.status(422).json({
      message: isExpired
        ? "邮箱验证已过期，请重新验证 / Email verification expired, please re-verify"
        : "邮箱验证凭证无效 / Invalid email verified_token",
    })
  }

  const authModuleService = req.scope.resolve(Modules.AUTH)
  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)

  // 检查 customer 表是否已有记录
  const existingCustomers = await customerModuleService.listCustomers({ email: verifiedEmail })
  if (existingCustomers.length > 0) {
    return res.status(409).json({
      message: "该邮箱已注册 / This email is already registered",
    })
  }

  // 检查 provider_identity 是否已存在（孤儿记录场景）
  const existingIdentities = await authModuleService.listAuthIdentities({
    provider_identities: {
      entity_id: verifiedEmail,
      provider: "emailpass",
    },
  } as any)

  if (existingIdentities.length > 0) {
    // provider_identity 存在但没有 customer —— 孤儿记录
    // 检查是否真的关联了 customer（app_metadata.customer_id）
    const orphan = existingIdentities[0] as any
    if (orphan?.app_metadata?.customer_id) {
      // 关联了 customer，但 customer 查不到 —— 数据异常，拒绝注册让管理员处理
      return res.status(409).json({
        message: "该邮箱已注册 / This email is already registered",
      })
    }
    // 无 customer 关联 —— 是孤儿记录，删除后允许重新注册
    await authModuleService.deleteAuthIdentities((orphan as any).id)
  }

  // 使用与 Medusa emailpass provider 相同的 scrypt-kdf 算法 hash 密码
  const hashConfig = { logN: 15, r: 8, p: 1 }
  const passwordHash = (await scryptKdf(password, hashConfig)).toString("base64")

  // 创建 auth identity（emailpass provider）
  const authIdentities = await authModuleService.createAuthIdentities({
    provider_identities: [
      {
        provider: "emailpass",
        entity_id: verifiedEmail,
        provider_metadata: {
          password: passwordHash,
        },
      },
    ],
  } as any)
  const authIdentity = Array.isArray(authIdentities) ? authIdentities[0] : authIdentities

  // 创建客户记录（若失败则回滚删除 auth_identity，防止孤儿记录）
  let customer: any
  try {
    const customers = await customerModuleService.createCustomers({
      email: verifiedEmail,
      first_name: first_name?.trim() || "",
      last_name: last_name?.trim() || "",
      phone: phone?.trim() || undefined,
      has_account: true,
    } as any)
    customer = Array.isArray(customers) ? customers[0] : customers
  } catch (customerErr: any) {
    // 回滚：删除刚才创建的 auth_identity，保持数据一致
    try {
      await authModuleService.deleteAuthIdentities((authIdentity as any).id)
    } catch {
      // ignore cleanup error
    }
    return res.status(500).json({ message: "注册失败，请重试 / Registration failed, please try again" })
  }

  // 关联 auth identity → customer（若失败同时回滚 auth_identity 和 customer）
  try {
    await authModuleService.updateAuthIdentities({
      id: (authIdentity as any).id,
      app_metadata: {
        customer_id: (customer as any).id,
      },
    } as any)
  } catch (linkErr: any) {
    try { await customerModuleService.deleteCustomers((customer as any).id) } catch { /* ignore */ }
    try { await authModuleService.deleteAuthIdentities((authIdentity as any).id) } catch { /* ignore */ }
    return res.status(500).json({ message: "注册失败，请重试 / Registration failed, please try again" })
  }

  // 签发 JWT token（与 Medusa emailpass 格式兼容）
  const { http } = (req as any).scope.resolve("configModule").projectConfig
  const jwtExpiresIn = http?.jwtExpiresIn ?? "7d"

  const token = jwt.sign(
    { actor_id: (authIdentity as any).id, actor_type: "customer" },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  )

  return res.json({ token })
}
