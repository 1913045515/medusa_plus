import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_SETTINGS_MODULE } from "../../../../modules/store-settings"
import StoreSettingsModuleService from "../../../../modules/store-settings/service"
import {
  CheckoutFieldsConfig,
  COUNTRY_CODE_LOCKED_VISIBLE,
  DEFAULT_CHECKOUT_FIELDS_CONFIG,
} from "../../../../modules/store-settings/checkout-field-defaults"

const SETTINGS_KEY = "checkout_field_config"

async function getOrCreateSettings(service: StoreSettingsModuleService) {
  const settings = await service.listStoreSettings()
  if (settings.length > 0) return settings[0]
  return await service.createStoreSettings({ cart_enabled: true })
}

function getConfig(setting: any): CheckoutFieldsConfig {
  if (setting.checkout_field_config) {
    try {
      return JSON.parse(setting.checkout_field_config)
    } catch {
      // fall through to default
    }
  }
  return DEFAULT_CHECKOUT_FIELDS_CONFIG
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const setting = await getOrCreateSettings(service)
  const config = getConfig(setting)
  res.json({ checkout_fields: config })
}

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const body = req.body as { checkout_fields: CheckoutFieldsConfig }

  if (!body.checkout_fields) {
    return res.status(400).json({ message: "checkout_fields is required" })
  }

  const incoming = body.checkout_fields

  // 验证 country visible 不可设为 false
  if (
    (incoming.shipping?.country_code && incoming.shipping.country_code.visible === false) ||
    (incoming.billing?.country_code && incoming.billing.country_code.visible === false)
  ) {
    return res.status(422).json({ message: "Country 字段不可隐藏（区域计税依赖）" })
  }

  // 过滤 email 字段（系统锁定）
  const sanitized: CheckoutFieldsConfig = {
    shipping: { ...DEFAULT_CHECKOUT_FIELDS_CONFIG.shipping, ...incoming.shipping },
    billing: { ...DEFAULT_CHECKOUT_FIELDS_CONFIG.billing, ...incoming.billing },
  }

  // 强制 country_code visible = true
  sanitized.shipping.country_code = {
    ...sanitized.shipping.country_code,
    visible: COUNTRY_CODE_LOCKED_VISIBLE,
  }
  sanitized.billing.country_code = {
    ...sanitized.billing.country_code,
    visible: COUNTRY_CODE_LOCKED_VISIBLE,
  }

  const setting = await getOrCreateSettings(service)
  await service.updateStoreSettings({
    id: setting.id,
    checkout_field_config: JSON.stringify(sanitized),
  } as any)

  res.json({ checkout_fields: sanitized })
}
