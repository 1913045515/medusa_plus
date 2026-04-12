import { Module } from "@medusajs/framework/utils"
import StoreSettingsModuleService from "./service"

export const STORE_SETTINGS_MODULE = "storeSettings"

export default Module(STORE_SETTINGS_MODULE, {
  service: StoreSettingsModuleService,
})
