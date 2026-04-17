import { model } from "@medusajs/framework/utils"

const ContentPage = model.define("content_page", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text(),
  body: model.text().nullable(),
  status: model.text().default("draft"), // draft | published
  show_in_footer: model.boolean().default(false),
  footer_label: model.text().nullable(),
  sort_order: model.number().default(0),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  published_at: model.dateTime().nullable(),
})

export default ContentPage
