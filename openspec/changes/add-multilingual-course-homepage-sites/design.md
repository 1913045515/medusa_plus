## Context

当前仓库已经有两套未闭环的能力：一是 storefront 通过 `countryCode` 路由和 region 映射切换地区、货币和购物车 region；二是 storefront 通过 `_medusa_locale` cookie 和 `x-medusa-locale` 请求头传递语言偏好。但课程、课时、首页内容的数据模型仍是单语字段，后台课程管理和首页管理也没有“按语言编辑”的运营入口，导致前后台都无法真正提供多语言内容。

这次变更同时跨越 Medusa 后端模块、Admin 扩展和 Next.js storefront，且涉及数据模型演进、发布读取规则和既有 region/locale 语义收敛，因此需要先给出统一设计。

## Goals / Non-Goals

**Goals:**
- 为课程、课时、首页内容建立统一的多语言内容表示，并保留当前单语数据的兼容读取。
- 为首页内容增加“按站点发布”的能力，使前台首页在不同站点上下文下读取不同已发布版本。
- 为后台课程与首页编辑器增加业务级语言切换，让运营可在同一条内容上维护多语言版本。
- 将 storefront 的站点上下文定义为 `site + region + locale` 的组合，其中 `site` 由当前 countryCode 映射得到。
- 让前台课程与首页请求按当前 locale/site 返回正确内容，同时不破坏现有购物车、region、价格流程。

**Non-Goals:**
- 不引入独立翻译服务、自动翻译或审核工作流。
- 不替换 Medusa 核心的 translations center，仅在自定义课程与首页模块内落地业务多语言。
- 不实现多域名部署或渠道级 catalog 隔离，本次仍基于当前 countryCode 路由承载站点切换。

## Decisions

### Decision: 业务内容采用“默认字段 + translations 字典”兼容模型

课程、课时和首页内容将保留现有默认语言字段，同时新增 `translations` 结构，键为 locale code，值为对应可翻译字段子集。读取时按“当前 locale → 默认语言字段”的顺序回退。

原因：
- 现有 API、Admin 表单和 seed 数据已围绕默认字段构建，直接拆成多张翻译表会扩大改造面。
- JSON 翻译字典更适合当前仓库已有的 `metadata/jsonb` 风格和轻量 ORM/Knex 访问方式。
- 允许平滑迁移旧数据，不需要先完成一次性数据回填才能上线。

备选方案：
- 独立 translation 表：查询与维护更规范，但当前模块和 Admin UI 尚未抽象到足够稳定的仓储层，会显著增加迁移复杂度。

### Decision: 站点上下文显式建模为 `site_key`，但仍由 countryCode 驱动

首页发布和读取不会直接把 countryCode 当成站点主键，而是增加 `site_key` 概念，并提供 countryCode 到 site_key 的映射规则。初期映射可简单采用 countryCode 本身，后续可扩展为多个国家共用一个站点。

原因：
- 现有 storefront 的 `countryCode` 实际承担 region 入口，不适合作为长期内容站点标识。
- `site_key` 可以为未来“de/at 共用德语站点”之类场景留扩展空间，而不破坏现有路由。

备选方案：
- 直接以 countryCode 作为站点主键：实现最简单，但会把地区和内容站点永久耦合，后续扩展代价更高。

### Decision: 后台语言切换采用业务表单内切换，而不是依赖 Medusa 全局管理后台语言

课程和首页编辑页将提供独立的“内容语言”选择器，用于切换正在编辑的 locale。Medusa Admin 自身界面语言和 Store 支持的 locales 仍继续使用平台已有能力。

原因：
- Admin UI 界面语言切换解决的是控件文案，不等于业务内容编辑语言。
- 业务表单内切换可以在单条课程或首页内容中直观看到各语言版本，符合运营习惯。

备选方案：
- 完全依赖 Medusa translations center：对自定义 JSON 内容的编辑链路不直接适配，落地成本更高。

### Decision: 前台语言切换影响内容读取，前台站点切换影响 region 与 site 读取

`locale` 负责选择课程/首页文案；`countryCode` 负责选择 region、货币、购物车 region，并进一步解析出 `site_key`。首页内容读取同时接受 locale 和 site_key，课程内容读取至少接受 locale。

原因：
- 这样可以避免“切国家就一定切语言”的错误绑定，也能保持当前 storefront 现有 region 机制不变。

## Risks / Trade-offs

- [旧数据没有 translations] → 通过默认字段回退读取，并在后台保存时渐进写入 translations。
- [首页内容既支持 structured 又支持 static_html，翻译字段边界复杂] → 仅对结构化字段和静态模板中明确允许翻译的文案字段做翻译，模板整体 HTML 先按整段多语言版本保存。
- [countryCode 与 site_key 映射规则后续调整] → 将映射逻辑集中在 storefront/后端公共函数中，避免散落到页面与 route。
- [Admin 表单复杂度上升] → 先覆盖课程标题/描述、课时标题/描述、首页结构化文案和模板整段内容，避免一次性引入过细粒度翻译控件。
- [现有 API 使用 scope 单例方式访问 module service] → 保持现有模式，优先做最小改造；若实现过程中暴露一致性问题，再单独整理 route 注入方式。

## Migration Plan

1. 为课程、课时、首页内容表新增多语言与站点相关字段，保持默认值与空值兼容。
2. 更新仓储、服务和 API 响应，使旧数据在无 translations 时仍能按默认字段返回。
3. 更新后台课程和首页编辑 UI，支持 locale 切换与多语言保存。
4. 更新 storefront 数据层，让 locale/site 上下文进入首页和课程读取。
5. 更新 seed/openapi/测试，验证默认语言回退、站点读取和后台保存链路。

回滚策略：
- 代码回滚后，新增字段保留但不被读取；由于仍保留默认字段，旧逻辑可继续工作。

## Open Questions

- 首页静态模板是否需要细粒度字段级翻译，还是按整段 HTML/CSS 版本化即可；当前设计先采用整段 HTML 多语言版本。
- 课程的 `handle` 是否需要站点或语言级差异；当前默认维持全局唯一，不按语言变化。
- 站点配置是否需要独立数据表；本次先以内置映射和首页内容的 `site_key` 支持落地。