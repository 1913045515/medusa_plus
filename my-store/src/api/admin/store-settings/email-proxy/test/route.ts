import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { EMAIL_PROXY_MODULE } from "../../../../../modules/email-proxy"
import EmailProxyService from "../../../../../modules/email-proxy/service"
import { SmtpConfig } from "../../../../../modules/email-proxy/types"
import { STORE_SETTINGS_MODULE } from "../../../../../modules/store-settings"
import StoreSettingsModuleService from "../../../../../modules/store-settings/service"

function getSmtpConfig(setting: any): SmtpConfig | null {
  if (!(setting as any).email_proxy_config) return null
  try {
    const config: SmtpConfig = JSON.parse((setting as any).email_proxy_config)
    if (process.env.QQ_SMTP_PASS) config.pass = process.env.QQ_SMTP_PASS
    return config
  } catch {
    return null
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const settingsService = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const emailService = req.scope.resolve<EmailProxyService>(EMAIL_PROXY_MODULE)

  // Always load the saved config to get the real (unmasked) pass
  const settings = await settingsService.listStoreSettings()
  const savedConfig = settings.length > 0 ? getSmtpConfig(settings[0]) : null

  // Support testing with an inline config from the request body (unsaved form values)
  const body = req.body as { email_proxy?: SmtpConfig } | undefined
  let config: SmtpConfig | null = null

  if (body?.email_proxy?.host && body?.email_proxy?.user) {
    config = { ...body.email_proxy }
    // If the pass is masked ("***"), restore the real pass from the saved config or env var
    if (!config.pass || config.pass === "***") {
      if (process.env.QQ_SMTP_PASS) {
        config.pass = process.env.QQ_SMTP_PASS
      } else if (savedConfig?.pass) {
        config.pass = savedConfig.pass
      }
    }
  } else if (savedConfig) {
    config = savedConfig
  }

  if (!config || !config.host || !config.user || !config.pass || config.pass === "***") {
    return res.status(422).json({ success: false, message: "SMTP 配置不完整，请先填写并保存配置（授权码不能为空）" })
  }

  try {
    await emailService.testConnection(config)
    res.json({ success: true, message: `测试邮件发送成功，请检查 ${config.user} 的收件箱` })
  } catch (err: any) {
    const msg: string = err.message ?? "发送失败"
    // Provide more actionable hints for common errors
    let hint = ""
    if (msg.includes("Invalid login") || msg.includes("535")) {
      hint = "（授权码错误，请在 QQ 邮箱 → 设置 → 账户 → POP3/SMTP 服务 重新生成授权码）"
    } else if (msg.includes("ETIMEDOUT") || msg.includes("ECONNREFUSED")) {
      hint = "（端口被防火墙屏蔽，建议将端口改为 587 再试）"
    } else if (msg.includes("socket disconnected") || msg.includes("TLS")) {
      hint = "（TLS 握手失败，建议将端口从 465 改为 587 再试）"
    }
    res.status(422).json({ success: false, message: msg + hint })
  }
}

