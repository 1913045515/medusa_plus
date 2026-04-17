## ADDED Requirements

### Requirement: Admin can create and manage content pages
系统 SHALL 提供 Admin 接口（列表、新建、编辑、删除）管理内容页面，每个页面包含 title、slug、body（富文本 HTML）、status、show_in_footer、footer_label、sort_order、seo_title、seo_description 字段。

#### Scenario: Admin creates a new content page as draft
- **WHEN** 管理员通过 POST `/admin/content-pages` 提交合法的 title 和 slug
- **THEN** 系统创建 status=draft 的内容页并返回 201 及页面对象

#### Scenario: Admin publishes a content page
- **WHEN** 管理员通过 PUT `/admin/content-pages/:id` 将 status 设置为 published
- **THEN** 系统更新 status=published 并设置 published_at 为当前时间

#### Scenario: Admin updates content page body with rich text HTML
- **WHEN** 管理员保存包含合法富文本内容的 body 字段
- **THEN** 系统对 body 进行 sanitize（移除 script、事件属性、javascript: 链接）后持久化

#### Scenario: Admin deletes a content page
- **WHEN** 管理员通过 DELETE `/admin/content-pages/:id` 删除页面
- **THEN** 系统删除该记录并返回 200

#### Scenario: Admin uses duplicate slug
- **WHEN** 管理员创建或更新页面时使用已存在的 slug
- **THEN** 系统返回 409 Conflict 并说明 slug 已被占用

### Requirement: Store API only exposes published content pages
系统 SHALL 在 Store API 中只返回 status=published 的内容页，防止草稿泄露到前台。

#### Scenario: Storefront requests a published page by slug
- **WHEN** 前台调用 GET `/store/content-pages/:slug` 且该 slug 对应已发布页面
- **THEN** 系统返回页面的 title、body、seo_title、seo_description

#### Scenario: Storefront requests a draft or nonexistent page
- **WHEN** 前台调用 GET `/store/content-pages/:slug` 且目标页面不存在或为草稿
- **THEN** 系统返回 404

#### Scenario: Footer queries published footer pages
- **WHEN** 前台调用 GET `/store/content-pages?show_in_footer=true`
- **THEN** 系统返回所有 status=published 且 show_in_footer=true 的页面，按 sort_order 升序排列，每项包含 title、footer_label、slug

### Requirement: Storefront renders content pages at configurable slugs
系统 SHALL 在 Next.js storefront 提供动态路由 `/[countryCode]/content/[slug]`，渲染已发布内容页的 HTML 主体。

#### Scenario: User visits a published content page URL
- **WHEN** 用户访问 `/us/content/privacy-policy` 且该 slug 已发布
- **THEN** 页面渲染 title 作为标题，body HTML 作为内容主体，使用 seo_title/seo_description 作为 meta 标签

#### Scenario: User visits a nonexistent or draft content page URL
- **WHEN** 用户访问 `/us/content/nonexistent-page`
- **THEN** Next.js 返回 404 页面

### Requirement: Footer displays admin-configured content page links
系统 SHALL 在 storefront 页脚展示由 admin 配置的内容页链接列表，链接名称和顺序完全由 admin 控制。

#### Scenario: Footer renders content page links
- **WHEN** storefront Footer 组件加载且存在 show_in_footer=true 的已发布页面
- **THEN** Footer 按 sort_order 渲染每个页面的链接，链接文字优先使用 footer_label，否则使用 title

#### Scenario: Footer with no configured footer pages
- **WHEN** 没有任何 show_in_footer=true 的已发布页面
- **THEN** Footer 正常渲染，不显示内容页链接区块，不报错

### Requirement: Login and register pages reference privacy and terms pages by slug
系统 SHALL 在登录/注册流程中提供隐私协议和用户协议的链接，链接目标通过约定 slug 常量（`privacy-policy`、`terms-of-use`）引用，不硬编码 URL 路径以外的内容。

#### Scenario: Login page displays privacy and terms links
- **WHEN** 用户进入登录或注册页面
- **THEN** 页面显示隐私协议链接（指向 `/[countryCode]/content/privacy-policy`）和用户协议链接（指向 `/[countryCode]/content/terms-of-use`）
