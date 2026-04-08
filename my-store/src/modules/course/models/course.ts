import { model } from "@medusajs/framework/utils"

const Course = model.define("course", {
  id: model.id().primaryKey(),
  // 一对一关联 Medusa Product
  product_id: model.text().nullable(),
  handle: model.text(),
  title: model.text(),
  description: model.text().nullable(),
  translations: model.json().nullable(),
  thumbnail_url: model.text().nullable(),
  thumbnail_asset: model.json().nullable(),
  level: model.text().nullable(), // "beginner" | "intermediate" | "advanced"
  lessons_count: model.number().default(0),
  status: model.text().default("published"), // "published" | "draft"
  metadata: model.json().nullable(),
})

export default Course
