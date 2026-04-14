## 1. 后端模块脚手架

- [x] 1.1 创建 `my-store/src/modules/blog/` 目录结构（index.ts、types.ts、service.ts、models/、migrations/、repositories/）
- [x] 1.2 在 `my-store/medusa-config.ts` 中注册 blog 模块
- [x] 1.3 安装 TipTap 相关依赖（仅前台/Admin）到对应 package.json

## 2. 数据模型 & Migration

- [x] 2.1 创建 `models/blog-category.ts`（id、name、slug、description、cover_image、parent_id、created_at、updated_at）
- [x] 2.2 创建 `models/blog-tag.ts`（id、name、slug、created_at、updated_at）
- [x] 2.3 创建 `models/blog-user-group.ts`（id、name、description、created_at、updated_at）
- [x] 2.4 创建 `models/blog-user-group-member.ts`（id、group_id、customer_id、created_at）
- [x] 2.5 创建 `models/blog-post.ts`（所有核心字段，含 visibility_user_ids jsonb、visibility_group_ids jsonb、scheduled_at、is_pinned、password、slug、seo_title、seo_description、allow_comments、read_count、word_count、deleted_at）
- [x] 2.6 创建 `models/blog-post-tag.ts`（多对多关联表：post_id、tag_id）
- [x] 2.7 创建 `models/blog-comment.ts`（id、post_id、customer_id、content、status、created_at、updated_at）
- [x] 2.8 创建 `models/blog-post-version.ts`（id、post_id、title、content、created_at、created_by）
- [x] 2.9 创建 `models/blog-post-read.ts`（id、post_id、ip、customer_id、created_at——用于阅读去重）
- [x] 2.10 编写 migration 文件，建表、建索引（slug UNIQUE、tsvector GIN 索引、visibility_user_ids/group_ids GIN 索引）、down() 方法

## 3. 后端 Service 层

- [x] 3.1 实现 `BlogService.createPost()`，含 slug 自动生成、word_count 计算、版本快照逻辑
- [x] 3.2 实现 `BlogService.updatePost()`，含版本快照（>50 条自动清理旧版本）
- [x] 3.3 实现 `BlogService.publishPost()` 和 `BlogService.archivePost()` 状态流转
- [x] 3.4 实现 `BlogService.duplicatePost()`（复制文章，slug 追加随机后缀）
- [x] 3.5 实现 `BlogService.softDeletePost()`（设置 deleted_at）
- [x] 3.6 实现 `BlogService.listPosts()`，含可见范围过滤、置顶排序、分页
- [x] 3.7 实现分类 CRUD：`createCategory()`、`updateCategory()`、`deleteCategory()`（含文章数校验）
- [x] 3.8 实现标签 CRUD：`createTag()`、`updateTag()`、`deleteTag()`
- [x] 3.9 实现用户组 CRUD + 成员管理：`createGroup()`、`addMember()`、`removeMember()`、`deleteGroup()`（含引用清理）
- [x] 3.10 实现 `BlogService.recordView()`（去重逻辑：24h 内同 IP 同文章仅计一次，原子加 read_count）
- [x] 3.11 实现评论 CRUD：`createComment()`、`approveComment()`、`rejectComment()`、`deleteComment()`
- [x] 3.12 实现 `BlogService.restoreVersion()`（恢复历史版本）
- [x] 3.13 实现全文搜索方法（tsvector + 中文 ILIKE 降级）

## 4. Admin API 路由

- [x] 4.1 创建 `src/api/admin/blogs/route.ts`（GET 列表、POST 创建）
- [x] 4.2 创建 `src/api/admin/blogs/[id]/route.ts`（GET、PATCH、DELETE）
- [x] 4.3 创建 `src/api/admin/blogs/[id]/duplicate/route.ts`（POST 复制）
- [x] 4.4 创建 `src/api/admin/blogs/[id]/versions/route.ts`（GET 版本列表、POST 恢复版本）
- [x] 4.5 创建 `src/api/admin/blogs/[id]/comments/route.ts`（GET、PATCH 审核、DELETE）
- [x] 4.6 创建 `src/api/admin/blog-categories/route.ts` 和 `[id]/route.ts`
- [x] 4.7 创建 `src/api/admin/blog-tags/route.ts` 和 `[id]/route.ts`
- [x] 4.8 创建 `src/api/admin/blog-user-groups/route.ts` 和 `[id]/route.ts`
- [x] 4.9 创建 `src/api/admin/blog-user-groups/[id]/members/route.ts`（POST 添加、DELETE 移除成员）

## 5. Store API 路由

- [x] 5.1 创建 `src/api/store/blogs/route.ts`（GET 列表，含 q 搜索、category、tag 筛选、分页）
- [x] 5.2 创建 `src/api/store/blogs/[id]/route.ts`（GET 详情，含可见范围校验、密码校验）
- [x] 5.3 创建 `src/api/store/blogs/[id]/view/route.ts`（POST 记录阅读，去重逻辑）
- [x] 5.4 创建 `src/api/store/blogs/[id]/related/route.ts`（GET 相关文章，最多3篇）
- [x] 5.5 创建 `src/api/store/blogs/[id]/adjacent/route.ts`（GET 上一篇/下一篇）
- [x] 5.6 创建 `src/api/store/blogs/[id]/comments/route.ts`（GET approved 评论、POST 提交评论）
- [x] 5.7 创建 `src/api/store/blog-categories/route.ts` 和 `[slug]/route.ts`
- [x] 5.8 创建 `src/api/store/blog-tags/route.ts` 和 `[slug]/route.ts`

## 6. 定时发布 Job

- [x] 6.1 创建 `src/jobs/publish-scheduled-blogs.ts`（Medusa scheduled job，每分钟执行，扫描 status=scheduled AND scheduled_at <= now()，批量改为 published）

## 7. Admin UI — 文章管理

- [x] 7.1 创建 `src/admin/routes/blogs/page.tsx`（文章列表页：分页表格、状态/分类/标签筛选器、搜索框、批量操作栏）
- [x] 7.2 创建 `src/admin/routes/blogs/new/page.tsx`（新建文章页，含 TipTap 编辑器）
- [x] 7.3 创建 `src/admin/routes/blogs/[id]/edit/page.tsx`（编辑文章页）
- [x] 7.4 实现文章编辑器组件（TipTap 富文本、封面图上传、分类/标签选择、可见范围配置、SEO 字段、定时发布设置、置顶/密码保护开关）
- [x] 7.5 实现文章状态操作按钮（保存草稿、发布、归档、复制、删除、预览）
- [x] 7.6 实现版本历史侧边栏（列出历史版本、点击恢复、显示保存时间）

## 8. Admin UI — 分类/标签/用户组管理

- [x] 8.1 创建 `src/admin/routes/blog-categories/page.tsx`（分类列表 + 新建/编辑对话框，含父分类选择）
- [x] 8.2 创建 `src/admin/routes/blog-tags/page.tsx`（标签列表 + 新建/编辑对话框）
- [x] 8.3 创建 `src/admin/routes/blog-user-groups/page.tsx`（用户组列表）
- [x] 8.4 创建 `src/admin/routes/blog-user-groups/[id]/page.tsx`（用户组详情：成员列表、搜索添加/移除成员）

## 9. Admin UI — 评论管理

- [x] 9.1 在文章编辑页添加评论 Tab（显示 pending/approved/rejected 评论列表）
- [x] 9.2 实现批准/拒绝/删除评论操作

## 10. 前台 — 博客列表页

- [x] 10.1 创建 `my-store-storefront/src/app/[countryCode]/(main)/blog/page.tsx`（博客列表首页，SSR 首屏 + 客户端无限滚动）
- [x] 10.2 实现博客文章卡片组件（封面图、标题、摘要、分类、标签、阅读时长、发布时间、作者）
- [x] 10.3 实现置顶文章突出展示（不同样式的卡片或 Banner）
- [x] 10.4 实现搜索框（URL 参数 q，回车触发搜索）
- [x] 10.5 创建分类归档页 `blog/category/[slug]/page.tsx`（按分类筛选文章）
- [x] 10.6 创建标签归档页 `blog/tag/[slug]/page.tsx`（按标签筛选文章）

## 11. 前台 — 博客详情页

- [x] 11.1 创建 `my-store-storefront/src/app/[countryCode]/(main)/blog/[slug]/page.tsx`（SSR，含 generateMetadata）
- [x] 11.2 实现文章内容渲染（dangerouslySetInnerHTML + DOMPurify 清理 XSS）
- [x] 11.3 实现自动生成 TOC（解析 h2/h3，浮动侧边栏，平滑滚动，移动端折叠）
- [x] 11.4 实现上一篇/下一篇导航组件
- [x] 11.5 实现相关文章推荐区块（最多3篇卡片）
- [x] 11.6 实现评论区（显示 approved 评论列表、已登录用户提交评论表单）
- [x] 11.7 实现社交分享按钮（复制链接、Twitter/X、Facebook、微博、微信二维码弹窗）
- [x] 11.8 实现密码保护表单（密码错误时显示输入框，正确后渲染内容）
- [x] 11.9 实现预计阅读时长显示
- [x] 11.10 实现面包屑导航（首页 > 博客 > 分类 > 文章标题）
- [x] 11.11 调用 `POST /store/blogs/:id/view` 记录阅读（页面加载后触发，客户端）

## 12. 前台 — 导航菜单

- [x] 12.1 在主导航（`my-store-storefront/src/modules/layout/`）添加 Blog 菜单入口，链接至 `/blog`

## 13. SEO & RSS & Sitemap

- [x] 13.1 在 `my-store-storefront/src/app/[countryCode]/(main)/blog/[slug]/page.tsx` 的 `generateMetadata` 中输出 seo_title、seo_description、og:image、twitter:card 等元标签
- [x] 13.2 创建 RSS 路由 `my-store-storefront/src/app/feed/rss.xml/route.ts`（生成 RSS 2.0 XML，Cache-Control: max-age=600）
- [x] 13.3 更新 `my-store-storefront/next-sitemap.js`，在 additionalPaths 中添加博客文章及分类 URL

## 14. 测试 & 验证

- [x] 14.1 运行 `medusa db:migrate` 验证 migration 无错误，down() 可回滚
- [x] 14.2 用 Postman/curl 验证所有 Admin API 端点的 CRUD 操作
- [x] 14.3 验证可见范围过滤：all / 指定用户 / 用户组三种场景
- [x] 14.4 验证定时发布 Job 工作正常（手动设 scheduled_at 为过去时间触发）
- [x] 14.5 验证阅读去重逻辑（同 IP 24h 内只计一次）
- [x] 14.6 访问 `/feed/rss.xml` 验证 RSS XML 格式合法
- [x] 14.7 验证文章详情页 OG 元标签输出正确
- [x] 14.8 验证 XSS 防护（在 content 中注入 `<script>alert(1)</script>` 确认被清理）
- [x] 14.9 端到端验证：新建文章 → 发布 → 前台可见 → 阅读计数 → 评论提交 → 管理员审核
