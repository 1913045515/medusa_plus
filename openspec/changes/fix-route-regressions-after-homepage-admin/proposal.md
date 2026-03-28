## Why

最近的首页后台扩展上线后，前台账户地址页和 Admin 的部分核心页面出现了 404 回归，影响用户自助管理地址和后台日常运营。这个问题需要尽快修复，并明确约束后续自定义路由扩展不能破坏既有核心导航。

## What Changes

- 修复 storefront 账户中心地址页的路由装配问题，确保直接访问和站内跳转都能稳定打开。
- 修复 Admin 在存在本地扩展路由时对核心产品、设置等页面的可访问性回归。
- 补充针对路由稳定性的实现约束和验证要求，避免后续首页扩展再次影响现有页面。

## Capabilities

### New Capabilities
- `route-stability`: 保障 storefront 账户路由和 Medusa Admin 核心路由在本地扩展存在时仍可正常访问。

### Modified Capabilities
- None.

## Impact

- Storefront: my-store-storefront 需要调整 account 并行路由结构。
- Admin: my-store 需要验证并恢复 Admin 核心页面在自定义扩展存在时的可访问性。
- Validation: 需要补充对关键入口路径的回归验证。

## Non-goals

- 不改造账户中心或 Admin 的信息架构。
- 不新增新的账户功能或新的 Admin 扩展页面。
- 不处理与本次 404 回归无关的历史类型错误或构建告警。