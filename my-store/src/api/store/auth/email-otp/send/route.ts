import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EMAIL_OTP_MODULE } from "../../../../../modules/email-otp"
import EmailOtpService from "../../../../../modules/email-otp/service"
import { EMAIL_PROXY_MODULE } from "../../../../../modules/email-proxy"
import EmailProxyService from "../../../../../modules/email-proxy/service"
import { STORE_SETTINGS_MODULE } from "../../../../../modules/store-settings"
import StoreSettingsModuleService from "../../../../../modules/store-settings/service"
import { DEFAULT_EMAIL_TEMPLATES } from "../../../../../modules/store-settings/email-template-defaults"

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
    const config = JSON.parse((setting as any).email_proxy_config)
    if (process.env.QQ_SMTP_PASS) config.pass = process.env.QQ_SMTP_PASS
    return config
  } catch {
    return null
  }
}

async function getEmailTemplates(settingsService: StoreSettingsModuleService) {
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

// POST /store/auth/email-otp/send
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email } = req.body as { email?: string }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "邮箱格式无效 / Invalid email address" })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const otpService = req.scope.resolve<EmailOtpService>(EMAIL_OTP_MODULE)

  let otp: string
  try {
    otp = otpService.generateOtp(normalizedEmail)
  } catch (err: any) {
    if (err.message?.startsWith("COOLDOWN:")) {
      const seconds = err.message.split(":")[1]
      return res.status(429).json({
        message: `请等待 ${seconds} 秒后再重新发送 / Please wait ${seconds}s before resending`,
        cooldown_seconds: Number(seconds),
      })
    }
    throw err
  }

  // 发送邮件
  const settingsService = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const smtpConfig = await getSmtpConfig(settingsService)

  if (smtpConfig) {
    const templates = await getEmailTemplates(settingsService)
    const tpl = (templates as any).email_verification ?? (DEFAULT_EMAIL_TEMPLATES as any).email_verification
    const storeUrl =
      process.env.STORE_URL ||
      process.env.STORE_CORS?.split(",")[0]?.trim() ||
      "http://localhost:8000"

    const subject = tpl?.subject ?? "邮箱验证码 / Email Verification Code"
    const html = renderTemplate(tpl?.html ?? DEFAULT_OTP_HTML, {
      email: normalizedEmail,
      otp,
      store_url: storeUrl,
    })

    const emailService = req.scope.resolve<EmailProxyService>(EMAIL_PROXY_MODULE)
    await emailService.sendMail(smtpConfig, normalizedEmail, subject, html).catch((err) => {
      console.error("[EmailOTP] 发送邮件失败:", err)
    })
  } else {
    // 开发模式：打印到日志
    console.log(`[EmailOTP][DEV] OTP for ${normalizedEmail}: ${otp}`)
  }

  return res.json({ success: true })
}

const DEFAULT_OTP_HTML = `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:40px">
  <h2 style="color:#1a1a1a;margin:0 0 16px">邮箱验证码 / Verification Code</h2>
  <p style="color:#374151;margin:0 0 8px">您的验证码（10分钟内有效）：</p>
  <p style="color:#6b7280;font-size:13px;margin:0 0 24px">Your verification code (valid for 10 minutes):</p>
  <div style="background:#f3f4f6;border-radius:6px;padding:16px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:bold;color:#4f46e5">{{otp}}</div>
  <p style="color:#6b7280;font-size:12px;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:16px">
    如非本人操作，请忽略此邮件。<br>If you did not request this, please ignore this email.
  </p>
</div>
`
