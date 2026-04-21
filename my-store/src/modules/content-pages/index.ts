import { Module } from "@medusajs/framework/utils"
import { MedusaService } from "@medusajs/framework/utils"
import ContentPage from "./models/content-page"

class ContentPagesModuleService extends MedusaService({ ContentPage }) {}

export const CONTENT_PAGES_MODULE = "content_pages"

export default Module(CONTENT_PAGES_MODULE, {
  service: ContentPagesModuleService,
})
