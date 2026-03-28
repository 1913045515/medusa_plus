## Why

当前首页内容管理基于固定结构化字段，适合维护少量 Hero 和卡片信息，但不适合承载外部定制的静态电商首页。团队已经明确首页首期不需要与商品、课程等业务数据联动，而是需要在 Admin 后台管理多份静态 HTML 模板，并将其中一份发布为 storefront 当前首页。

## What Changes

- 新增 Admin 静态首页模板管理能力，支持创建、编辑、预览、保存草稿和发布 HTML 模板。
- 首页配置内容从固定结构化区块扩展为模板渲染模式，支持保存 HTML 与配套 CSS。
- storefront 首页改为优先渲染已发布的静态模板，并保留现有默认首页作为兜底。
- Admin 和 Store API 调整为返回模板模式及模板内容，供后台编辑和前台只读渲染。

## Capabilities

### New Capabilities
- `admin-static-homepage-templates`: 管理静态 HTML 首页模板的存储、发布、后台编辑预览以及前台只读渲染。

### Modified Capabilities
- None.

## Impact

- Backend: my-store 需要扩展首页配置数据模型、Admin/Store 接口和发布逻辑。
- Admin: my-store/src/admin 需要把现有首页表单编辑页改造成静态 HTML 模板管理页。
- Storefront: my-store-storefront 首页需要支持模板模式渲染和默认兜底。
- API / Docs: 需要更新首页内容接口文档与模板字段定义。

## Non-goals

- 不接入外部 CMS、拖拽式 page builder 或通用低代码页面搭建器。
- 不支持模板中的自定义 JavaScript 执行。
- 不在本次变更中实现多页面营销站点管理、媒体库或可视化块编辑器。