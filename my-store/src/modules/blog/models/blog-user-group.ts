import { model } from "@medusajs/framework/utils"

const BlogUserGroup = model.define("blog_user_group", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  created_by: model.text().nullable(),
  updated_by: model.text().nullable(),
})

export default BlogUserGroup
