## Context

平台当前使用 Medusa v2 后端 + Next.js 15 前台，已有 course、homepage-content、site-analytics 等自定义模块。博客系统将作为新的独立模块加入，遵循现有模块开发规范（`model.define` → service → migration → API route → Admin UI route）。

已有模式参考：
- 数据模型：`model.define()` via `@medusajs/framework/utils`
- Admin UI：React + Medusa UI Kit（`@medusajs/ui`），文件在 `src/admin/routes/`
- API：`src/api/admin/` 和 `src/api/store/` 下按资源分目录的 Express 路由

## Goals / Non-Goals

**Goals:**
- 实现完整博客模块（9个子能力），在现有约定内交付
- Admin 后台可管理所有博客资源（文章、分类、标签、用户组、评论）
- 前台博客列表/详情页，支持 SSR + 无限滚动、SEO 优化
- 文章可见范围按 all / 单用户 / 用户组三级过滤
- 定时发布由后台 Job 驱动，不依赖外部 cron 服务

**Non-Goals:**
- 实时协同编辑
- 付费内容墙（与课程购买流程分离）
- 引入第三方评论服务
- AMP 页面

## Decisions

### 1. 富文本编辑器：TipTap

**选 TipTap（而非 Quill/Slate）**：TipTap 基于 ProseMirror，生态完善，支持 Headless 模式与 Tailwind 集成，输出标准 HTML，可直接存入 PostgreSQL TEXT 字段。Quill 维护活跃度较低，Slate API 较复杂。

TOC 从存储的 HTML 中提取 h2/h3 标签，无需额外字段。

### 2. 数据模型拆分：9张核心表

```
blog_post            -- 主表（文章）
blog_category        -- 分类（自关联 parent_id 实现层级）
blog_tag             -- 标签
blog_post_tag        -- 文章-标签 多对多
blog_user_group      -- 用户组
blog_user_group_member -- 用户组成员（关联 customer.id）
blog_comment         -- 评论
blog_post_version    -- 版本历史（每次保存创建快照）
blog_post_read       -- 阅读记录（去重计数，记 ip/customer_id）
```

blog_post 关键字段：
- `status`: `draft | scheduled | published | archived`
- `visibility`: `all | user | group`
- `visibility_user_ids`: jsonb（单用户 ID 列表）
- `visibility_group_ids`: jsonb（用户组 ID 列表）
- `scheduled_at`: timestamptz（定时发布时间）
- `is_pinned`: boolean
- `password`: text nullable（密码保护）
- `slug`: text unique（URL别名）
- `seo_title` / `seo_description`: text

### 3. 定时发布：后台 Job

在 `src/jobs/publish-scheduled-blogs.ts` 添加定时 Job（Medusa v2 scheduled job），每分钟扫描 `status=scheduled AND scheduled_at <= now()`，批量更新为 `published`。无外部依赖。

### 4. 阅读数计数：Store API 端点

前台详情页加载时调用 `POST /store/blogs/:id/view`，后端记录 `blog_post_read`（去重：同一 ip 同一文章 24h 内仅计一次），并原子更新 `blog_post.read_count`。

### 5. 全文搜索：PostgreSQL tsvector

为 `blog_post.title + blog_post.excerpt + blog_post.content` 建 GIN 索引，通过 `to_tsvector` + `plainsearch` 实现搜索。不引入 Elasticsearch，避免运维负担。

### 6. RSS：独立 Next.js Route Handler

在 `my-store-storefront/src/app/feed/rss.xml/route.ts`（Next.js Route Handler）生成 RSS 2.0 XML，读取最新 20 篇已发布公开文章。

### 7. 评论审核：简单标志位

`blog_comment.status`: `pending | approved | rejected`。Admin 可在文章详情页批量审核。前台仅显示 `approved` 评论。不做嵌套评论（一级评论）。

### 8. 版本历史存储策略

每次保存（含自动保存）在 `blog_post_version` 插入一条记录，保存 `title + content`，保留最近 50 个版本，超出自动删除最旧版本。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| TipTap 生成 HTML XSS | 前台渲染时使用 `dompurify` 或 Next.js `dangerouslySetInnerHTML` 配合 CSP |
| 大量版本历史占用磁盘 | 每篇文章保留最近 50 个版本，超出自动清理 |
| PostgreSQL 全文搜索中文支持差 | 添加 zhparser / pg_jieba 扩展，或使用 LIKE 模糊匹配作为降级方案 |
| 定时发布精度（±1分钟） | 业务可接受；如需精确可改用 pg_cron |
| 可见范围查询性能 | visibility=all 走普通索引；user/group 查询使用 jsonb @> 操作符配合 GIN 索引 |
| Admin 富文本编辑器包体积 | TipTap 按需引入扩展，code splitting 隔离 |

## Migration Plan

1. 添加 migration 文件（`src/modules/blog/migrations/`），创建所有表和索引
2. 部署后端，执行 `medusa db:migrate`
3. 部署前台（含新 blog 页面和导航菜单）
4. 回滚：migration 包含 `down()` 方法，可 DROP 所有 blog_ 表

## Open Questions

- 中文全文搜索是否要求精确分词（决定是否安装 zhparser）？
- 评论是否需要邮件通知作者？（可通过现有 email-proxy 模块扩展）
- 社交分享按钮是否需要微博/微信，或仅 Twitter/Facebook/链接复制？
