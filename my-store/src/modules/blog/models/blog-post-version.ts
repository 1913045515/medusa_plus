import { model } from "@medusajs/framework/utils"

const BlogPostVersion = model.define("blog_post_version", {
  id: model.id().primaryKey(),
  post_id: model.text(),
  title: model.text(),
  content: model.text().nullable(),
  created_by: model.text().nullable(),
})

export default BlogPostVersion
