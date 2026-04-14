import { model } from "@medusajs/framework/utils"

const BlogPostRead = model.define("blog_post_read", {
  id: model.id().primaryKey(),
  post_id: model.text(),
  ip: model.text().nullable(),
  customer_id: model.text().nullable(),
})

export default BlogPostRead
