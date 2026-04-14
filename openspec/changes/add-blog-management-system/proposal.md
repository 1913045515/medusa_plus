## Why

当前平台缺少博客功能，无法通过内容营销吸引用户和展示课程相关知识。增加完整的博客管理系统，可提升平台内容能力、SEO 排名，并支持对特定用户/用户组的精准内容推送。

## What Changes

- 新增后端 `blog` 模块（文章、分类、标签、用户组、评论、版本历史数据模型）
- 新增 Admin API（`/admin/blogs`、`/admin/blog-categories`、`/admin/blog-tags`、`/admin/blog-user-groups`）
- 新增 Store API（`/store/blogs`、`/store/blog-categories`、`/store/blog-tags`、`/store/blogs/:id/comments`）
- Admin 后台新增博客管理路由（文章列表、编辑器、分类管理、标签管理、用户组管理）
- 前台新增博客列表页（无限滚动）、详情页（TOC、上下篇、相关推荐、评论、社交分享）
- 新增 RSS 订阅端点 `/feed/rss.xml`
- 新增全站博客搜索

## Capabilities

### New Capabilities

- `blog-post`: 博客文章的 CRUD、状态流转（草稿/定时/已发布/归档）、可见范围控制、版本历史、复制
- `blog-category`: 文章分类管理，支持父子层级、slug、描述、封面图
- `blog-tag`: 文章标签管理，多对多关联文章
- `blog-user-group`: 用户组管理，支持将客户添加进组，用于文章可见范围控制
- `blog-comment`: 文章评论（登录用户可发，管理员可审核/删除）
- `blog-reading-tracking`: 阅读数自动累计、预计阅读时长计算
- `blog-seo`: 文章级 SEO 字段（slug、seo_title、seo_description）及 Open Graph 支持
- `blog-rss`: RSS 2.0 订阅端点
- `blog-search`: 基于标题/内容/标签的全文搜索（PostgreSQL full-text）

### Modified Capabilities

（无现有 spec 受影响）

## Non-goals

- 不引入第三方评论服务（Disqus 等）
- 不实现付费内容墙（与课程购买流程分离）
- 不实现多作者协作编辑（实时协同）
- 不实现 AMP 页面

## Impact

- **后端**: 新增 `my-store/src/modules/blog/`，含 migrations；新增 admin/store API 路由
- **前台**: 新增 `my-store-storefront/src/app/[countryCode]/(main)/blog/` 页面组；新增导航菜单 Blog 入口
- **Admin UI**: 新增 `my-store/src/admin/routes/blogs/`，使用 Medusa Admin UI Kit 组件
- **依赖**: 富文本编辑器（TipTap 或 Quill）；sitemap 更新含博客页
- **数据库**: 新增约 8 张表（blog_post、blog_category、blog_tag、blog_post_tag、blog_user_group、blog_user_group_member、blog_comment、blog_post_version）
