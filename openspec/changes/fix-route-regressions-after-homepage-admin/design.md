## Context

当前 storefront 的 account 页面使用 Next.js App Router 并行路由槽位 `@dashboard` 和 `@login`。目录下缺少对应的 `default.tsx`，这会导致在刷新或直接访问子路径时，未命中的槽位无法回退，从而出现 404。与此同时，用户反馈 Medusa Admin 的产品和设置页面在最近添加首页扩展后出现 404。直接请求这些 URL 仍能拿到 200 HTML，因此更像是 Admin 前端路由装配或构建产物回归，而不是服务端路由缺失。

## Goals / Non-Goals

**Goals:**
- 让 `/[countryCode]/account/addresses` 在直接访问和站内跳转下都稳定可用。
- 恢复 Admin 核心页面在自定义扩展存在时的可访问性。
- 将这类路由回归的最小防护要求固化到变更中。

**Non-Goals:**
- 不重写 storefront account 布局。
- 不调整 Admin 扩展路由的业务行为。
- 不修复与当前回归无关的项目构建错误。

## Decisions

### 1. 为 account 并行路由槽位补 `default.tsx`
Next.js 并行路由在某个槽位没有命中时，需要显式 default 回退页，否则深链访问时可能直接进入 404。这里采用最小修复：为 `@dashboard` 和 `@login` 都补默认文件，分别回退到各自首页。

备选方案：
- 改回普通嵌套路由。改动面更大，会影响现有 layout 结构，不采用。

### 2. Admin 采用“源代码不变更路由语义，重建生成产物并验证核心路径”策略
当前没有发现自定义 Admin 路由在源码层面覆盖 `/products` 或 `/settings` 的证据；核心页面 HTTP 入口正常，因此优先将问题视为本地扩展变更后的前端构建产物回归。修复手段是做一次干净重建并重启 Medusa 服务，同时保留源码级别的最小变更范围。

备选方案：
- 调整已有 homepage/courses 扩展路径或菜单配置。缺少证据表明这是根因，先不做破坏性调整。

## Risks / Trade-offs

- [Admin 404 仅在浏览器态复现] -> 通过重建和关键 URL 验证降低不确定性，并避免无依据改动源码。
- [并行路由默认页选择错误] -> 默认页分别指向现有 dashboard 首页和 login 页，保持现有交互语义。
- [生成产物修复不可持续] -> 在 spec 中补充“核心路由不得被本地扩展破坏”的约束，后续变更需要回归验证。