// Blog module types

export type BlogPostStatus = "draft" | "scheduled" | "published" | "archived"
export type BlogVisibility = "all" | "user" | "group"
export type BlogCommentStatus = "pending" | "approved" | "rejected"

export interface CreateBlogPostInput {
  title: string
  slug?: string
  excerpt?: string
  content?: string
  cover_image?: string | null
  category_id?: string
  status?: BlogPostStatus
  is_pinned?: boolean
  password?: string
  visibility?: BlogVisibility
  visibility_user_ids?: string[]
  visibility_group_ids?: string[]
  scheduled_at?: Date | null
  allow_comments?: boolean
  seo_title?: string
  seo_description?: string
  author_id?: string
  tag_ids?: string[]
  sort?: number
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  updated_by?: string
}

export interface ListBlogPostsInput {
  status?: BlogPostStatus | BlogPostStatus[]
  category_id?: string
  tag_id?: string
  q?: string
  visibility_customer_id?: string
  visibility_group_ids?: string[]
  page?: number
  limit?: number
  include_deleted?: boolean
  skip_visibility_filter?: boolean
}

export interface CreateBlogCategoryInput {
  name: string
  slug?: string
  description?: string
  cover_image?: string | null
  parent_id?: string
}

export interface CreateBlogTagInput {
  name: string
  slug?: string
  cover_image?: string | null
}

export interface CreateBlogUserGroupInput {
  name: string
  description?: string
}

export interface CreateBlogCommentInput {
  post_id: string
  customer_id: string
  content: string
}
