## Context

当前 Storefront 产品详情页（`my-store-storefront/src/modules/products/templates/index.tsx`）使用 Medusa 默认三栏布局：左栏 ProductInfo + ProductTabs、中栏 ImageGallery（垂直长列表）、右栏 ProductActions。没有图片轮播、放大交互或富文本详情能力。后台 Admin 也没有针对产品详情富文本或图片排序的可视化编辑入口。

现有后端通过 `my-store/src/modules/course/` 自定义模块模式（Module/Service/Repository + ORM）向 Store/Admin 暴露 REST API。产品相关的图片管理和基础字段由 Medusa 核心处理。

本次变更需跨 Backend（新模块 + API）、Admin（Widget 扩展）、Storefront（组件重写）三端，但须遵守项目已有的 CONVENTIONS：最小化影响面、i18n 全覆盖、API 调整同步 OpenAPI。

## Goals / Non-Goals

**Goals:**
- 新增 `product-detail` 自定义模块，持久化每个产品的 `detail_html`（富文本）和产品图片的扩展元数据（`is_main`、`sort_order`）。
- 在 Admin 产品编辑页以 Widget 形式嵌入 TipTap 富文本编辑器（可视化 + HTML 源码双模切换）和图片排序/主图管理器。
- 重写 Storefront 产品详情页为「左轮播放大图 + 右信息区」的 WordPress 风格布局。
- 所有新增 UI 文案覆盖 `en` + `zh-CN` 翻译。
- 新增/修改的接口同步到 OpenAPI 文档并通过 lint。

**Non-Goals:**
- 不修改 Medusa 核心 `product` 表，不替换核心产品实体。
- 不引入通用 CMS/拖拽页面构建器。
- 不支持富文本内的 JS 执行、视频嵌入或 3D 预览。
- 不引入额外的文件存储系统，图片上传复用 Medusa 原生 Upload API。

## Decisions

### Decision 1: 使用独立 product-detail 自定义模块而非扩展核心 product table

创建 `my-store/src/modules/product-detail/`，通过 `product_detail` 表保存 `product_id`（一对一外链）+ `detail_html`。图片元数据通过 `product_image_meta` 表以 `image_id` 为键保存 `is_main`、`sort_order`。

原因：
- 项目 CONVENTIONS 要求不直接修改核心代码，采用 Module 扩展方式。
- 一对一扩展表与 Medusa v2 Module 模式一致，迁移独立、回滚简单。

备选方案：
- 直接给产品 `metadata` JSONB 字段塞富文本：字段过大、查询不友好、无法建索引。
- Link 方式关联：语义不够直接，且图片排序需要独立表，两张扩展表已足够。

### Decision 2: Admin 编辑器使用 TipTap（@tiptap/react）

TipTap 基于 ProseMirror，MIT 开源，Tree-shakable，生态成熟，易于与 React 18 + Medusa UI 样式集成。支持 Heading/Bold/Italic/List/Table/Image/Link/TextAlign/CodeBlock 等扩展，也支持 HTML 序列化。

原因：
- 相比 TinyMCE（GPL/商业许可 + iframe 沙箱）更轻量，无需引入外部 CDN + iframe，UI 可直接对齐 Medusa Admin 风格。
- 与项目已有 React 19 不冲突（TipTap v2 兼容 React 18/19）。

备选方案：
- TinyMCE：功能更全但许可和体积问题，Admin iframe 样式难以对齐。
- Quill：不再积极维护，Table 支持弱。

### Decision 3: 图片排序/主图管理采用自定义 Widget + @hello-pangea/dnd

Medusa Admin SDK 支持在产品编辑页注入 Widget（`defineWidgetConfig({ zone: "product.details.after" })`）。拖拽排序使用 `@hello-pangea/dnd`（`react-beautiful-dnd` 的活跃维护 fork，兼容 React 18/19 + StrictMode）。

原因：
- Widget 注入不修改核心 Admin 代码，符合最小化原则。
- @hello-pangea/dnd 相比 react-dnd 开箱即用，拖拽体验更好且与 Medusa Admin 的 UI 集成简单。

### Decision 4: Storefront 图片轮播用 Swiper + react-medium-image-zoom

Swiper 是最流行的触摸友好轮播组件（SSR 友好、缩略图导航内置），react-medium-image-zoom 提供轻量级点击放大预览（无 Portal、无复杂 state）。

原因：
- Swiper 支持 Next.js 15 SSR/RSC（通过 swiper/react），Medusa 官方 storefront 社区也常用。
- react-medium-image-zoom 体积极小（<5KB gzip）且无外部依赖。

### Decision 5: XSS 过滤策略 — 后端写入 + 前端渲染双重消毒

- 后端保存 `detail_html` 时，使用 `sanitize-html` 库执行白名单过滤（仅保留 h1-h6/p/a/img/table/ul/ol/li/blockquote/code/pre/strong/em/u/span + style 属性白名单）。
- 前端渲染时，使用 `DOMPurify`（isomorphic-dompurify）再次消毒后通过 `dangerouslySetInnerHTML` 输出。

原因：
- 双重防线符合项目安全规范（OWASP XSS 防御最佳实践）。
- 白名单远比黑名单安全，且保留了运营所需的排版标签。

### Decision 6: Storefront 产品详情页布局重写为左右分栏

重写 `my-store-storefront/src/modules/products/templates/index.tsx`，改为：
```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────── 50% ────────────────┐ ┌───── 50% ─────────────┐ │
│  │                                     │ │ Product Title (H1)    │ │
│  │  Swiper 主图轮播                     │ │ Price                 │ │
│  │  + 缩略图导航                        │ │ Short Description     │ │
│  │  + 点击放大                          │ │ Variant Selector      │ │
│  │                                     │ │ Add to Cart           │ │
│  └─────────────────────────────────────┘ │ ─────────────────     │ │
│                                          │ Rich Text Detail      │ │
│                                          │ (detail_html render)  │ │
│                                          └───────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                    Related Products                                 │
└─────────────────────────────────────────────────────────────────────┘
```
- PC 端 flex-row 左右分栏；移动端 flex-col 堆叠（图片在上，信息在下）。
- ProductTabs（Material/Shipping）保留在富文本下方作为折叠区域。

## Risks / Trade-offs

- [TipTap bundle size] → 仅加载实际使用的扩展（StarterKit + Table + Image + Link + TextAlign），预估 Admin 增量 ~80KB gzip。通过 dynamic import 进一步削减首屏影响。
- [Swiper SSR 兼容] → Swiper 的 React 组件需要 `'use client'` 指令，在 Next.js 15 RSC 模式下需用客户端组件包裹。不影响 SEO，因为图片仍在 DOM 中。
- [product_image_meta 表依赖 Medusa 核心 image ID] → Medusa 产品图片删了之后 meta 会孤立。通过 API 层在读取时过滤无效记录解决，不做外键级联（避免跨 module 外键）。
- [富文本内嵌图片 URL 的持久性] → 复用 Medusa 文件上传 API，URL 与 Medusa 文件系统生命周期一致。
- [Admin Widget 注入顺序/样式冲突] → 使用 Medusa UI 原生组件 + Tailwind class 保持一致性。

## Migration Plan

1. 创建 `product-detail` 模块：models → migrations → repositories → services → DI entry。
2. 新增 Admin/Store API routes（CRUD detail_html + 图片 meta 读写）。
3. 在 Admin 注入 Widget：富文本编辑器 + 图片管理器。
4. 重写 Storefront 产品详情页组件与样式。
5. 补齐 i18n 翻译、OpenAPI 文档、验证构建通过。

回滚策略：
- 删除自定义模块迁移、Admin Widget 文件、Storefront 组件改动后恢复原有模板即可。核心代码无改动。

## Open Questions

- Medusa v2 产品图片是否已经通过核心 API 返回 `images` 数组含 `id`；若不含需补充 query fields 参数。当前代码中 `product.images` 已可用。
- TipTap 编辑器的图片上传是否直接复用 `/admin/uploads` 还是需要一个 proxy endpoint；优先复用 Medusa 原生上传 API。
- 富文本样式是否需要与 Admin 后台预览保持一致（WYSIWYG）；本次优先保证 Storefront 渲染效果，Admin 编辑器做近似预览。
