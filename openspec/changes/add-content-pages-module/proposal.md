## Why

网站需要隐私协议、用户协议、关于我们等公共内容页面，这些内容需要由 admin 后台可配置维护，URL 路径可自定义，并能在页脚和登录注册流程中被引用，目前没有任何机制支持此类内容的管理。

## What Changes

- 新增 `content-pages` 后端模块，提供内容页面的存储与 CRUD 接口。
- 新增 Admin 后台"内容页面"管理界面，支持富文本编辑（复用现有 TipTapEditor）、slug 自定义、显示控制。
- 新增 Storefront 动态路由 `/[countryCode]/content/[slug]`，渲染已发布内容页。
- storefront 页脚从 API 读取 `show_in_footer=true` 的页面列表，动态生成页脚链接。
- 登录/注册页通过约定 slug（`privacy-policy`、`terms-of-use`）引用对应页面链接。

## Capabilities

### New Capabilities
- `content-pages`: 内容页面的后端模型、Admin CRUD 界面、Store 只读接口与 Storefront 渲染，覆盖生命周期（草稿 → 发布）和页脚/登录引用集成。

### Modified Capabilities
- 无

## Impact

- **Backend (my-store)**: 新增 `content-pages` 模块（model、service、migration）和 admin/store API 路由。
- **Admin**: 新增 `src/admin/routes/content-pages/` 页面，复用 `TipTapEditor` 组件，无需新增富文本依赖。
- **Storefront**: 新增 `app/[countryCode]/(main)/content/[slug]/page.tsx` 路由；修改 `footer` 组件读取内容页链接；修改登录/注册 checkbox 链接。

## Non-goals

- 不支持多语言版本内容（多语言可作后续变更）。
- 不引入拖拽 page builder 或外部 CMS。
- 不支持内容页嵌套/层级结构。
- 不实现访问权限控制（内容页均为公开可访问）。
