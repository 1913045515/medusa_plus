import { model } from "@medusajs/framework/utils"

const BlogPostTag = model.define("blog_post_tag", {
  id: model.id().primaryKey(),
  post_id: model.text(),
  tag_id: model.text(),
})

export default BlogPostTag
