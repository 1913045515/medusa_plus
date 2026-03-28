## Why

当前 storefront 首页内容是写死在前端代码里的，运营和后台管理人员无法独立维护首页文案、主视觉、推荐区块和跳转链接。随着课程与商品运营节奏加快，需要把首页展示内容从代码发布中解耦出来，由 admin 后台可视化维护，front 前台只负责读取并渲染。

## What Changes

- 新增首页内容配置能力，支持维护首页 Hero、卖点区块、推荐课程区块和行动按钮。
- 首页内容配置支持多条记录、草稿保存以及发布当前活动版本。
- 新增 admin 端首页内容管理页面，提供结构化表单式可视化编辑与预览。
- 新增 backend 首页内容读写接口，admin 负责写入，storefront 只读获取已发布内容。
- 改造 storefront 首页渲染逻辑，优先使用后台维护的数据，保留安全兜底默认内容。

## Capabilities

### New Capabilities
- `homepage-content-management`: 管理首页展示内容的存储、后台编辑发布、以及前台只读渲染能力。

### Modified Capabilities
- None.

## Impact

- Backend: `my-store` 需要新增首页内容的数据模型、admin/store API 和管理路由。
- Admin: `my-store/src/admin` 需要新增首页内容管理页面。
- Storefront: `my-store-storefront` 首页需要改为请求内容接口并动态渲染。
- API / Docs: 需要补充首页内容的 admin/store 接口说明。

## Non-goals

- 不实现通用页面搭建器、拖拽式低代码编辑器或多页面 CMS。
- 不在本次变更中支持首页区块的无限嵌套、版本回滚或定时发布。
- 不改造商品、课程详情页等其他页面的数据维护方式。