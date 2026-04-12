import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_SETTINGS_MODULE } from "../../../../modules/store-settings"
import StoreSettingsModuleService from "../../../../modules/store-settings/service"
import {
  CheckoutFieldsConfig,
  DEFAULT_CHECKOUT_FIELDS_CONFIG,
} from "../../../../modules/store-settings/checkout-field-defaults"

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
  const settings = await service.listStoreSettings()
  const config = settings.length > 0 ? getConfig(settings[0]) : DEFAULT_CHECKOUT_FIELDS_CONFIG
  res.json({ checkout_fields: config })
}
