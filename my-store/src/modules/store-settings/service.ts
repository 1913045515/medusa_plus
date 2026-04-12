import { MedusaService } from "@medusajs/framework/utils"
import StoreSetting from "./models/store-setting"

class StoreSettingsModuleService extends MedusaService({
  StoreSetting,
}) {}

export default StoreSettingsModuleService
