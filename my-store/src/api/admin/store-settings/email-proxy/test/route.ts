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

  const settings = await settingsService.listStoreSettings()
  const config = settings.length > 0 ? getSmtpConfig(settings[0]) : null

  if (!config) {
    return res.status(422).json({ success: false, message: "SMTP 配置不完整，请先填写并保存配置" })
  }

  try {
    await emailService.testConnection(config)
    res.json({ success: true, message: "测试邮件发送成功，请检查收件箱" })
  } catch (err: any) {
    res.status(422).json({ success: false, message: err.message ?? "发送失败" })
  }
}

