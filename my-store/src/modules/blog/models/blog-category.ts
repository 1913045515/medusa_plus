import { model } from "@medusajs/framework/utils"

const BlogCategory = model.define("blog_category", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text(),
  description: model.text().nullable(),
  cover_image: model.text().nullable(),
  parent_id: model.text().nullable(),
  created_by: model.text().nullable(),
  updated_by: model.text().nullable(),
})

export default BlogCategory
