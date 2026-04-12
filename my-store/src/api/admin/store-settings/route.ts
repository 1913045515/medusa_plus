import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_SETTINGS_MODULE } from "../../../modules/store-settings"
import StoreSettingsModuleService from "../../../modules/store-settings/service"

async function getOrCreateSettings(service: StoreSettingsModuleService) {
  const settings = await service.listStoreSettings()
  if (settings.length > 0) {
    return settings[0]
  }
  return await service.createStoreSettings({ cart_enabled: true })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const settingsService = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const setting = await getOrCreateSettings(settingsService)
  res.json({ store_settings: { cart_enabled: setting.cart_enabled } })
}

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const settingsService = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const body = req.body as { cart_enabled?: boolean }

  const setting = await getOrCreateSettings(settingsService)
  const updated = await settingsService.updateStoreSettings({
    id: setting.id,
    cart_enabled: body.cart_enabled ?? setting.cart_enabled,
  })
  res.json({ store_settings: { cart_enabled: updated.cart_enabled } })
}
