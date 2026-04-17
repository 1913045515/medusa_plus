## 1. Backend module — model, service, migration

- [x] 1.1 创建 `my-store/src/modules/content-pages/models/content-page.ts`，定义 `content_page` 模型（id、title、slug、body、status、show_in_footer、footer_label、sort_order、seo_title、seo_description、published_at）
- [x] 1.2 创建 `my-store/src/modules/content-pages/services/content-page.service.ts`，实现 list、getBySlug、create、update、delete 方法，list 支持 `show_in_footer`、`status` 过滤和 `sort_order` 排序
- [x] 1.3 创建 `my-store/src/modules/content-pages/index.ts`，导出模块并在 `my-store/medusa-config.ts` 中注册
- [x] 1.4 创建 module migration 文件（`my-store/src/modules/content-pages/migrations/`）生成 `content_page` 表

## 2. Admin API routes

- [x] 2.1 创建 `my-store/src/api/admin/content-pages/route.ts`，实现 `GET`（列表，支持 `q/status/show_in_footer` 参数）和 `POST`（新建，含 slug 唯一性校验 409）
- [x] 2.2 创建 `my-store/src/api/admin/content-pages/[id]/route.ts`，实现 `GET`（单条）、`PUT`（更新，含 body sanitize + slug 唯一性校验）、`DELETE`（删除）
- [x] 2.3 在 `my-store/src/api/middlewares.ts` 中为 `/admin/content-pages*` 添加 `authenticate` 中间件

## 3. Store API routes

- [x] 3.1 创建 `my-store/src/api/store/content-pages/route.ts`，实现 `GET`，固定过滤 `status=published`，支持 `show_in_footer` 参数，按 sort_order 升序排列，仅返回 title、footer_label、slug
- [x] 3.2 创建 `my-store/src/api/store/content-pages/[slug]/route.ts`，实现 `GET`，固定过滤 `status=published`，找不到返回 404，返回 title、body、seo_title、seo_description
- [x] 3.3 在 `my-store/src/api/middlewares.ts` 中为 `/store/content-pages*` 添加 CORS + publishable key 中间件

## 4. Admin UI — content-pages 管理页面

- [x] 4.1 创建 `my-store/src/admin/routes/content-pages/page.tsx`，实现列表视图：展示所有内容页（title、slug、status badge、show_in_footer、sort_order），提供"新建"按钮和每行操作入口
- [x] 4.2 在列表页实现"新建"内联表单或抽屉（title、slug、seo_title、seo_description、show_in_footer、footer_label、sort_order）
- [x] 4.3 在列表页实现"编辑"视图，复用 `TipTapEditor`（from `src/admin/components/blog/TipTapEditor.tsx`）编辑 body 内容，支持保存草稿和发布
- [x] 4.4 在列表/编辑页实现删除确认对话框和 slug 唯一性报错提示
- [x] 4.5 在 Admin 侧边栏注册 content-pages 路由入口（`defineRouteConfig` with label 和图标）

## 5. Storefront — content page 渲染路由

- [x] 5.1 创建 `my-store-storefront/src/app/[countryCode]/(main)/content/[slug]/page.tsx`，服务端请求 `GET /store/content-pages/:slug`，slug 不存在/404 时调用 `notFound()`，渲染 title + body（dangerouslySetInnerHTML）+ meta 标签
- [x] 5.2 创建 `my-store-storefront/src/lib/data/content-pages.ts`，封装 `getContentPage(slug)` 和 `getFooterContentPages()` 两个 fetch 函数（含 `next: { revalidate: 300 }` 缓存）

## 6. Storefront — 页脚集成

- [x] 6.1 修改 `my-store-storefront/src/modules/layout/templates/footer/index.tsx`，调用 `getFooterContentPages()` 获取链接列表，按 sort_order 渲染页脚链接（footer_label 优先，其次 title），API 返回空列表时不渲染该区块

## 7. Storefront — 登录/注册页集成

- [x] 7.1 在 storefront 登录/注册相关页面（`src/app/.../account/` 或 login 组件）中，添加隐私协议和用户协议 checkbox 链接，链接指向 `/[countryCode]/content/privacy-policy` 和 `/[countryCode]/content/terms-of-use`，使用 `LocalizedClientLink` 组件
