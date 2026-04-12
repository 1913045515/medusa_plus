## Why

结算页面当前所有字段均为硬编码的显示/必填状态，无法根据业务需求（如虚拟数字课程无需物流地址）灵活调整，导致用户体验冗余且无法针对不同商店做定制化配置。需要在 Admin 中提供统一的结算字段管理入口。

## What Changes

- **新增** Admin 商店设置中的"结算字段配置"模块，可对每个结算字段设置：是否显示（visible）、是否必填（required）
- **新增** 虚拟产品购物车的特殊判断逻辑：当购物车内全为虚拟产品时，自动切换到简化结算模式（仅显示 Email）
- **修改** 前端结算页面（shipping-address、billing-address 组件）根据后端配置动态渲染字段
- **新增** 系统级锁定字段：Email 始终显示且必填，不受配置影响
- 非目标字段（如 Country）因涉及区域计税，仅可设为 optional，不可隐藏

## Capabilities

### New Capabilities

- `checkout-field-config`: Admin 结算字段配置 CRUD，支持字段可见性和必填性控制，含虚拟产品简化模式开关
- `checkout-dynamic-fields`: 前端结算页面根据后端配置动态渲染字段，虚拟购物车自动启用简化模式

### Modified Capabilities

（无已有 spec 变更）

## Impact

- **后端**: `my-store/src/modules/store-settings/` 新增 CheckoutFieldConfig 模型和迁移；新增 Admin API 路由 `/admin/store-settings/checkout-fields`
- **前端**: `my-store-storefront/src/modules/checkout/components/shipping-address/` 和 `billing_address/` 改为动态渲染；新增配置数据获取逻辑
- **Admin 扩展**: `my-store/admin-extensions/` 新增结算配置页面
- **依赖**: 无新增 npm 包

## Non-goals

- 不支持字段顺序拖拽调整
- 不支持自定义添加新字段
- 不处理 Country 字段隐藏（区域计税依赖）
- 不影响已有订单数据
