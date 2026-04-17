import { MedusaService } from "@medusajs/framework/utils"
import { Module } from "@medusajs/framework/utils"
import MenuItem from "./models/menu-item"

class MenuModuleService extends MedusaService({ MenuItem }) {}

export const MENU_MODULE = "menu"

export default Module(MENU_MODULE, {
  service: MenuModuleService,
})
