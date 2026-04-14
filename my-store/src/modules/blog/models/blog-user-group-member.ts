import { model } from "@medusajs/framework/utils"

const BlogUserGroupMember = model.define("blog_user_group_member", {
  id: model.id().primaryKey(),
  group_id: model.text(),
  customer_id: model.text(),
})

export default BlogUserGroupMember
