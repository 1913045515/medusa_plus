## Why

课程模块和首页模块当前都只有单语内容模型，前台虽然已有 locale cookie 与 countryCode 路由，但还没有把语言、站点、区域、发布内容统一为可运营的业务能力。现在继续扩展课程和首页之前，需要先把内容国际化和站点切换补成一套完整链路，否则后台编辑、前台展示和站点路由会持续错位。

## What Changes

- 为课程、课时、首页内容引入可按 locale 读取和维护的多语言内容结构。
- 扩展后台课程与首页管理界面，支持切换编辑语言并保存各语言版本内容。
- 扩展前台请求链路，让课程列表、课程详情和首页内容按当前 locale 返回对应语言版本。
- 将前台“多站点切换”收敛为基于 countryCode/region 的站点上下文，联动地区、货币、购物车 region 和站点内容配置。
- 为首页内容增加按站点维度发布与读取的能力，支持不同站点拥有不同已发布首页。

## Capabilities

### New Capabilities
- `localized-course-content`: 课程与课时支持按 locale 管理和读取标题、描述等文案字段。
- `localized-homepage-content`: 首页模板与结构化首页内容支持按 locale 与站点维度管理、发布和读取。
- `storefront-site-context`: 前台站点上下文统一由 countryCode/region、locale 和站点配置组成，并驱动内容与购物体验切换。

### Modified Capabilities
- None.

## Impact

- 影响后端 `my-store/src/modules/course` 的数据模型、仓储、服务、迁移和 store/admin API。
- 影响后台课程与首页管理路由，以及 Medusa Admin 的语言切换使用方式。
- 影响前台 `my-store-storefront` 的首页、课程页、导航语言切换、国家站点切换和数据请求层。
- 需要补充 API 文档、测试数据和集成/前端数据层测试。

## Non-goals

- 不在本次变更中实现任意语言的自动机器翻译。
- 不重做 Medusa 核心的翻译中心 UI，只在现有课程和首页运营流程内接入所需能力。
- 不引入独立 CMS 或多域名部署编排系统，本次仅覆盖当前仓库内的站点上下文与内容读取能力。