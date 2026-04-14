import { MedusaService } from "@medusajs/framework/utils"

import BlogCategory from "./models/blog-category"
import BlogTag from "./models/blog-tag"
import BlogUserGroup from "./models/blog-user-group"
import BlogUserGroupMember from "./models/blog-user-group-member"
import BlogPost from "./models/blog-post"
import BlogPostTag from "./models/blog-post-tag"
import BlogComment from "./models/blog-comment"
import BlogPostVersion from "./models/blog-post-version"
import BlogPostRead from "./models/blog-post-read"

class BlogModuleService extends MedusaService({
  BlogCategory,
  BlogTag,
  BlogUserGroup,
  BlogUserGroupMember,
  BlogPost,
  BlogPostTag,
  BlogComment,
  BlogPostVersion,
  BlogPostRead,
}) {}

export default BlogModuleService
