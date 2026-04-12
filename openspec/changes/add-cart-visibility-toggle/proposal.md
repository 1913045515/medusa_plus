## Why

部分商家希望绕过购物车流程，让用户点击"购买"后直接进入结算页，简化购买路径、提升转化率。当前系统没有全局开关来控制购物车的显示与隐藏，需要一个可配置的功能。

## What Changes

- 新增后端 `store-settings` 模块，存储全局商店配置（首个配置项：`cart_enabled`）
- 新增 Admin API `GET/PUT /admin/store-settings`，供管理员读写配置
- 新增 Store API `GET /store/store-settings`，供前端读取配置（无需鉴权）
- Admin 新增"商店设置"配置页面，提供购物车显示/隐藏的开关
- Storefront 根据配置动态：
  - 隐藏导航栏购物车图标及下拉菜单
  - 将产品页面"加入购物车"按钮改为"立即购买"，点击直接跳转结算页
  - 隐藏移动端购物车入口

## Capabilities

### New Capabilities

- `store-settings`: 后端全局商店配置模块与 API（存储 `cart_enabled` 等设置）
- `cart-visibility-admin`: Admin 配置页面，带购物车显示/隐藏开关
- `cart-visibility-storefront`: Storefront 条件渲染逻辑（隐藏购物车、Buy Now 跳转结算）

### Modified Capabilities

（无现有 spec 需要变更）

## Impact

- **后端**：新增 `my-store/src/modules/store-settings/`，新增 `my-store/src/api/admin/store-settings/` 和 `my-store/src/api/store/store-settings/`
- **Admin**：新增 `my-store/src/admin/routes/store-settings/page.tsx`
- **Storefront**：修改 `layout/components/cart-button`、`layout/components/cart-dropdown`、`products/components/product-actions`、`products/components/product-actions/mobile-actions`

## Non-goals

- 不支持按用户/地区差异化显示购物车
- 不修改结算流程本身
- 不支持多配置版本或历史记录
