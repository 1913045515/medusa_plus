import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STORE_SETTINGS_MODULE } from "../../../modules/store-settings"
import StoreSettingsModuleService from "../../../modules/store-settings/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const settingsService = req.scope.resolve<StoreSettingsModuleService>(STORE_SETTINGS_MODULE)
  const settings = await settingsService.listStoreSettings()

  const cartEnabled = settings.length > 0 ? settings[0].cart_enabled : true

  res.json({ store_settings: { cart_enabled: cartEnabled } })
}
