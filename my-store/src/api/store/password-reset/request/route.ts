import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"
import { PASSWORD_RESET_MODULE } from "../../../../modules/password-reset"
import PasswordResetModuleService from "../../../../modules/password-reset/service"
import { STORE_SETTINGS_MODULE } from "../../../../modules/store-settings"
import StoreSettingsModuleService from "../../../../modules/store-settings/service"
import { EMAIL_PROXY_MODULE } from "../../../../modules/email-proxy"
import EmailProxyService from "../../../../modules/email-proxy/service"
import {
  DEFAULT_EMAIL_TEMPLATES,
  EmailTemplatesConfig,
} from "../../../../modules/store-settings/email-template-defaults"
import { Modules } from "@medusajs/framework/utils"

const RESET_TOKEN_TTL_MINUTES = 10

function renderTemplate(html: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, val]) => result.split(`{{${key}}}`).join(val),
    html
  )
}

async function getSmtpConfig(settingsService: StoreSettingsModuleService) {
  const list = await settingsService.listStoreSettings()
  const setting = list[0]
  if (!setting || !(setting as any).email_proxy_config) return null
  try {
    return JSON.parse((setting as any).email_proxy_config)
  } catch {
    return null
  }
}

async function getEmailTemplates(settingsService: StoreSettingsModuleService): Promise<EmailTemplatesConfig> {
  const list = await settingsService.listStoreSettings()
  const setting = list[0]
  if (setting && (setting as any).email_templates_config) {
    try {
      return JSON.parse((setting as any).email_templates_config)
    } catch {
      // fall through
    }
  }
  return DEFAULT_EMAIL_TEMPLATES
}

// POST /store/password-reset/request
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email } = req.body as { email?: string }

  // 始终返回 200，防止邮箱枚举攻击
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.json({ success: true })
  }

  try {
    // 验证邮箱是否对应已有客户
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
    const customers = await customerModuleService.listCustomers({ email })
    if (!customers || customers.length === 0) {
      // 客户不存在，静默返回
      return res.json({ success: true })
    }
    const customer = customers[0]

    // 生成安全随机 token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)

    const resetService = req.scope.resolve<PasswordResetModuleService>(PASSWORD_RESET_MODULE)

    // 使旧的未使用 token 失效（标记为已使用）
    const oldTokens = await resetService.listPasswordResetTokens({
      email,
      used: false,
    } as any)
    for (const old of oldTokens) {
      await resetService.updatePasswordResetTokens({ id: old.id, used: true } as any)
    }

    // 创建新 token
    await resetService.createPasswordResetTokens({
      email,
      token,
      used: false,
      expires_at: expiresAt,
    } as any)

    // 发送邮件
    const settingsService = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
    const smtpConfig = await getSmtpConfig(settingsService)
    if (smtpConfig) {
      const templates = await getEmailTemplates(settingsService)
      const passwordResetTemplate = (templates as any).password_reset
      const storeUrl = process.env.STORE_URL || process.env.STORE_CORS?.split(",")[0]?.trim() || "http://localhost:8000"
      const resetLink = `${storeUrl}/reset-password?token=${token}`

      const subject = passwordResetTemplate?.subject ?? "重置您的账号密码"
      const html = renderTemplate(passwordResetTemplate?.html ?? DEFAULT_PASSWORD_RESET_HTML, {
        customer_name: customer.first_name || customer.email,
        reset_link: resetLink,
        expiry_minutes: String(RESET_TOKEN_TTL_MINUTES),
        email: customer.email,
      })

      const emailService = req.scope.resolve<EmailProxyService>(EMAIL_PROXY_MODULE)
      await emailService.sendMail(smtpConfig, email, subject, html).catch((err) => {
        console.error("[PasswordReset] 发送邮件失败:", err)
      })
    } else {
      console.warn("[PasswordReset] SMTP 未配置，跳过邮件发送")
    }
  } catch (err) {
    console.error("[PasswordReset] request 处理出错:", err)
  }

  return res.json({ success: true })
}

const DEFAULT_PASSWORD_RESET_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; }
    h2 { color: #1a1a1a; }
    .btn { display: inline-block; background: #4f46e5; color: #fff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; font-size: 16px; }
    .tip { color: #6b7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    .link-text { word-break: break-all; color: #4f46e5; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔑 密码重置 / Password Reset</h2>
    <p>您好，{{customer_name}}！</p>
    <p>我们收到了您的密码重置请求，请点击下方按钮重置密码（<strong>{{expiry_minutes}} 分钟内有效</strong>）：</p>
    <p>Hi {{customer_name}}, we received a request to reset your password. Click the button below (valid for <strong>{{expiry_minutes}} minutes</strong>):</p>
    <a class="btn" href="{{reset_link}}">重置密码 / Reset Password</a>
    <p style="margin-top:20px; font-size:13px; color:#6b7280">如果按钮无法点击，请复制以下链接到浏览器：<br>If the button doesn't work, copy this link to your browser:</p>
    <p class="link-text">{{reset_link}}</p>
    <div class="tip">
      如果您没有申请重置密码，请忽略此邮件，您的账号不会有任何变化。<br>
      If you did not request a password reset, please ignore this email.
    </div>
  </div>
</body>
</html>`
