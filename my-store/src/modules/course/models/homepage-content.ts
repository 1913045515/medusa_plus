import { model } from "@medusajs/framework/utils"

const HomepageContent = model.define("homepage_content", {
  id: model.id().primaryKey(),
  title: model.text(),
  handle: model.text(),
  site_key: model.text().default("default"),
  status: model.text().default("draft"),
  is_active: model.boolean().default(false),
  published_at: model.dateTime().nullable(),
  content: model.json(),
  translations: model.json().nullable(),
  metadata: model.json().nullable(),
})

export default HomepageContent