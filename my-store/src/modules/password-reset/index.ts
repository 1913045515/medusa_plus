import { Module } from "@medusajs/framework/utils"
import PasswordResetModuleService from "./service"

export const PASSWORD_RESET_MODULE = "passwordResetModuleService"

export default Module(PASSWORD_RESET_MODULE, {
  service: PasswordResetModuleService,
})
