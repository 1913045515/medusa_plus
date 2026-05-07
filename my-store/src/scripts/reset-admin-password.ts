/**
 * 重置 Admin 用户密码脚本
 *
 * 用法：
 *   cd my-store
 *   npx medusa exec ./src/scripts/reset-admin-password.ts
 *
 * 默认将 ADMIN_EMAIL 对应的管理员密码重置为 ADMIN_NEW_PASSWORD。
 * 可通过环境变量或直接修改下方常量来指定邮箱和新密码。
 */
import type { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

// ── 配置 ──────────────────────────────────────────────────────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "1913045515@qq.com"
const ADMIN_NEW_PASSWORD = process.env.ADMIN_NEW_PASSWORD || "0316"
// ──────────────────────────────────────────────────────────────

export default async function resetAdminPassword({ container }: ExecArgs) {
  const authModuleService = container.resolve(Modules.AUTH)
  const userModuleService = container.resolve(Modules.USER)

  console.log(`[ResetAdminPassword] 目标账号: ${ADMIN_EMAIL}`)

  // 1. 确认该 user 存在
  const users = await userModuleService.listUsers({ email: ADMIN_EMAIL })
  if (users.length === 0) {
    console.error(`[ResetAdminPassword] 未找到邮箱为 ${ADMIN_EMAIL} 的管理员账号！`)
    console.error("请检查邮箱地址是否正确，或在 Admin 后台先创建该账号。")
    return
  }
  console.log(`[ResetAdminPassword] 找到管理员: ${users[0].id}（${users[0].email}）`)

  // 2. 找到对应的 auth identity
  const identities = await authModuleService.listAuthIdentities({
    provider_identities: {
      provider: "emailpass",
      entity_id: ADMIN_EMAIL,
    },
  } as any)

  // 3. 更新或创建 emailpass auth identity
  if (identities.length === 0) {
    // 身份不存在 → 先创建再通过 update 设置密码
    console.log("[ResetAdminPassword] auth identity 不存在，将自动创建...")

    await authModuleService.createAuthIdentities({
      provider_identities: [
        {
          provider: "emailpass",
          entity_id: ADMIN_EMAIL,
          provider_metadata: {},
        },
      ],
      app_metadata: { user_id: users[0].id },
    })
    console.log("[ResetAdminPassword] auth identity 已创建")
  } else {
    console.log(`[ResetAdminPassword] 找到已有 auth identity，将直接更新密码`)
  }

  // 4. 使用 emailpass provider 的 update 方法更新密码（内部会自动做 scrypt 哈希）
  const { success, error } = await authModuleService.updateProvider(
    "emailpass",
    {
      entity_id: ADMIN_EMAIL,
      password: ADMIN_NEW_PASSWORD,
    } as any
  )

  if (success) {
    console.log(
      `[ResetAdminPassword] ✅ 密码重置成功！\n  邮箱: ${ADMIN_EMAIL}\n  新密码: ${ADMIN_NEW_PASSWORD}`
    )
  } else {
    console.error(`[ResetAdminPassword] ❌ 密码重置失败: ${error}`)
  }
}
