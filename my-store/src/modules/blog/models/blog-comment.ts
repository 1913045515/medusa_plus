import { model } from "@medusajs/framework/utils"

const BlogComment = model.define("blog_comment", {
  id: model.id().primaryKey(),
  post_id: model.text(),
  customer_id: model.text(),
  content: model.text(),
  status: model.text().default("pending"), // pending | approved | rejected
})

export default BlogComment
