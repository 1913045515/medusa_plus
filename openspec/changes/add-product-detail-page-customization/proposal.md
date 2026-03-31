## Why

当前 Storefront 产品详情页使用 Medusa 默认的垂直长列表式图片画廊 + 左侧信息/右侧操作三栏布局，缺少轮播切换、图片放大、富文本产品详情等电商标配功能。后台也没有入口让运营直接编辑富文本产品描述或管理图片排序/主图。需要将产品详情页升级为类似 WordPress/Shopify 风格的「左图轮播 + 右侧标题/描述/富文本详情」布局，并在 Admin 后台集成富文本编辑器与图片管理增强能力。

## What Changes

- 新增后端 `product-detail` 自定义模块（module），持久化产品的 `detail_html` 富文本字段和产品图片的 `is_main` / `sort_order` 扩展元数据。
- 新增 Admin / Store API 路由，支持读写产品富文本与图片元数据。
- 在 Medusa Admin 产品编辑页新增两个独立 Widget：**富文本编辑器**（基于 TipTap，支持可视化与 HTML 源码双模式）和**图片排序/主图管理器**（拖拽排序 + 主图标记）。
- 重写 Storefront 产品详情页为左右分栏布局：左侧 Swiper 轮播 + 图片放大（react-medium-image-zoom），右侧标题 / 简洁描述 / 富文本渲染 / 加购操作。
- 新增 Storefront 富文本默认样式表，覆盖标题、列表、表格、图片对齐等排版。
- 后端富文本保存时做 XSS 过滤（保留安全 HTML 标签），前端渲染也做二次消毒。

## Capabilities

### New Capabilities
- `product-detail-richtext`: 产品富文本详情的存储、Admin 编辑（TipTap 双模式）、Store 读取与安全渲染。
- `product-image-management`: 产品图片主图标记、拖拽排序、前台轮播放大展示。

### Modified Capabilities
- None.

## Impact

- Backend: `my-store/src/modules/product-detail/`、`my-store/src/api/admin/products/`、`my-store/src/api/store/products/`，新增迁移文件。
- Admin: `my-store/src/admin/` 新增 Widget 组件（富文本编辑器 + 图片管理器），需安装 TipTap 相关依赖。
- Storefront: `my-store-storefront/src/modules/products/` 重写模板和组件，需安装 swiper、react-medium-image-zoom。
- API Docs: `my-store/openapi/` 需新增产品富文本与图片元数据相关接口文档。
- i18n: Admin i18n 与 Storefront i18n 需补齐新增 UI 文案的 `en` / `zh-CN` 翻译。

## Non-goals

- 不替换 Medusa 核心产品实体或直接修改核心表；通过自定义模块 + metadata 扩展实现。
- 不引入通用页面搭建器或 CMS 系统，仅面向产品详情这一场景。
- 不支持编辑器内自定义 JavaScript 执行。
- 不在本次变更中实现视频嵌入或 3D 模型预览。
