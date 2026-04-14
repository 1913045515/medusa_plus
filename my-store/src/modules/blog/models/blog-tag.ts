import { model } from "@medusajs/framework/utils"

const BlogTag = model.define("blog_tag", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text(),
  cover_image: model.text().nullable(),
  created_by: model.text().nullable(),
  updated_by: model.text().nullable(),
})

export default BlogTag
