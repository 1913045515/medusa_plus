import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { kdf as scryptKdf } from "scrypt-kdf"
import { PASSWORD_RESET_MODULE } from "../../../../modules/password-reset"
import PasswordResetModuleService from "../../../../modules/password-reset/service"
import { Modules } from "@medusajs/framework/utils"

// POST /store/password-reset/confirm
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { token, new_password } = req.body as {
    token?: string
    new_password?: string
  }

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "缺少 token 参数" })
  }

  if (!new_password || typeof new_password !== "string" || new_password.length < 8) {
    return res.status(400).json({ message: "密码不能少于8位" })
  }

  const resetService = req.scope.resolve<PasswordResetModuleService>(PASSWORD_RESET_MODULE)

  const records = await resetService.listPasswordResetTokens({ token } as any)
  if (!records || records.length === 0) {
    return res.status(400).json({ message: "无效的重置链接" })
  }

  const record = records[0]

  if (record.used) {
    return res.status(400).json({ message: "此重置链接已被使用" })
  }

  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ message: "重置链接已过期（有效期10分钟）" })
  }

  // 以 DB 中记录的 email 为准，防止前端篡改
  const email = record.email

  // 通过 auth 模块找到对应的 provider identity
  const authModuleService = req.scope.resolve(Modules.AUTH)

  const allIdentities = await authModuleService.listAuthIdentities(
    {} as any,
    { relations: ["provider_identities"] } as any
  )

  const authIdentity = allIdentities.find((i: any) =>
    (i.provider_identities ?? []).some(
      (pi: any) => pi.entity_id === email && pi.provider === "emailpass"
    )
  )

  if (!authIdentity) {
    return res.status(400).json({ message: "账号认证信息不存在，请联系客服" })
  }

  const providerIdentity = (authIdentity.provider_identities ?? []).find(
    (pi: any) => pi.provider === "emailpass" && pi.entity_id === email
  )

  if (!providerIdentity) {
    return res.status(400).json({ message: "账号认证信息不存在（emailpass）" })
  }

  // 使用与 Medusa emailpass provider 相同的 scrypt-kdf 算法 hash 密码
  const hashConfig = { logN: 15, r: 8, p: 1 }
  const passwordHash = (await scryptKdf(new_password, hashConfig)).toString("base64")

  // 更新 provider_identity 中的密码
  await authModuleService.updateAuthIdentities({
    id: authIdentity.id,
    provider_identities: [
      {
        id: providerIdentity.id,
        provider_metadata: {
          ...(providerIdentity.provider_metadata ?? {}),
          password: passwordHash,
        },
      },
    ],
  } as any)

  // 标记 token 为已使用
  await resetService.updatePasswordResetTokens({ id: record.id, used: true } as any)

  return res.json({ success: true, message: "密码重置成功，请使用新密码登录" })
}
