## Context

结算页面当前字段完全硬编码在前端组件中（`shipping-address/index.tsx`、`billing_address/index.tsx`），所有字段的显示状态和必填状态均无法通过配置改变。项目已有 `store-settings` 模块作为通用商店设置存储，可在此基础上扩展结算字段配置。

当前 `store-settings` 模块已有 `StoreSetting` 模型（key-value 结构），可复用其模式存储 JSON 格式的字段配置。

## Goals / Non-Goals

**Goals:**
- Admin 中提供结算字段可见性和必填性的统一配置界面
- 前端根据配置动态渲染字段（是否显示、是否 required）
- 虚拟购物车（所有商品为虚拟产品）自动简化模式：仅展示 Email
- Email 字段为系统级锁定，始终显示且必填，不受配置控制
- Country 字段仅可控制 required，不可设置为隐藏（区域计税依赖）

**Non-Goals:**
- 字段顺序拖拽
- 自定义新增字段
- 多商店多配置（单一全局配置）
- 影响已有订单数据

## Decisions

### 决策 1：配置存储方式 - JSON 列 vs 多行记录

**选择**: 在 `store-settings` 模块新增 `checkout_field_config` key，值为 JSON 字符串存储各字段配置。

**理由**: 结算字段数量固定（~10个），JSON 单行存储查询简单，无需复杂关联查询。若用多行记录，需要 batch 查询并 merge，收益不足。

**备选**: 新建独立表 `checkout_field_config`，每字段一行 — 过度设计，字段数量固定。

### 决策 2：虚拟产品判断位置 - 前端 vs 后端

**选择**: 前端判断（通过购物车商品的 `metadata.is_virtual` 标识）。

**理由**: 购物车数据已在前端可用（`cart.items`），无需额外 API 调用。后端仍可通过配置控制，虚拟模式只是在配置基础上叠加的客户端逻辑。

**备选**: 后端 API 返回时已合并虚拟产品逻辑 — 增加后端耦合，前端仍需感知渲染逻辑。

### 决策 3：配置 API 路径

**选择**: 复用已有 store-settings 路由结构，新增 `/admin/store-settings/checkout-fields` GET/PUT 端点。

**理由**: 与现有 store-settings 模块保持一致，Admin 扩展页面也在相同的设置分组下。

### 决策 4：前端配置获取时机

**选择**: Server Component 在 checkout layout 层面 fetch 一次，通过 props 传递给子组件。

**理由**: 避免每次字段渲染时重复请求。Next.js 15 的 fetch 缓存可覆盖此场景。

## Risks / Trade-offs

- **配置未加载时的降级** → 默认所有字段显示且 required（与当前行为一致），不会造成下单失败
- **虚拟产品 metadata 标识依赖** → 需确保 `virtual-product.ts` 模块中已维护 `is_virtual` 标识；若商品未正确打标，虚拟模式不会触发（安全降级）
- **Country 隐藏限制** → 若管理员误配置需前端强制覆盖，需在 UI 上明确说明该字段不可隐藏

## Migration Plan

1. 新增数据库迁移（`store-settings` 模块无需新表，仅 seed 默认配置 key）
2. 部署后端，Admin 界面自动可见新配置页
3. 前端组件改动为渐进式（配置不存在时回退默认行为）
4. 无需数据迁移脚本

## Open Questions

- 无
