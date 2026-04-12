import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_SETTINGS_MODULE } from "../../../../modules/store-settings"
import StoreSettingsModuleService from "../../../../modules/store-settings/service"
import { SmtpConfig } from "../../../../modules/email-proxy/types"

const CONFIG_KEY = "email_proxy_config"

async function getOrCreateSettings(service: StoreSettingsModuleService) {
  const settings = await service.listStoreSettings()
  if (settings.length > 0) return settings[0]
  return await service.createStoreSettings({ cart_enabled: true })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const setting = await getOrCreateSettings(service)

  let config: Partial<SmtpConfig> = {
    host: "smtp.qq.com",
    port: 465,
    user: "",
    pass: "",
    fromName: "商店通知",
  }

  if ((setting as any).email_proxy_config) {
    try {
      const parsed = JSON.parse((setting as any).email_proxy_config) as SmtpConfig
      config = { ...parsed, pass: "***" } // 遮盖授权码
    } catch {
      // ignore
    }
  }

  res.json({ email_proxy: config })
}

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const body = req.body as { email_proxy: SmtpConfig }

  if (!body.email_proxy) {
    return res.status(400).json({ message: "email_proxy is required" })
  }

  const setting = await getOrCreateSettings(service)

  // 若 pass 为遮盖值，保留原有 pass
  let incoming = { ...body.email_proxy }
  if (incoming.pass === "***") {
    if ((setting as any).email_proxy_config) {
      try {
        const existing = JSON.parse((setting as any).email_proxy_config) as SmtpConfig
        incoming.pass = existing.pass
      } catch {
        // ignore
      }
    }
  }

  await service.updateStoreSettings({
    id: setting.id,
    email_proxy_config: JSON.stringify(incoming),
  } as any)

  res.json({ email_proxy: { ...incoming, pass: "***" } })
}
