import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { EMAIL_PROXY_MODULE } from "../modules/email-proxy"
import EmailProxyService from "../modules/email-proxy/service"
import { STORE_SETTINGS_MODULE } from "../modules/store-settings"
import StoreSettingsModuleService from "../modules/store-settings/service"
import {
  DEFAULT_EMAIL_TEMPLATES,
} from "../modules/store-settings/email-template-defaults"

function renderTemplate(html: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, val]) => result.split(`{{${key}}}`).join(val),
    html
  )
}

// 处理 auth.password_reset 事件 —— 仅对 admin 用户（actor_type === "user"）发送邮件
// customer 端密码重置由 /store/password-reset/request 自行处理
export default async function authAdminPasswordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{ entity_id: string; actor_type: string; token: string }>) {
  const { entity_id: email, actor_type, token } = data

  // 只处理 admin 端（user 类型），storefront 端有独立逻辑
  if (actor_type !== "user") {
    return
  }

  try {
    const settingsService =
      container.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
    const settings = await settingsService.listStoreSettings()
    const setting = settings[0] ?? null

    if (!setting || !(setting as any).email_proxy_config) {
      console.warn("[AdminPasswordReset] SMTP 未配置，跳过邮件发送")
      return
    }

    let smtpConfig: any
    try {
      smtpConfig = JSON.parse((setting as any).email_proxy_config)
      if (process.env.QQ_SMTP_PASS) smtpConfig.pass = process.env.QQ_SMTP_PASS
    } catch {
      console.warn("[AdminPasswordReset] 解析 SMTP 配置失败，跳过邮件发送")
      return
    }

    if (!smtpConfig?.host || !smtpConfig?.user || !smtpConfig?.pass) {
      console.warn("[AdminPasswordReset] SMTP 配置不完整，跳过邮件发送")
      return
    }

    // 获取邮件模板
    let templates = DEFAULT_EMAIL_TEMPLATES
    if ((setting as any).email_templates_config) {
      try {
        const stored = JSON.parse((setting as any).email_templates_config)
        if (stored.password_reset?.html && stored.password_reset?.subject) {
          templates = { ...templates, password_reset: stored.password_reset }
        }
      } catch {
        // 回退默认模板
      }
    }

    // Admin 重置密码链接指向后台 /app/reset-password 页面
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.MEDUSA_BACKEND_URL ||
      "http://localhost:9000"
    const adminUrl = process.env.ADMIN_URL || `${backendUrl}/app`
    const resetLink = `${adminUrl}/reset-password?token=${token}`

    const subject = renderTemplate(templates.password_reset.subject, {
      customer_name: email,
      reset_link: resetLink,
      expiry_minutes: "15",
      email,
    })
    const html = renderTemplate(templates.password_reset.html, {
      customer_name: email,
      reset_link: resetLink,
      expiry_minutes: "15",
      email,
    })

    const emailService = container.resolve<EmailProxyService>(EMAIL_PROXY_MODULE)
    await emailService.sendMail(smtpConfig, email, subject, html)
    console.log(`[AdminPasswordReset] 密码重置邮件已发送至: ${email}`)
  } catch (err) {
    console.error("[AdminPasswordReset] 发送邮件失败:", err)
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
