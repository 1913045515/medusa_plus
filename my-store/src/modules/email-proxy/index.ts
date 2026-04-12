import { Module } from "@medusajs/framework/utils"
import EmailProxyService from "./service"

export const EMAIL_PROXY_MODULE = "emailProxy"

export default Module(EMAIL_PROXY_MODULE, {
  service: EmailProxyService,
})
