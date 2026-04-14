import { model } from "@medusajs/framework/utils"

const BlogPost = model.define("blog_post", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text(),
  excerpt: model.text().nullable(),
  content: model.text().nullable(),
  cover_image: model.text().nullable(),
  category_id: model.text().nullable(),
  status: model.text().default("draft"), // draft | scheduled | published | archived
  is_pinned: model.boolean().default(false),
  password: model.text().nullable(),
  visibility: model.text().default("all"), // all | user | group
  visibility_user_ids: model.json().nullable(),
  visibility_group_ids: model.json().nullable(),
  scheduled_at: model.dateTime().nullable(),
  published_at: model.dateTime().nullable(),
  allow_comments: model.boolean().default(true),
  read_count: model.number().default(0),
  word_count: model.number().default(0),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  author_id: model.text().nullable(),
  updated_by: model.text().nullable(),
  sort: model.number().default(0),
})

export default BlogPost
